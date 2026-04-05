import { ArrowDownCircle, ArrowUpCircle, CalendarDays, Wallet } from 'lucide-react'
import { format, parse, subMonths } from 'date-fns'
import { Link } from 'react-router-dom'

import { buttonStyles } from '@/components/ui/buttonStyles'
import { PageIntro } from '@/components/ui/PageIntro'
import { StatCard } from '@/components/ui/StatCard'
import { BudgetOverviewCard } from '@/features/dashboard/components/BudgetOverviewCard'
import { CategoryBreakdownList } from '@/features/dashboard/components/CategoryBreakdownList'
import { RecentTransactionsCard } from '@/features/dashboard/components/RecentTransactionsCard'
import { UpcomingRecurringCard } from '@/features/dashboard/components/UpcomingRecurringCard'
import { useFinanceStore } from '@/hooks/useFinanceStore'
import { formatCurrency, formatMonthLabel } from '@/utils/format'
import { calculateCategorySummary } from '@/utils/finance'

export function DashboardPage() {
  const { selectors, state } = useFinanceStore()
  const currentMonthLabel = formatMonthLabel(selectors.currentMonthKey)
  const previousMonthKey = format(subMonths(parse(selectors.currentMonthKey, 'yyyy-MM', new Date()), 1), 'yyyy-MM')
  const previousMonthLabel = formatMonthLabel(previousMonthKey)
  const previousMonthExpenseSummary = calculateCategorySummary(state.transactions, state.categories, {
    monthKey: previousMonthKey,
    type: 'expense',
  })
  const shouldUsePreviousMonthFallback = selectors.currentMonthSummary.transactionsCount === 0

  return (
    <div className="space-y-8">
      <PageIntro
        action={
          <Link className={buttonStyles({ size: 'lg' })} to="/registrar">
            Nuevo movimiento
          </Link>
        }
        description="Consulta tu balance, el pulso del mes y la actividad reciente desde un unico panel."
        eyebrow="Vista general"
        title="Control financiero en tiempo real"
      >
        <div className="flex flex-wrap gap-3">
          <div className="rounded-full bg-panel px-4 py-2 text-sm text-text-secondary">
            Periodo activo: <span className="font-semibold text-text-primary">{currentMonthLabel}</span>
          </div>
          <div className="rounded-full bg-panel px-4 py-2 text-sm text-text-secondary">
            Movimientos: <span className="font-semibold text-text-primary">{state.transactions.length}</span>
          </div>
          <div className="rounded-full bg-panel px-4 py-2 text-sm text-text-secondary">
            Programados activos: <span className="font-semibold text-text-primary">{selectors.activeAutomaticRulesCount}</span>
          </div>
        </div>
      </PageIntro>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          caption="Disponible despues de ingresos y gastos."
          icon={Wallet}
          title="Balance actual"
          tone="brand"
          value={formatCurrency(selectors.totals.balance, state.currency)}
        />
        <StatCard
          caption="Total acreditado en tus registros."
          icon={ArrowUpCircle}
          title="Ingresos"
          tone="success"
          value={formatCurrency(selectors.totals.income, state.currency)}
        />
        <StatCard
          caption="Total registrado como egreso."
          icon={ArrowDownCircle}
          title="Gastos"
          tone="danger"
          value={formatCurrency(selectors.totals.expenses, state.currency)}
        />
        <StatCard
          caption="Consumo acumulado del periodo activo."
          icon={CalendarDays}
          title="Gasto mensual"
          value={formatCurrency(selectors.currentMonthSummary.expenses, state.currency)}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <BudgetOverviewCard budgetStatus={selectors.budgetStatus} currency={state.currency} />
        <CategoryBreakdownList
          categories={selectors.currentMonthExpenseSummary}
          currency={state.currency}
          fallbackCategories={shouldUsePreviousMonthFallback ? previousMonthExpenseSummary : []}
          fallbackMonthLabel={previousMonthLabel}
          monthLabel={currentMonthLabel}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <UpcomingRecurringCard
          categories={state.categories}
          currency={state.currency}
          rules={selectors.upcomingRecurringRules}
        />
        <RecentTransactionsCard
          categories={state.categories}
          currency={state.currency}
          transactions={selectors.recentTransactions}
        />
      </section>
    </div>
  )
}
