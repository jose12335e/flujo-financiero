import { PieChart as PieChartIcon } from 'lucide-react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import type { CategorySummary } from '@/types/finance'
import { formatCurrency } from '@/utils/format'

interface ExpenseCategoryChartProps {
  currency: string
  data: CategorySummary[]
}

export function ExpenseCategoryChart({ currency, data }: ExpenseCategoryChartProps) {
  const tooltipFormatter = (value: number | string | readonly (number | string)[] | undefined) => {
    const normalizedValue = Array.isArray(value) ? Number(value[0] ?? 0) : Number(value ?? 0)
    return formatCurrency(Number.isFinite(normalizedValue) ? normalizedValue : 0, currency)
  }

  if (data.length === 0) {
    return (
      <EmptyState
        className="h-full"
        description="Cuando el periodo tenga gastos registrados, aqui veras su distribucion por categoria."
        icon={PieChartIcon}
        title="Sin informacion para este grafico"
      />
    )
  }

  return (
    <Card className="h-full min-w-0">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">Distribucion del gasto</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">Gastos por categoria</h2>
        </div>
      </div>

      <div className="mt-6 h-[320px] min-w-0">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={72} outerRadius={110} paddingAngle={4}>
              {data.map((entry) => (
                <Cell fill={entry.color} key={entry.categoryId} />
              ))}
            </Pie>
            <Tooltip formatter={tooltipFormatter} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
