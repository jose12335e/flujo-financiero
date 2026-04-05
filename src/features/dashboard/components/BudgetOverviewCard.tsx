import { AlertTriangle, ShieldCheck } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { BudgetStatus } from '@/types/finance'
import { formatCurrency, formatMonthLabel, formatPercentage } from '@/utils/format'

interface BudgetOverviewCardProps {
  budgetStatus: BudgetStatus
  currency: string
}

export function BudgetOverviewCard({ budgetStatus, currency }: BudgetOverviewCardProps) {
  const tone = budgetStatus.isOverLimit ? 'danger' : budgetStatus.isNearLimit ? 'warning' : 'success'

  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">Presupuesto mensual</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
            {formatMonthLabel(budgetStatus.monthKey)}
          </h2>
        </div>
        <Badge variant={tone}>
          {budgetStatus.isOverLimit ? 'Fuera de rango' : budgetStatus.isNearLimit ? 'Atencion' : 'En rango'}
        </Badge>
      </div>

      <div className="mt-6 space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-text-secondary">Gastado en el periodo</p>
            <p className="mt-2 text-3xl font-bold text-text-primary">{formatCurrency(budgetStatus.spent, currency)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-secondary">Limite actual</p>
            <p className="mt-2 text-xl font-semibold text-text-primary">
              {formatCurrency(budgetStatus.limit, currency)}
            </p>
          </div>
        </div>

        <ProgressBar
          tone={budgetStatus.isOverLimit ? 'danger' : budgetStatus.isNearLimit ? 'warning' : 'success'}
          value={budgetStatus.limit > 0 ? Math.min(budgetStatus.progress, 1) : 0}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.4rem] bg-panel-muted p-4">
            <p className="text-sm text-text-secondary">Uso del limite</p>
            <p className="mt-1 text-xl font-semibold text-text-primary">
              {budgetStatus.limit > 0 ? formatPercentage(budgetStatus.spent / budgetStatus.limit) : 'Sin limite'}
            </p>
          </div>
          <div className="rounded-[1.4rem] bg-panel-muted p-4">
            <p className="text-sm text-text-secondary">Margen disponible</p>
            <p className="mt-1 text-xl font-semibold text-text-primary">
              {formatCurrency(Math.max(budgetStatus.remaining, 0), currency)}
            </p>
          </div>
        </div>

        <div className="rounded-[1.4rem] border border-outline bg-app-bg p-4">
          <div className="flex items-start gap-3">
            {budgetStatus.isOverLimit ? (
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
            ) : (
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            )}
            <p className="text-sm leading-6 text-text-secondary">
              {budgetStatus.isOverLimit
                ? 'Tus gastos ya superaron el limite definido para este mes. Conviene revisar las categorias con mayor peso.'
                : budgetStatus.isNearLimit
                  ? 'Estas cerca del limite mensual. Todavia hay margen, pero conviene ajustar el ritmo.'
                  : 'El gasto del periodo se mantiene dentro del rango esperado.'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
