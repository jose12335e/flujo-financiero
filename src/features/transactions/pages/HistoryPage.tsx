import { useDeferredValue, useMemo, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { PageIntro } from '@/components/ui/PageIntro'
import { useFinanceStore } from '@/hooks/useFinanceStore'
import { TransactionFilters } from '@/features/transactions/components/TransactionFilters'
import { TransactionList } from '@/features/transactions/components/TransactionList'
import { filterTransactions, sortTransactionsByDate } from '@/utils/finance'

export function HistoryPage() {
  const navigate = useNavigate()
  const { actions, state } = useFinanceStore()
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const deferredQuery = useDeferredValue(state.filters.query)
  const filteredTransactions = filterTransactions(
    sortTransactionsByDate(state.transactions),
    { ...state.filters, query: deferredQuery },
    state.categories,
  )
  const activeFilterCount = useMemo(
    () =>
      [
        state.filters.query.trim() !== '',
        state.filters.type !== 'all',
        state.filters.categoryId !== 'all',
        state.filters.dateFrom !== '',
        state.filters.dateTo !== '',
      ].filter(Boolean).length,
    [state.filters],
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

      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-center justify-between gap-3 rounded-[1.4rem] border border-outline bg-panel p-4 shadow-card">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Resultados</p>
            <p className="mt-1 text-lg font-bold text-text-primary">
              {filteredTransactions.length} movimiento{filteredTransactions.length === 1 ? '' : 's'}
            </p>
          </div>
          <Button className="shrink-0" onClick={() => setIsMobileFiltersOpen(true)} variant="secondary">
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            <span className="text-xs text-text-secondary">{activeFilterCount > 0 ? activeFilterCount : ''}</span>
          </Button>
        </div>

        {activeFilterCount > 0 ? (
          <p className="text-sm text-text-secondary">
            Tienes {activeFilterCount} filtro{activeFilterCount === 1 ? '' : 's'} activo
            {activeFilterCount === 1 ? '' : 's'}.
          </p>
        ) : null}
      </div>

      {isMobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 bg-[rgba(7,17,31,0.55)] p-3 backdrop-blur-sm md:hidden">
          <div className="flex h-full flex-col rounded-[1.8rem] border border-outline bg-app-bg shadow-card">
            <div className="flex items-center justify-between border-b border-outline px-4 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Filtros</p>
                <h2 className="mt-1 text-xl font-bold text-text-primary">Filtrar historial</h2>
              </div>
              <Button onClick={() => setIsMobileFiltersOpen(false)} variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <TransactionFilters
                categories={state.categories}
                className="border-0 bg-transparent p-0 shadow-none"
                filters={state.filters}
                onChange={actions.setFilters}
                onReset={actions.resetFilters}
              />
            </div>

            <div className="border-t border-outline p-4">
              <Button className="w-full" onClick={() => setIsMobileFiltersOpen(false)}>
                Ver {filteredTransactions.length} resultado{filteredTransactions.length === 1 ? '' : 's'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="hidden md:block">
        <TransactionFilters
          categories={state.categories}
          filters={state.filters}
          onChange={actions.setFilters}
          onReset={actions.resetFilters}
        />
      </div>

      <div className="hidden flex-col gap-2 sm:flex-row sm:items-end sm:justify-between md:flex">
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
