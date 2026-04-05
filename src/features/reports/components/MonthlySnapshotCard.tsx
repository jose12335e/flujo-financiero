import { AlertTriangle, CalendarRange } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { BudgetStatus, MonthlySummary } from '@/types/finance'
import { formatCurrency, formatMonthLabel } from '@/utils/format'

interface MonthlySnapshotCardProps {
  budgetStatus: BudgetStatus
  currency: string
  summary: MonthlySummary
}

export function MonthlySnapshotCard({ budgetStatus, currency, summary }: MonthlySnapshotCardProps) {
  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">Resumen mensual</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
            {formatMonthLabel(summary.monthKey)}
          </h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <CalendarRange className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Metric label="Ingresos" value={formatCurrency(summary.income, currency)} />
        <Metric label="Gastos" value={formatCurrency(summary.expenses, currency)} />
        <Metric label="Balance" value={formatCurrency(summary.balance, currency)} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Badge variant={budgetStatus.isOverLimit ? 'danger' : budgetStatus.isNearLimit ? 'warning' : 'success'}>
          {budgetStatus.isOverLimit
            ? 'Presupuesto superado'
            : budgetStatus.isNearLimit
              ? 'Cerca del limite'
              : 'Comportamiento estable'}
        </Badge>
        <span className="text-sm text-text-secondary">
          {summary.transactionsCount} movimiento{summary.transactionsCount === 1 ? '' : 's'} en el periodo.
        </span>
      </div>

      {budgetStatus.isOverLimit ? (
        <div className="mt-5 rounded-[1.4rem] border border-danger bg-danger-soft p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-danger" />
            <p className="text-sm leading-6 text-danger">
              El gasto del mes ya supera el limite definido. Conviene revisar las categorias con mayor impacto.
            </p>
          </div>
        </div>
      ) : null}
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] bg-panel-muted p-4">
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="mt-2 text-xl font-semibold text-text-primary">{value}</p>
    </div>
  )
}
