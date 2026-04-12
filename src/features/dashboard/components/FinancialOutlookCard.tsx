import { BadgeDollarSign, Landmark, PiggyBank, Wallet } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import type { FinancialOutlook } from '@/utils/dashboard'
import { formatCurrency } from '@/utils/format'

interface FinancialOutlookCardProps {
  currency: string
  outlook: FinancialOutlook
}

export function FinancialOutlookCard({ currency, outlook }: FinancialOutlookCardProps) {
  return (
    <Card className="h-full">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <PiggyBank className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">Proyeccion</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">Panorama del mes</h2>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <Metric
          icon={Landmark}
          label="Ingreso del mes"
          tone="success"
          value={formatCurrency(outlook.monthlyIncome, currency)}
        />
        <Metric
          icon={Wallet}
          label="Comprometido del mes"
          tone="warning"
          value={formatCurrency(outlook.committedMoney, currency)}
        />
        <Metric
          icon={PiggyBank}
          label="Deuda pendiente"
          tone="danger"
          value={formatCurrency(outlook.pendingDebt, currency)}
        />
        <Metric
          icon={BadgeDollarSign}
          label="Sueldo neto estimado"
          tone="brand"
          value={outlook.estimatedNetSalary !== null ? formatCurrency(outlook.estimatedNetSalary, currency) : 'Sin perfil'}
        />
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-outline bg-panel-muted p-4">
        <p className="text-sm text-text-secondary">Balance disponible estimado</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-text-primary">
          {formatCurrency(outlook.estimatedAvailableBalance, currency)}
        </p>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Proyeccion basada en tu balance actual, tu sueldo neto mensual estimado y tus compromisos fijos del periodo.
        </p>
      </div>
    </Card>
  )
}

function Metric({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: typeof Landmark
  label: string
  tone: 'brand' | 'success' | 'warning' | 'danger'
  value: string
}) {
  const toneClasses = {
    brand: 'bg-brand-soft text-brand',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    danger: 'bg-danger-soft text-danger',
  } as const

  return (
    <div className="rounded-[1.3rem] bg-app-bg p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-sm text-text-secondary">{label}</p>
      </div>
      <p className="mt-3 text-xl font-bold text-text-primary">{value}</p>
    </div>
  )
}
