import { zodResolver } from '@hookform/resolvers/zod'
import { Calculator, FileText, Shield } from 'lucide-react'
import { type DefaultValues, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import type { SalaryDeductionFormValues } from '@/types/finance'

const deductionSchema = z.object({
  name: z.string().trim().min(2, 'Ingresa un nombre claro.').max(120, 'Maximo 120 caracteres.'),
  type: z.enum(['fixed', 'percentage']),
  value: z.coerce.number().nonnegative('El valor no puede ser negativo.'),
  isActive: z.boolean(),
  isMandatory: z.boolean(),
  frequency: z.enum(['per_period', 'monthly']),
  notes: z.string().trim().max(200, 'Maximo 200 caracteres.').default(''),
})

type SalaryDeductionInput = z.input<typeof deductionSchema>
type SalaryDeductionOutput = z.output<typeof deductionSchema>

interface SalaryDeductionFormProps {
  initialValues?: SalaryDeductionFormValues
  isEditing?: boolean
  onCancel?: () => void
  onSubmit: (values: SalaryDeductionFormValues) => void
}

const fieldClasses =
  'min-h-12 w-full rounded-2xl border border-outline bg-app-bg px-4 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand'

function getDefaultValues(initialValues?: SalaryDeductionFormValues): DefaultValues<SalaryDeductionInput> {
  if (initialValues) {
    return initialValues
  }

  return {
    name: '',
    type: 'fixed',
    value: undefined,
    isActive: true,
    isMandatory: true,
    frequency: 'per_period',
    notes: '',
  }
}

export function SalaryDeductionForm({ initialValues, isEditing = false, onCancel, onSubmit }: SalaryDeductionFormProps) {
  const form = useForm<SalaryDeductionInput, undefined, SalaryDeductionOutput>({
    resolver: zodResolver(deductionSchema),
    defaultValues: getDefaultValues(initialValues),
  })

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Shield className="h-4 w-4 text-text-muted" />
            Nombre del descuento
          </span>
          <input className={fieldClasses} placeholder="Seguro, cooperativa, prestamo..." {...form.register('name')} />
          <FieldError message={form.formState.errors.name?.message} />
        </label>

        <label className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Calculator className="h-4 w-4 text-text-muted" />
            Tipo
          </span>
          <select className={fieldClasses} {...form.register('type')}>
            <option value="fixed">Fijo</option>
            <option value="percentage">Porcentual</option>
          </select>
          <FieldError message={form.formState.errors.type?.message} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Valor</span>
          <input className={fieldClasses} min="0" step="0.01" type="number" {...form.register('value')} />
          <FieldError message={form.formState.errors.value?.message} />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Frecuencia</span>
          <select className={fieldClasses} {...form.register('frequency')}>
            <option value="per_period">Por periodo</option>
            <option value="monthly">Mensual</option>
          </select>
          <FieldError message={form.formState.errors.frequency?.message} />
        </label>
        <label className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <FileText className="h-4 w-4 text-text-muted" />
            Notas
          </span>
          <input className={fieldClasses} {...form.register('notes')} />
          <FieldError message={form.formState.errors.notes?.message} />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-start gap-3 rounded-[1.4rem] border border-outline bg-panel-muted p-4">
          <input className="mt-1 h-4 w-4 accent-[var(--color-brand)]" type="checkbox" {...form.register('isActive')} />
          <span className="text-sm leading-6 text-text-secondary">Descuento activo y considerado en el calculo.</span>
        </label>
        <label className="flex items-start gap-3 rounded-[1.4rem] border border-outline bg-panel-muted p-4">
          <input className="mt-1 h-4 w-4 accent-[var(--color-brand)]" type="checkbox" {...form.register('isMandatory')} />
          <span className="text-sm leading-6 text-text-secondary">Marcar como obligatorio dentro del perfil salarial.</span>
        </label>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button className="w-full sm:w-auto" onClick={onCancel} type="button" variant="secondary">
            Cancelar
          </Button>
        ) : null}
        <Button className="w-full sm:w-auto" type="submit">
          {isEditing ? 'Guardar descuento' : 'Agregar descuento'}
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
