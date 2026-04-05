import { ArrowDownCircle, ArrowUpCircle, Pencil, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Category, Transaction } from '@/types/finance'
import { cn } from '@/utils/cn'
import { formatCurrency, formatDisplayDate } from '@/utils/format'
import { getCategoryById } from '@/utils/finance'

interface TransactionListProps {
  categories: Category[]
  currency: string
  emptyDescription: string
  emptyTitle: string
  onDelete: (transactionId: string) => void
  onEdit: (transactionId: string) => void
  transactions: Transaction[]
}

export function TransactionList({
  categories,
  currency,
  emptyDescription,
  emptyTitle,
  onDelete,
  onEdit,
  transactions,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return <EmptyState description={emptyDescription} icon={ArrowDownCircle} title={emptyTitle} />
  }

  return (
    <div className="space-y-4">
      <Card className="hidden overflow-hidden p-0 lg:block">
        <table className="min-w-full divide-y divide-outline">
          <thead className="bg-panel-muted">
            <tr className="text-left text-sm text-text-secondary">
              <th className="px-6 py-4 font-semibold">Detalle</th>
              <th className="px-6 py-4 font-semibold">Categoria</th>
              <th className="px-6 py-4 font-semibold">Fecha</th>
              <th className="px-6 py-4 font-semibold">Monto</th>
              <th className="px-6 py-4 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline">
            {transactions.map((transaction) => {
              const category = getCategoryById(categories, transaction.categoryId)
              const isIncome = transaction.type === 'income'

              return (
                <tr key={transaction.id} className="hover:bg-panel-muted">
                  <td className="px-6 py-5">
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
                        <p className="font-semibold text-text-primary">
                          {transaction.description || (isIncome ? 'Ingreso sin detalle' : 'Gasto sin detalle')}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant={isIncome ? 'success' : 'danger'}>{isIncome ? 'Ingreso' : 'Gasto'}</Badge>
                          {transaction.source === 'recurring' ? <Badge variant="brand">Programado</Badge> : null}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-text-secondary">{category?.label ?? 'Categoria no disponible'}</td>
                  <td className="px-6 py-5 text-sm text-text-secondary">{formatDisplayDate(transaction.date)}</td>
                  <td className="px-6 py-5">
                    <span className={cn('font-semibold', isIncome ? 'text-success' : 'text-danger')}>
                      {isIncome ? '+' : '-'}
                      {formatCurrency(transaction.amount, currency)}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Button onClick={() => onEdit(transaction.id)} size="sm" variant="secondary">
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button onClick={() => onDelete(transaction.id)} size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      <div className="grid gap-4 lg:hidden">
        {transactions.map((transaction) => {
          const category = getCategoryById(categories, transaction.categoryId)
          const isIncome = transaction.type === 'income'

          return (
            <Card key={transaction.id}>
              <div className="flex items-start justify-between gap-4">
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
                    <p className="font-semibold text-text-primary">
                      {transaction.description || (isIncome ? 'Ingreso sin detalle' : 'Gasto sin detalle')}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">{category?.label ?? 'Categoria no disponible'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={isIncome ? 'success' : 'danger'}>{isIncome ? 'Ingreso' : 'Gasto'}</Badge>
                  {transaction.source === 'recurring' ? <Badge variant="brand">Programado</Badge> : null}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <p className="text-sm text-text-secondary">{formatDisplayDate(transaction.date)}</p>
                <p className={cn('text-lg font-bold', isIncome ? 'text-success' : 'text-danger')}>
                  {isIncome ? '+' : '-'}
                  {formatCurrency(transaction.amount, currency)}
                </p>
              </div>

              <div className="mt-5 flex gap-2">
                <Button className="flex-1" onClick={() => onEdit(transaction.id)} variant="secondary">
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
                <Button className="flex-1" onClick={() => onDelete(transaction.id)} variant="ghost">
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
