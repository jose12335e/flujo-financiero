import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarDays, Landmark, ReceiptText } from 'lucide-react'
import { type DefaultValues, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import type { Category, TransactionFormValues, TransactionType } from '@/types/finance'
import { getCategoriesByType } from '@/utils/finance'

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Ingresa un monto mayor a cero.'),
  categoryId: z.string().min(1, 'Selecciona una categoria.'),
  description: z.string().trim().max(140, 'Maximo 140 caracteres.').default(''),
  date: z
    .string()
    .min(1, 'Selecciona una fecha.')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Ingresa una fecha valida.'),
})

type TransactionFormInput = z.input<typeof transactionSchema>
type TransactionFormOutput = z.output<typeof transactionSchema>

interface TransactionFormProps {
  categories: Category[]
  initialValues?: TransactionFormValues
  isEditing?: boolean
  onCancel?: () => void
  onSubmit: (values: TransactionFormValues) => void
}

const fieldClasses =
  'min-h-12 w-full rounded-2xl border border-outline bg-app-bg px-4 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand'

function getDefaultCategory(categories: Category[], type: TransactionType) {
  return getCategoriesByType(categories, type)[0]?.id ?? ''
}

function getFormDefaults(
  categories: Category[],
  initialValues?: TransactionFormValues,
): DefaultValues<TransactionFormInput> {
  if (initialValues) {
    return initialValues
  }

  return {
    type: 'expense',
    categoryId: getDefaultCategory(categories, 'expense'),
    description: '',
    date: new Date().toISOString().slice(0, 10),
    amount: undefined,
  }
}

export function TransactionForm({
  categories,
  initialValues,
  isEditing = false,
  onCancel,
  onSubmit,
}: TransactionFormProps) {
  const form = useForm<TransactionFormInput, undefined, TransactionFormOutput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: getFormDefaults(categories, initialValues),
  })

  const currentType = useWatch({
    control: form.control,
    name: 'type',
  })
  const availableCategories = getCategoriesByType(categories, currentType)

  useEffect(() => {
    const selectedCategory = form.getValues('categoryId')
    const isCategoryValid = availableCategories.some((category) => category.id === selectedCategory)

    if (!isCategoryValid) {
      form.setValue('categoryId', getDefaultCategory(categories, currentType), { shouldValidate: true })
    }
  }, [availableCategories, categories, currentType, form])

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <div className="grid gap-5 md:grid-cols-2">
        <button
          className={`rounded-[1.6rem] border p-4 text-left transition ${
            currentType === 'expense'
              ? 'border-danger bg-danger-soft text-danger'
              : 'border-outline bg-panel-muted text-text-secondary hover:bg-app-bg'
          }`}
          onClick={() => form.setValue('type', 'expense', { shouldValidate: true })}
          type="button"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ReceiptText className="h-4 w-4" />
            Gasto
          </span>
          <p className="mt-2 text-sm leading-6">Resta del balance y alimenta tus reportes de consumo.</p>
        </button>

        <button
          className={`rounded-[1.6rem] border p-4 text-left transition ${
            currentType === 'income'
              ? 'border-success bg-success-soft text-success'
              : 'border-outline bg-panel-muted text-text-secondary hover:bg-app-bg'
          }`}
          onClick={() => form.setValue('type', 'income', { shouldValidate: true })}
          type="button"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Landmark className="h-4 w-4" />
            Ingreso
          </span>
          <p className="mt-2 text-sm leading-6">Suma al balance y refleja nuevas entradas de dinero.</p>
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
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
          className={`${fieldClasses} min-h-[120px] py-3`}
          placeholder="Ejemplo: alquiler de abril, supermercado, pago de cliente"
          {...form.register('description')}
        />
        <FieldError message={form.formState.errors.description?.message} />
      </label>

      <label className="space-y-2">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
          <CalendarDays className="h-4 w-4 text-text-muted" />
          Fecha
        </span>
        <input className={fieldClasses} type="date" {...form.register('date')} />
        <FieldError message={form.formState.errors.date?.message} />
      </label>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button onClick={onCancel} type="button" variant="secondary">
            Cancelar
          </Button>
        ) : null}
        <Button fullWidth={false} size="lg" type="submit">
          {isEditing ? 'Guardar cambios' : 'Guardar movimiento'}
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
