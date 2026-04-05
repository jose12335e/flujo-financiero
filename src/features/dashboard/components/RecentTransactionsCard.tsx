import { ArrowDownCircle, ArrowUpCircle, ListChecks } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Category, Transaction } from '@/types/finance'
import { cn } from '@/utils/cn'
import { formatCurrency, formatDisplayDate } from '@/utils/format'
import { getCategoryById } from '@/utils/finance'

interface RecentTransactionsCardProps {
  categories: Category[]
  currency: string
  transactions: Transaction[]
}

export function RecentTransactionsCard({ categories, currency, transactions }: RecentTransactionsCardProps) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        action={
          <Link className={buttonStyles()} to="/registrar">
            Registrar primer movimiento
          </Link>
        }
        className="h-full"
        description="Cuando registres tus primeros movimientos, aqui veras la actividad mas reciente."
        icon={ListChecks}
        title="Todavia no hay actividad"
      />
    )
  }

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">Actividad</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">Actividad reciente</h2>
        </div>
        <Link className={cn(buttonStyles({ variant: 'secondary', size: 'sm' }))} to="/historial">
          Ver historial
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {transactions.map((transaction) => {
          const category = getCategoryById(categories, transaction.categoryId)
          const isIncome = transaction.type === 'income'

          return (
            <div
              key={transaction.id}
              className="flex flex-col gap-3 rounded-[1.4rem] border border-outline bg-panel-muted p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-2xl',
                    isIncome ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger',
                  )}
                >
                  {isIncome ? <ArrowUpCircle className="h-5 w-5" /> : <ArrowDownCircle className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-text-primary">
                      {transaction.description || (isIncome ? 'Ingreso sin detalle' : 'Gasto sin detalle')}
                    </p>
                    {transaction.source === 'recurring' ? <Badge variant="brand">Programado</Badge> : null}
                  </div>
                  <p className="text-sm text-text-secondary">
                    {category?.label ?? 'Categoria'} · {formatDisplayDate(transaction.date)}
                  </p>
                </div>
              </div>
              <p className={cn('text-lg font-bold', isIncome ? 'text-success' : 'text-danger')}>
                {isIncome ? '+' : '-'}
                {formatCurrency(transaction.amount, currency)}
              </p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
