import { CalendarClock } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import type { UpcomingPaymentItem } from '@/utils/dashboard'
import { cn } from '@/utils/cn'
import { formatCurrency, formatDisplayDate, formatDisplayDateTime } from '@/utils/format'

interface UpcomingPaymentsCardProps {
  currency: string
  payments: UpcomingPaymentItem[]
}

export function UpcomingPaymentsCard({ currency, payments }: UpcomingPaymentsCardProps) {
  if (payments.length === 0) {
    return (
      <EmptyState
        action={
          <Link className={buttonStyles()} to="/deudas">
            Revisar compromisos
          </Link>
        }
        className="h-full"
        description="Cuando tengas pagos de deuda o egresos programados, aqui veras lo mas cercano por vencer."
        icon={CalendarClock}
        title="Sin pagos próximos"
      />
    )
  }

  return (
    <Card className="h-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">Compromisos</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">Pagos próximos</h2>
        </div>
        <Link className={cn(buttonStyles({ variant: 'secondary', size: 'sm' }), 'w-full sm:w-auto')} to="/deudas">
          Ver deudas
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {payments.map((payment) => {
          const isRecurring = payment.source === 'recurring'
          const isDateTime = payment.dueDate.includes('T')

          return (
            <div key={payment.id} className="rounded-[1.4rem] border border-outline bg-panel-muted p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-text-primary">{payment.title}</p>
                    <Badge variant={isRecurring ? 'brand' : 'warning'}>
                      {isRecurring ? 'Programado' : 'Deuda'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">{payment.subtitle}</p>
                  <p className="mt-1 text-sm text-text-muted">
                    {isDateTime ? formatDisplayDateTime(payment.dueDate) : formatDisplayDate(payment.dueDate)}
                  </p>
                </div>
                <p className="shrink-0 font-semibold text-danger">
                  -{formatCurrency(payment.amount, currency)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
