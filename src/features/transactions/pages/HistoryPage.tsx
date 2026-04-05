import { useDeferredValue } from 'react'
import { useNavigate } from 'react-router-dom'

import { PageIntro } from '@/components/ui/PageIntro'
import { useFinanceStore } from '@/hooks/useFinanceStore'
import { TransactionFilters } from '@/features/transactions/components/TransactionFilters'
import { TransactionList } from '@/features/transactions/components/TransactionList'
import { filterTransactions, sortTransactionsByDate } from '@/utils/finance'

export function HistoryPage() {
  const navigate = useNavigate()
  const { actions, state } = useFinanceStore()
  const deferredQuery = useDeferredValue(state.filters.query)
  const filteredTransactions = filterTransactions(
    sortTransactionsByDate(state.transactions),
    { ...state.filters, query: deferredQuery },
    state.categories,
  )

  const handleDelete = (transactionId: string) => {
    const shouldDelete = window.confirm('Vas a eliminar este movimiento de forma permanente. Deseas continuar?')

    if (shouldDelete) {
      actions.deleteTransaction(transactionId)
    }
  }

  return (
    <div className="space-y-8">
      <PageIntro
        description="Consulta tu historial, filtra por periodo o categoria y manten cada movimiento al dia."
        eyebrow="Historial financiero"
        title="Todos tus movimientos en detalle"
      />

      <TransactionFilters
        categories={state.categories}
        filters={state.filters}
        onChange={actions.setFilters}
        onReset={actions.resetFilters}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">Resultados</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
            {filteredTransactions.length} movimiento{filteredTransactions.length === 1 ? '' : 's'}
          </h2>
        </div>
        <p className="text-sm leading-6 text-text-secondary">
          Ordenados por fecha mas reciente y actualizados al editar o eliminar.
        </p>
      </div>

      <TransactionList
        categories={state.categories}
        currency={state.currency}
        emptyDescription={
          state.transactions.length === 0
            ? 'Registra tu primer ingreso o gasto para empezar a construir tu historial.'
            : 'No encontramos movimientos con los filtros actuales. Ajusta la busqueda o limpia los criterios.'
        }
        emptyTitle={state.transactions.length === 0 ? 'Todavia no hay movimientos' : 'No hay resultados'}
        onDelete={handleDelete}
        onEdit={(transactionId) => navigate(`/registrar/${transactionId}`)}
        transactions={filteredTransactions}
      />
    </div>
  )
}
