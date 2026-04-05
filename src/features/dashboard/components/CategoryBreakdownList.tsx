import { PieChart } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import type { CategorySummary } from '@/types/finance'
import { formatCurrency, formatPercentage } from '@/utils/format'
import { getIcon } from '@/utils/icons'

interface CategoryBreakdownListProps {
  categories: CategorySummary[]
  currency: string
  fallbackCategories?: CategorySummary[]
  fallbackMonthLabel?: string
  monthLabel: string
}

export function CategoryBreakdownList({
  categories,
  currency,
  fallbackCategories = [],
  fallbackMonthLabel,
  monthLabel,
}: CategoryBreakdownListProps) {
  const hasCurrentMonthData = categories.length > 0
  const displayedCategories = hasCurrentMonthData ? categories : fallbackCategories
  const isUsingFallback = !hasCurrentMonthData && fallbackCategories.length > 0

  if (displayedCategories.length === 0) {
    return (
      <EmptyState
        className="h-full"
        description={`No hay gastos registrados en ${monthLabel}. Cuando empieces a cargar egresos, aqui veras su distribucion por categoria.`}
        icon={PieChart}
        title="Sin gastos para analizar"
      />
    )
  }

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">
            {isUsingFallback ? 'Referencia reciente' : 'Distribucion del gasto'}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">Principales categorias</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {isUsingFallback
              ? `En ${monthLabel} aun no hay gastos. Mostramos la ultima distribucion disponible de ${fallbackMonthLabel ?? 'el mes anterior'}.`
              : `Participacion de cada categoria dentro del gasto de ${monthLabel}.`}
          </p>
        </div>
        <PieChart className="h-5 w-5 text-text-muted" />
      </div>

      <div className="mt-6 space-y-4">
        {displayedCategories.slice(0, 5).map((category) => {
          const Icon = getIcon(category.icon)

          return (
            <div key={category.categoryId} className="rounded-[1.4rem] bg-panel-muted p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{category.label}</p>
                    <p className="text-sm text-text-muted">{formatPercentage(category.percentage)}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-text-primary">{formatCurrency(category.value, currency)}</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-app-bg">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(category.percentage * 100, 8)}%`, backgroundColor: category.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
