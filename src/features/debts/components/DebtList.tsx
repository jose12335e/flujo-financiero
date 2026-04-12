import { CalendarDays, CreditCard, Pencil, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Debt, UpcomingDebtPayment } from '@/types/finance'
import { cn } from '@/utils/cn'
import { formatCurrency, formatDisplayDate } from '@/utils/format'

interface DebtListProps {
  currency: string
  debts: Debt[]
  emptyDescription: string
  emptyTitle: string
  onDelete: (debtId: string) => void
  onEdit: (debtId: string) => void
  onRecordPayment: (debtId: string) => void
  upcomingPayments: UpcomingDebtPayment[]
}

const statusLabels = {
  active: 'Activa',
  paid: 'Pagada',
  paused: 'Pausada',
  defaulted: 'En mora',
} as const

const priorityLabels = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Critica',
} as const

export function DebtList({
  currency,
  debts,
  emptyDescription,
  emptyTitle,
  onDelete,
  onEdit,
  onRecordPayment,
  upcomingPayments,
}: DebtListProps) {
  if (debts.length === 0) {
    return <EmptyState description={emptyDescription} icon={CreditCard} title={emptyTitle} />
  }

  const upcomingLookup = new Map(upcomingPayments.map((payment) => [payment.debtId, payment]))

  return (
    <div className="grid gap-4">
      {debts.map((debt) => {
        const upcomingPayment = upcomingLookup.get(debt.id)

        return (
          <Card key={debt.id} className="p-5 sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold text-text-primary">{debt.name}</h3>
                    <Badge variant={debt.status === 'active' ? 'success' : debt.status === 'defaulted' ? 'danger' : 'neutral'}>
                      {statusLabels[debt.status]}
                    </Badge>
                    <Badge variant={debt.priority === 'critical' || debt.priority === 'high' ? 'warning' : 'neutral'}>
                      Prioridad {priorityLabels[debt.priority]}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">
                    Tipo: {formatDebtType(debt.type)}
                    {debt.interestRate !== null ? ` · Interes ${debt.interestRate}%` : ''}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
                  <Button className="w-full sm:w-auto" onClick={() => onEdit(debt.id)} variant="secondary">
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    className="w-full sm:w-auto"
                    disabled={debt.status !== 'active' || debt.pendingBalance <= 0}
                    onClick={() => onRecordPayment(debt.id)}
                  >
                    <CalendarDays className="h-4 w-4" />
                    Registrar pago
                  </Button>
                  <Button className="col-span-2 w-full sm:w-auto" onClick={() => onDelete(debt.id)} variant="ghost">
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Metric label="Monto original" value={formatCurrency(debt.originalAmount, currency)} />
                <Metric label="Balance pendiente" value={formatCurrency(debt.pendingBalance, currency)} />
                <Metric label="Cuota mensual" value={formatCurrency(debt.monthlyPayment, currency)} />
                <Metric
                  label="Proximo pago"
                  value={upcomingPayment ? formatDisplayDate(upcomingPayment.dueDate) : `Dia ${debt.paymentDay}`}
                />
              </div>

              <div className="rounded-[1.4rem] bg-panel-muted p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                  <p className="text-sm text-text-secondary">
                    Inicio: <span className="font-semibold text-text-primary">{formatDisplayDate(debt.startDate)}</span>
                  </p>
                  <p className="text-sm text-text-secondary">
                    Fin: <span className="font-semibold text-text-primary">{debt.endDate ? formatDisplayDate(debt.endDate) : 'Sin fecha limite'}</span>
                  </p>
                </div>
                {debt.notes ? <p className="mt-3 text-sm leading-6 text-text-secondary">{debt.notes}</p> : null}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] bg-app-bg px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">{label}</p>
      <p className={cn('mt-2 text-base font-bold text-text-primary sm:text-lg')}>{value}</p>
    </div>
  )
}

function formatDebtType(type: Debt['type']) {
  return {
    loan: 'Prestamo',
    credit_card: 'Tarjeta de credito',
    mortgage: 'Hipoteca',
    vehicle: 'Vehiculo',
    service: 'Servicio',
    personal: 'Personal',
    other: 'Otra',
  }[type]
}
