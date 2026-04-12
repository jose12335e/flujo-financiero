import { useState } from 'react'

import { Card } from '@/components/ui/Card'
import { PageIntro } from '@/components/ui/PageIntro'
import { useFinanceStore } from '@/hooks/useFinanceStore'
import { ExpenseCategoryChart } from '@/features/reports/components/ExpenseCategoryChart'
import { IncomeExpenseChart } from '@/features/reports/components/IncomeExpenseChart'
import { MonthlySnapshotCard } from '@/features/reports/components/MonthlySnapshotCard'
import { formatCurrency, formatMonthLabel, formatPercentage } from '@/utils/format'
import { calculateBudgetStatus, calculateCategorySummary, calculateMonthlySummary } from '@/utils/finance'
import { getIcon } from '@/utils/icons'

export function ReportsPage() {
  const { selectors, state } = useFinanceStore()
  const [requestedMonthKey, setRequestedMonthKey] = useState(selectors.availableMonthKeys[0] ?? selectors.currentMonthKey)
  const selectedMonthKey = selectors.availableMonthKeys.includes(requestedMonthKey)
    ? requestedMonthKey
    : (selectors.availableMonthKeys[0] ?? selectors.currentMonthKey)

  const selectedSummary = calculateMonthlySummary(state.transactions, selectedMonthKey)
  const selectedBudgetStatus = calculateBudgetStatus(state.transactions, state.monthlyBudget, selectedMonthKey)
  const selectedExpenseSummary = calculateCategorySummary(state.transactions, state.categories, {
    monthKey: selectedMonthKey,
    type: 'expense',
  })

  return (
    <div className="space-y-8">
      <PageIntro
        description="Compara ingresos y gastos, revisa el peso de cada categoria y detecta cambios relevantes mes a mes."
        eyebrow="Analisis financiero"
        title="Reportes para entender tu comportamiento financiero"
      />

      <div className="flex flex-col gap-4 rounded-[1.7rem] border border-outline bg-panel p-4 shadow-card sm:rounded-[2rem] sm:p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">Periodo</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">{formatMonthLabel(selectedMonthKey)}</h2>
        </div>
        <select
          className="min-h-12 w-full rounded-2xl border border-outline bg-app-bg px-4 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand sm:w-auto"
          onChange={(event) => setRequestedMonthKey(event.target.value)}
          value={selectedMonthKey}
        >
          {selectors.availableMonthKeys.map((monthKey) => (
            <option key={monthKey} value={monthKey}>
              {formatMonthLabel(monthKey)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <MonthlySnapshotCard
          budgetStatus={selectedBudgetStatus}
          currency={state.currency}
          summary={selectedSummary}
        />
        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">Resumen ejecutivo</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">Indicadores clave</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Insight
              label="Promedio por registro"
              value={formatCurrency(
                selectedSummary.transactionsCount > 0
                  ? (selectedSummary.income + selectedSummary.expenses) / selectedSummary.transactionsCount
                  : 0,
                state.currency,
              )}
            />
            <Insight
              label="Categoria principal"
              value={selectedExpenseSummary[0] ? formatPercentage(selectedExpenseSummary[0].percentage) : '0%'}
            />
            <Insight
              label="Uso del presupuesto"
              value={
                selectedBudgetStatus.limit > 0
                  ? formatPercentage(selectedBudgetStatus.spent / selectedBudgetStatus.limit)
                  : 'Sin limite'
              }
            />
            <Insight label="Balance neto" value={formatCurrency(selectedSummary.balance, state.currency)} />
          </div>
        </Card>
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <ExpenseCategoryChart currency={state.currency} data={selectedExpenseSummary} />
        <IncomeExpenseChart currency={state.currency} data={selectors.monthlySeries} />
      </div>

      <Card>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">Detalle</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">Desglose por categoria</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {selectedExpenseSummary.length === 0 ? (
            <p className="text-sm leading-6 text-text-secondary">
              No hay gastos registrados en el periodo seleccionado. En cuanto tengas egresos, este desglose aparecera
              aqui.
            </p>
          ) : (
            selectedExpenseSummary.map((category) => {
              const Icon = getIcon(category.icon)

              return (
                <div key={category.categoryId} className="rounded-[1.5rem] border border-outline bg-panel-muted p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold text-text-secondary">
                      {formatPercentage(category.percentage)}
                    </span>
                  </div>
                  <p className="mt-4 font-semibold text-text-primary">{category.label}</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-text-primary">
                    {formatCurrency(category.value, state.currency)}
                  </p>
                </div>
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}

function Insight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] bg-panel-muted p-4">
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="mt-2 text-xl font-semibold text-text-primary">{value}</p>
    </div>
  )
}
