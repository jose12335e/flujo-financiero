import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarDays, Landmark, StickyNote } from 'lucide-react'
import { type DefaultValues, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import type { DebtPaymentFormValues } from '@/types/finance'

const paymentSchema = z.object({
  amount: z.coerce.number().positive('Ingresa un pago mayor a cero.'),
  paymentDate: z.string().min(1, 'Selecciona la fecha del pago.'),
  notes: z.string().trim().max(140, 'Maximo 140 caracteres.').default(''),
})

type DebtPaymentFormInput = z.input<typeof paymentSchema>
type DebtPaymentFormOutput = z.output<typeof paymentSchema>

interface DebtPaymentFormProps {
  defaultAmount: number
  isSaving?: boolean
  onCancel: () => void
  onSubmit: (values: DebtPaymentFormValues) => void
}

const fieldClasses =
  'min-h-12 w-full rounded-2xl border border-outline bg-app-bg px-4 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand'

export function DebtPaymentForm({ defaultAmount, isSaving = false, onCancel, onSubmit }: DebtPaymentFormProps) {
  const form = useForm<DebtPaymentFormInput, undefined, DebtPaymentFormOutput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: getDefaultValues(defaultAmount),
  })

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Landmark className="h-4 w-4 text-text-muted" />
            Monto
          </span>
          <input className={fieldClasses} min="0" step="0.01" type="number" {...form.register('amount')} />
          <FieldError message={form.formState.errors.amount?.message} />
        </label>
        <label className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <CalendarDays className="h-4 w-4 text-text-muted" />
            Fecha del pago
          </span>
          <input className={fieldClasses} type="date" {...form.register('paymentDate')} />
          <FieldError message={form.formState.errors.paymentDate?.message} />
        </label>
      </div>

      <label className="space-y-2">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
          <StickyNote className="h-4 w-4 text-text-muted" />
          Nota opcional
        </span>
        <textarea
          className={`${fieldClasses} min-h-[100px] py-3`}
          placeholder="Ejemplo: abono extraordinario, cuota de abril"
          {...form.register('notes')}
        />
        <FieldError message={form.formState.errors.notes?.message} />
      </label>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button className="w-full sm:w-auto" onClick={onCancel} type="button" variant="secondary">
          Cancelar
        </Button>
        <Button className="w-full sm:w-auto" disabled={isSaving} type="submit">
          {isSaving ? 'Guardando...' : 'Registrar pago'}
        </Button>
      </div>
    </form>
  )
}

function getDefaultValues(defaultAmount: number): DefaultValues<DebtPaymentFormInput> {
  return {
    amount: defaultAmount,
    paymentDate: new Date().toISOString().slice(0, 10),
    notes: '',
  }
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-sm text-danger">{message}</p>
}
