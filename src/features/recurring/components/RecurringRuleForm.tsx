import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlarmClock, CalendarDays, Landmark, ReceiptText, Repeat2 } from 'lucide-react'
import { type DefaultValues, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import type { Category, RecurringRuleFormValues, TransactionType } from '@/types/finance'
import { createDefaultRunTime, detectBrowserTimeZone } from '@/utils/recurring'
import { getCategoriesByType } from '@/utils/finance'

const recurringRuleSchema = z
  .object({
    type: z.enum(['income', 'expense']),
    amount: z.coerce.number().positive('Ingresa un monto mayor a cero.'),
    categoryId: z.string().min(1, 'Selecciona una categoria.'),
    description: z.string().trim().min(1, 'Describe el movimiento.').max(140, 'Maximo 140 caracteres.'),
    frequency: z.enum(['once', 'daily', 'weekly', 'monthly']),
    intervalValue: z.coerce.number().int().min(1, 'La frecuencia minima es 1.'),
    startDate: z.string().min(1, 'Selecciona una fecha de inicio.'),
    runTime: z.string().min(1, 'Selecciona una hora.'),
    endDate: z.string().optional().default(''),
    isFixed: z.boolean().default(false),
    isActive: z.boolean().default(true),
    timezone: z.string().min(1),
  })
  .refine((values) => !values.endDate || values.endDate >= values.startDate, {
    message: 'La fecha final debe ser igual o posterior al inicio.',
    path: ['endDate'],
  })

type RecurringRuleFormInput = z.input<typeof recurringRuleSchema>
type RecurringRuleFormOutput = z.output<typeof recurringRuleSchema>

interface RecurringRuleFormProps {
  categories: Category[]
  initialValues?: RecurringRuleFormValues
  isEditing?: boolean
  onCancel?: () => void
  onSubmit: (values: RecurringRuleFormValues) => void
}

const fieldClasses =
  'min-h-12 w-full rounded-2xl border border-outline bg-app-bg px-4 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand'

function getDefaultCategory(categories: Category[], type: TransactionType) {
  return getCategoriesByType(categories, type)[0]?.id ?? ''
}

function getFormDefaults(
  categories: Category[],
  initialValues?: RecurringRuleFormValues,
): DefaultValues<RecurringRuleFormInput> {
  if (initialValues) {
    return initialValues
  }

  return {
    type: 'expense',
    categoryId: getDefaultCategory(categories, 'expense'),
    description: '',
    frequency: 'monthly',
    intervalValue: 1,
    startDate: new Date().toISOString().slice(0, 10),
    runTime: createDefaultRunTime(),
    endDate: '',
    isFixed: true,
    isActive: true,
    timezone: detectBrowserTimeZone(),
  }
}

export function RecurringRuleForm({
  categories,
  initialValues,
  isEditing = false,
  onCancel,
  onSubmit,
}: RecurringRuleFormProps) {
  const form = useForm<RecurringRuleFormInput, undefined, RecurringRuleFormOutput>({
    resolver: zodResolver(recurringRuleSchema),
    defaultValues: getFormDefaults(categories, initialValues),
  })

  const currentType = useWatch({
    control: form.control,
    name: 'type',
  })
  const currentFrequency = useWatch({
    control: form.control,
    name: 'frequency',
  })
  const timezone = useWatch({
    control: form.control,
    name: 'timezone',
  })
  const availableCategories = getCategoriesByType(categories, currentType)

  useEffect(() => {
    const selectedCategory = form.getValues('categoryId')
    const isCategoryValid = availableCategories.some((category) => category.id === selectedCategory)

    if (!isCategoryValid) {
      form.setValue('categoryId', getDefaultCategory(categories, currentType), { shouldValidate: true })
    }
  }, [availableCategories, categories, currentType, form])

  useEffect(() => {
    if (currentFrequency === 'once') {
      form.setValue('intervalValue', 1, { shouldValidate: true })
    }
  }, [currentFrequency, form])

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <button
          className={`rounded-[1.4rem] border p-4 text-left transition sm:rounded-[1.6rem] ${
            currentType === 'expense'
              ? 'border-danger bg-danger-soft text-danger'
              : 'border-outline bg-panel-muted text-text-secondary hover:bg-app-bg'
          }`}
          onClick={() => form.setValue('type', 'expense', { shouldValidate: true })}
          type="button"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ReceiptText className="h-4 w-4" />
            Gasto automatico
          </span>
          <p className="mt-2 text-sm leading-6">Ideal para alquiler, servicios, suscripciones o pagos recurrentes.</p>
        </button>

        <button
          className={`rounded-[1.4rem] border p-4 text-left transition sm:rounded-[1.6rem] ${
            currentType === 'income'
              ? 'border-success bg-success-soft text-success'
              : 'border-outline bg-panel-muted text-text-secondary hover:bg-app-bg'
          }`}
          onClick={() => form.setValue('type', 'income', { shouldValidate: true })}
          type="button"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Landmark className="h-4 w-4" />
            Ingreso automatico
          </span>
          <p className="mt-2 text-sm leading-6">Pensado para salario, rentas, cobros periodicos o entradas fijas.</p>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Monto</span>
          <input
            className={fieldClasses}
            min="0"
            placeholder="0.00"
            step="0.01"
            type="number"
            {...form.register('amount')}
          />
          <FieldError message={form.formState.errors.amount?.message} />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Categoria</span>
          <select className={fieldClasses} {...form.register('categoryId')}>
            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
          <FieldError message={form.formState.errors.categoryId?.message} />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-text-primary">Descripcion</span>
        <textarea
          className={`${fieldClasses} min-h-[110px] py-3`}
          placeholder="Ejemplo: alquiler principal, salario mensual, suscripcion de internet"
          {...form.register('description')}
        />
        <FieldError message={form.formState.errors.description?.message} />
      </label>

      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <label className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Repeat2 className="h-4 w-4 text-text-muted" />
            Frecuencia
          </span>
          <select className={fieldClasses} {...form.register('frequency')}>
            <option value="once">Una sola vez</option>
            <option value="daily">Diaria</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
          </select>
          <FieldError message={form.formState.errors.frequency?.message} />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Intervalo</span>
          <input
            className={fieldClasses}
            min="1"
            readOnly={currentFrequency === 'once'}
            type="number"
            {...form.register('intervalValue')}
          />
          <p className="text-xs text-text-muted">
            {currentFrequency === 'once'
              ? 'No aplica para una ejecucion unica.'
              : currentFrequency === 'daily'
                ? 'Cada cuantos dias se ejecuta.'
                : currentFrequency === 'weekly'
                  ? 'Cada cuantas semanas se ejecuta.'
                  : 'Cada cuantos meses se ejecuta.'}
          </p>
          <FieldError message={form.formState.errors.intervalValue?.message} />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3 md:gap-5">
        <label className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <CalendarDays className="h-4 w-4 text-text-muted" />
            Fecha de inicio
          </span>
          <input className={fieldClasses} type="date" {...form.register('startDate')} />
          <FieldError message={form.formState.errors.startDate?.message} />
        </label>

        <label className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <AlarmClock className="h-4 w-4 text-text-muted" />
            Hora
          </span>
          <input className={fieldClasses} type="time" {...form.register('runTime')} />
          <FieldError message={form.formState.errors.runTime?.message} />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Fecha final</span>
          <input className={fieldClasses} type="date" {...form.register('endDate')} />
          <p className="text-xs text-text-muted">Opcional. Dejalo vacio si debe seguir indefinidamente.</p>
          <FieldError message={form.formState.errors.endDate?.message} />
        </label>
      </div>

      <div className="rounded-[1.5rem] border border-outline bg-panel-muted p-4">
        <p className="text-sm font-semibold text-text-primary">Zona horaria detectada</p>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Esta programacion se ejecutara usando <span className="font-semibold text-text-primary">{timezone}</span>.
        </p>
        <input type="hidden" {...form.register('timezone')} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex items-start gap-3 rounded-[1.5rem] border border-outline bg-panel-muted p-4">
          <input className="mt-1 h-4 w-4 accent-[var(--brand)]" type="checkbox" {...form.register('isFixed')} />
          <div>
            <p className="font-semibold text-text-primary">Marcar como gasto o ingreso fijo</p>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Util para identificar compromisos o entradas recurrentes dentro del panel.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 rounded-[1.5rem] border border-outline bg-panel-muted p-4">
          <input className="mt-1 h-4 w-4 accent-[var(--brand)]" type="checkbox" {...form.register('isActive')} />
          <div>
            <p className="font-semibold text-text-primary">Automatizacion activa</p>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Si esta activa, el sistema generara el movimiento automaticamente al llegar la fecha y hora.
            </p>
          </div>
        </label>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button className="w-full sm:w-auto" onClick={onCancel} type="button" variant="secondary">
            Cancelar
          </Button>
        ) : null}
        <Button className="w-full sm:w-auto" fullWidth={false} size="lg" type="submit">
          {isEditing ? 'Guardar programacion' : 'Crear programacion'}
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
