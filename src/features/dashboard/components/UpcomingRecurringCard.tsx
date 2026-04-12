import { AlarmClock } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Category, RecurringRule } from '@/types/finance'
import { cn } from '@/utils/cn'
import { formatCurrency, formatDisplayDateTime } from '@/utils/format'
import { getCategoryById } from '@/utils/finance'

interface UpcomingRecurringCardProps {
  categories: Category[]
  currency: string
  rules: RecurringRule[]
}

export function UpcomingRecurringCard({ categories, currency, rules }: UpcomingRecurringCardProps) {
  if (rules.length === 0) {
    return (
      <EmptyState
        action={
          <Link className={buttonStyles()} to="/programados">
            Crear programacion
          </Link>
        }
        className="h-full"
        description="Cuando actives gastos o ingresos programados, aqui veras las proximas ejecuciones."
        icon={AlarmClock}
        title="Sin programaciones proximas"
      />
    )
  }

  return (
    <Card className="h-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">Programados</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">Proximas ejecuciones</h2>
        </div>
        <Link className={cn(buttonStyles({ variant: 'secondary', size: 'sm' }), 'w-full sm:w-auto')} to="/programados">
          Gestionar
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {rules.map((rule) => {
          const category = getCategoryById(categories, rule.categoryId)

          return (
            <div key={rule.id} className="rounded-[1.4rem] border border-outline bg-panel-muted p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-text-primary">{rule.description}</p>
                    {rule.isFixed ? <Badge variant="warning">Fijo</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">
                    {category?.label ?? 'Categoria'} · {rule.nextRunAt ? formatDisplayDateTime(rule.nextRunAt) : 'Sin fecha'}
                  </p>
                </div>
                <p className={cn('shrink-0 font-semibold', rule.type === 'income' ? 'text-success' : 'text-danger')}>
                  {rule.type === 'income' ? '+' : '-'}
                  {formatCurrency(rule.amount, currency)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
