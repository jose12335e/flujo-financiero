import { zodResolver } from '@hookform/resolvers/zod'
import { Calculator, FileText, Landmark, Wallet } from 'lucide-react'
import { type DefaultValues, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import type { SalaryProfileFormValues } from '@/types/finance'

const salaryProfileSchema = z.object({
  grossSalary: z.coerce.number().nonnegative('El sueldo bruto no puede ser negativo.'),
  payFrequency: z.enum(['monthly', 'biweekly', 'weekly']),
  bonuses: z.coerce.number().nonnegative('No puede ser negativo.'),
  overtimePay: z.coerce.number().nonnegative('No puede ser negativo.'),
  otherIncome: z.coerce.number().nonnegative('No puede ser negativo.'),
  notes: z.string().trim().max(240, 'Maximo 240 caracteres.').default(''),
  allowTransactionGeneration: z.boolean(),
})

type SalaryProfileInput = z.input<typeof salaryProfileSchema>
type SalaryProfileOutput = z.output<typeof salaryProfileSchema>

interface SalaryProfileFormProps {
  initialValues?: SalaryProfileFormValues
  onSubmit: (values: SalaryProfileFormValues) => void
}

const fieldClasses =
  'min-h-12 w-full rounded-2xl border border-outline bg-app-bg px-4 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand'

function getDefaultValues(initialValues?: SalaryProfileFormValues): DefaultValues<SalaryProfileInput> {
  if (initialValues) {
    return initialValues
  }

  return {
    grossSalary: undefined,
    payFrequency: 'monthly',
    bonuses: 0,
    overtimePay: 0,
    otherIncome: 0,
    notes: '',
    allowTransactionGeneration: true,
  }
}

export function SalaryProfileForm({ initialValues, onSubmit }: SalaryProfileFormProps) {
  const form = useForm<SalaryProfileInput, undefined, SalaryProfileOutput>({
    resolver: zodResolver(salaryProfileSchema),
    defaultValues: getDefaultValues(initialValues),
  })

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Wallet className="h-4 w-4 text-text-muted" />
            Sueldo bruto
          </span>
          <input className={fieldClasses} min="0" step="0.01" type="number" {...form.register('grossSalary')} />
          <FieldError message={form.formState.errors.grossSalary?.message} />
        </label>

        <label className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Calculator className="h-4 w-4 text-text-muted" />
            Frecuencia de pago
          </span>
          <select className={fieldClasses} {...form.register('payFrequency')}>
            <option value="monthly">Mensual</option>
            <option value="biweekly">Quincenal</option>
            <option value="weekly">Semanal</option>
          </select>
          <FieldError message={form.formState.errors.payFrequency?.message} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Bonificaciones</span>
          <input className={fieldClasses} min="0" step="0.01" type="number" {...form.register('bonuses')} />
          <FieldError message={form.formState.errors.bonuses?.message} />
        </label>
        <label className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Landmark className="h-4 w-4 text-text-muted" />
            Horas extra
          </span>
          <input className={fieldClasses} min="0" step="0.01" type="number" {...form.register('overtimePay')} />
          <FieldError message={form.formState.errors.overtimePay?.message} />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Otros ingresos</span>
          <input className={fieldClasses} min="0" step="0.01" type="number" {...form.register('otherIncome')} />
          <FieldError message={form.formState.errors.otherIncome?.message} />
        </label>
      </div>

      <label className="space-y-2">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
          <FileText className="h-4 w-4 text-text-muted" />
          Notas
        </span>
        <textarea className={`${fieldClasses} min-h-[110px] py-3`} {...form.register('notes')} />
        <FieldError message={form.formState.errors.notes?.message} />
      </label>

      <label className="flex items-start gap-3 rounded-[1.4rem] border border-outline bg-panel-muted p-4">
        <input className="mt-1 h-4 w-4 accent-[var(--color-brand)]" type="checkbox" {...form.register('allowTransactionGeneration')} />
        <span className="text-sm leading-6 text-text-secondary">
          Permitir registrar el sueldo neto estimado como ingreso real cuando lo necesites.
        </span>
      </label>

      <div className="flex justify-end">
        <Button className="w-full sm:w-auto" size="lg" type="submit">
          Guardar perfil salarial
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
