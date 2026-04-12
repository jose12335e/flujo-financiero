import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarDays, CreditCard, FileText, Flag, Landmark, Percent, Wallet } from 'lucide-react'
import { type DefaultValues, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import type { DebtFormValues } from '@/types/finance'

const debtSchema = z.object({
  name: z.string().trim().min(2, 'Ingresa un nombre claro para la deuda.').max(120, 'Maximo 120 caracteres.'),
  type: z.enum(['loan', 'credit_card', 'mortgage', 'vehicle', 'service', 'personal', 'other']),
  originalAmount: z.coerce.number().positive('Ingresa un monto original mayor a cero.'),
  pendingBalance: z.coerce.number().nonnegative('El balance pendiente no puede ser negativo.'),
  monthlyPayment: z.coerce.number().positive('La cuota mensual debe ser mayor a cero.'),
  interestRate: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? null : Number(value)),
    z.number().nonnegative('El interes no puede ser negativo.').nullable(),
  ),
  paymentDay: z.coerce.number().int().min(1, 'Debe ser entre 1 y 31.').max(31, 'Debe ser entre 1 y 31.'),
  startDate: z.string().min(1, 'Selecciona la fecha de inicio.'),
  endDate: z.string().optional().default(''),
  status: z.enum(['active', 'paid', 'paused', 'defaulted']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  notes: z.string().trim().max(240, 'Maximo 240 caracteres.').default(''),
})

type DebtFormInput = z.input<typeof debtSchema>
type DebtFormOutput = z.output<typeof debtSchema>

interface DebtFormProps {
  initialValues?: DebtFormValues
  isEditing?: boolean
  onCancel?: () => void
  onSubmit: (values: DebtFormValues) => void
}

const fieldClasses =
  'min-h-12 w-full rounded-2xl border border-outline bg-app-bg px-4 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand'

const debtTypeLabels: Record<DebtFormValues['type'], string> = {
  loan: 'Prestamo',
  credit_card: 'Tarjeta de credito',
  mortgage: 'Hipoteca',
  vehicle: 'Vehiculo',
  service: 'Servicio',
  personal: 'Personal',
  other: 'Otro',
}

function getDefaultValues(initialValues?: DebtFormValues): DefaultValues<DebtFormInput> {
  if (initialValues) {
    return {
      ...initialValues,
      endDate: initialValues.endDate || '',
    }
  }

  return {
    name: '',
    type: 'loan',
    originalAmount: undefined,
    pendingBalance: undefined,
    monthlyPayment: undefined,
    interestRate: null,
    paymentDay: 15,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    status: 'active',
    priority: 'medium',
    notes: '',
  }
}

export function DebtForm({ initialValues, isEditing = false, onCancel, onSubmit }: DebtFormProps) {
  const form = useForm<DebtFormInput, undefined, DebtFormOutput>({
    resolver: zodResolver(debtSchema),
    defaultValues: getDefaultValues(initialValues),
  })

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit((values) =>
        onSubmit({
          ...values,
          endDate: values.endDate || '',
        }),
      )}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <CreditCard className="h-4 w-4 text-text-muted" />
            Nombre de la deuda
          </span>
          <input className={fieldClasses} placeholder="Ejemplo: prestamo personal, tarjeta principal" {...form.register('name')} />
          <FieldError message={form.formState.errors.name?.message} />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Tipo</span>
          <select className={fieldClasses} {...form.register('type')}>
            {Object.entries(debtTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <FieldError message={form.formState.errors.type?.message} />
        </label>

        <label className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Flag className="h-4 w-4 text-text-muted" />
            Prioridad
          </span>
          <select className={fieldClasses} {...form.register('priority')}>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="critical">Critica</option>
          </select>
          <FieldError message={form.formState.errors.priority?.message} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Landmark className="h-4 w-4 text-text-muted" />
            Monto original
          </span>
          <input className={fieldClasses} min="0" step="0.01" type="number" {...form.register('originalAmount')} />
          <FieldError message={form.formState.errors.originalAmount?.message} />
        </label>

        <label className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Wallet className="h-4 w-4 text-text-muted" />
            Balance pendiente
          </span>
          <input className={fieldClasses} min="0" step="0.01" type="number" {...form.register('pendingBalance')} />
          <FieldError message={form.formState.errors.pendingBalance?.message} />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Cuota mensual</span>
          <input className={fieldClasses} min="0" step="0.01" type="number" {...form.register('monthlyPayment')} />
          <FieldError message={form.formState.errors.monthlyPayment?.message} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Percent className="h-4 w-4 text-text-muted" />
            Interes %
          </span>
          <input className={fieldClasses} min="0" step="0.01" type="number" {...form.register('interestRate')} />
          <FieldError message={form.formState.errors.interestRate?.message} />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Dia de pago</span>
          <input className={fieldClasses} max="31" min="1" step="1" type="number" {...form.register('paymentDay')} />
          <FieldError message={form.formState.errors.paymentDay?.message} />
        </label>

        <label className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <CalendarDays className="h-4 w-4 text-text-muted" />
            Inicio
          </span>
          <input className={fieldClasses} type="date" {...form.register('startDate')} />
          <FieldError message={form.formState.errors.startDate?.message} />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Fin opcional</span>
          <input className={fieldClasses} type="date" {...form.register('endDate')} />
          <FieldError message={form.formState.errors.endDate?.message} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Estado</span>
          <select className={fieldClasses} {...form.register('status')}>
            <option value="active">Activa</option>
            <option value="paid">Pagada</option>
            <option value="paused">Pausada</option>
            <option value="defaulted">En mora</option>
          </select>
          <FieldError message={form.formState.errors.status?.message} />
        </label>

        <label className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <FileText className="h-4 w-4 text-text-muted" />
            Notas
          </span>
          <textarea className={`${fieldClasses} min-h-[120px] py-3`} {...form.register('notes')} />
          <FieldError message={form.formState.errors.notes?.message} />
        </label>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button className="w-full sm:w-auto" onClick={onCancel} type="button" variant="secondary">
            Cancelar
          </Button>
        ) : null}
        <Button className="w-full sm:w-auto" size="lg" type="submit">
          {isEditing ? 'Guardar deuda' : 'Crear deuda'}
        </Button>
      </div>
    </form>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-sm text-danger">{message}</p>
}
