import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Card } from '@/components/ui/Card'
import type { MonthlySeriesPoint } from '@/types/finance'
import { formatCurrency } from '@/utils/format'

interface IncomeExpenseChartProps {
  currency: string
  data: MonthlySeriesPoint[]
}

export function IncomeExpenseChart({ currency, data }: IncomeExpenseChartProps) {
  const tooltipFormatter = (value: number | string | readonly (number | string)[] | undefined) => {
    const normalizedValue = Array.isArray(value) ? Number(value[0] ?? 0) : Number(value ?? 0)
    return formatCurrency(Number.isFinite(normalizedValue) ? normalizedValue : 0, currency)
  }

  return (
    <Card className="h-full min-w-0">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">Comparativa historica</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">Ingresos frente a gastos</h2>
      </div>

      <div className="mt-6 h-[320px] min-w-0">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="var(--outline)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(value) => `${value}`} tickLine={false} axisLine={false} width={70} />
            <Tooltip formatter={tooltipFormatter} />
            <Bar dataKey="income" fill="var(--success)" name="Ingresos" radius={[12, 12, 0, 0]} />
            <Bar dataKey="expenses" fill="var(--danger)" name="Gastos" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
