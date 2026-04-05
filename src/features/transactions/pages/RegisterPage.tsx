import { Edit3, Layers3, PlusCircle, TriangleAlert } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageIntro } from '@/components/ui/PageIntro'
import { useFinanceStore } from '@/hooks/useFinanceStore'
import { TransactionForm } from '@/features/transactions/components/TransactionForm'
import type { TransactionFormValues } from '@/types/finance'
import { formatCurrency } from '@/utils/format'
import { getCategoriesByType } from '@/utils/finance'

export function RegisterPage() {
  const navigate = useNavigate()
  const { transactionId } = useParams()
  const { actions, helpers, selectors, state } = useFinanceStore()
  const existingTransaction = transactionId ? helpers.getTransactionById(transactionId) : undefined
  const isEditing = Boolean(transactionId)

  if (transactionId && !existingTransaction) {
    return (
      <EmptyState
        description="El movimiento que intentas editar ya no esta disponible."
        icon={TriangleAlert}
        title="Movimiento no encontrado"
      />
    )
  }

  const initialValues = existingTransaction
    ? {
        type: existingTransaction.type,
        amount: existingTransaction.amount,
        categoryId: existingTransaction.categoryId,
        description: existingTransaction.description,
        date: existingTransaction.date,
      }
    : undefined

  const handleSubmit = (values: TransactionFormValues) => {
    const timestamp = new Date().toISOString()

    if (existingTransaction) {
      actions.updateTransaction({
        ...existingTransaction,
        ...values,
        description: values.description.trim(),
        updatedAt: timestamp,
      })
    } else {
      actions.addTransaction({
        id: crypto.randomUUID(),
        ...values,
        description: values.description.trim(),
        source: 'manual',
        recurringRuleId: null,
        scheduledFor: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
    }

    navigate('/historial')
  }

  return (
    <div className="space-y-8">
      <PageIntro
        description="Registra y actualiza movimientos con un flujo claro, rapido y conectado con el resto de la app."
        eyebrow={isEditing ? 'Editar movimiento' : 'Nuevo movimiento'}
        title={isEditing ? 'Actualiza un movimiento' : 'Registrar un movimiento'}
      />

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              {isEditing ? <Edit3 className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                {isEditing ? 'Editar movimiento' : 'Registrar movimiento'}
              </h2>
              <p className="text-sm text-text-secondary">
                {isEditing
                  ? 'Ajusta los datos necesarios y guarda el cambio.'
                  : 'Completa la informacion para incorporarla al historial, al dashboard y a los reportes.'}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <TransactionForm
              categories={state.categories}
              initialValues={initialValues}
              isEditing={isEditing}
              key={existingTransaction?.id ?? 'new'}
              onCancel={() => navigate('/historial')}
              onSubmit={handleSubmit}
            />
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">Resumen actual</p>
            <h3 className="mt-2 text-2xl font-bold text-text-primary">Balance disponible</h3>
            <p className="mt-4 text-4xl font-bold tracking-tight text-text-primary">
              {formatCurrency(selectors.totals.balance, state.currency)}
            </p>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Cada movimiento impacta en tiempo real el balance, el presupuesto y los reportes.
            </p>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success-soft text-success">
                <Layers3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">Categorias disponibles</h3>
                <p className="text-sm text-text-secondary">La base ya incluye categorias iniciales para ingresos y gastos.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <div>
                <p className="text-sm font-semibold text-text-primary">Ingresos</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {getCategoriesByType(state.categories, 'income').map((category) => (
                    <span key={category.id} className="rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
                      {category.label}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Gastos</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {getCategoriesByType(state.categories, 'expense').map((category) => (
                    <span key={category.id} className="rounded-full bg-danger-soft px-3 py-1 text-xs font-semibold text-danger">
                      {category.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
