import { LoaderCircle, ShieldAlert, Sparkles, TrendingUp, Wallet } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { FinancialForecastState } from '@/features/forecasting/types/financialForecast'
import { formatCurrency } from '@/utils/format'

interface ForecastResultCardProps {
  currency: string
  state: FinancialForecastState
}

function getSourceLabel(source: 'local' | 'ai' | 'hybrid') {
  if (source === 'hybrid') {
    return 'IA + reglas'
  }

  if (source === 'ai') {
    return 'IA'
  }

  return 'Reglas locales'
}

function getRiskVariant(riskLevel: 'low' | 'medium' | 'high') {
  if (riskLevel === 'high') {
    return { label: 'Riesgo alto', variant: 'danger' as const }
  }

  if (riskLevel === 'medium') {
    return { label: 'Riesgo medio', variant: 'warning' as const }
  }

  return { label: 'Riesgo bajo', variant: 'success' as const }
}

export function ForecastResultCard({ currency, state }: ForecastResultCardProps) {
  const result = state.result
  const risk = result ? getRiskVariant(result.riskLevel) : null

  return (
    <Card className="h-full p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">Resultado</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">Proyeccion del escenario</h2>
          </div>
        </div>

        {state.status === 'loading' ? (
          <Badge variant="neutral">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            Simulando
          </Badge>
        ) : result ? (
          <Badge variant="neutral">{getSourceLabel(result.analysisSource)}</Badge>
        ) : null}
      </div>

      {state.status === 'error' && !result ? (
        <div className="mt-5 rounded-[1.4rem] border border-danger/25 bg-danger-soft p-4 text-sm text-danger">
          {state.message}
        </div>
      ) : null}

      {result ? (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.4rem] border border-outline bg-panel-muted p-4">
              <div className="flex items-center gap-2 text-text-secondary">
                <Wallet className="h-4 w-4" />
                <p className="text-sm">Cierre estimado</p>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-text-primary">
                {formatCurrency(result.projectedClosingBalance, currency)}
              </p>
            </div>

            <div className="rounded-[1.4rem] border border-outline bg-panel-muted p-4">
              <div className="flex items-center gap-2 text-text-secondary">
                <Sparkles className="h-4 w-4" />
                <p className="text-sm">Ahorro proyectado</p>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-text-primary">
                {formatCurrency(result.projectedSavings, currency)}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {risk ? <Badge variant={risk.variant}>{risk.label}</Badge> : null}
            <Badge variant="neutral">Flujo libre: {formatCurrency(result.projectedFreeCashFlow, currency)}</Badge>
            {result.debtMonthsReduced > 0 ? (
              <Badge variant="neutral">Deuda adelantada: {result.debtMonthsReduced} meses</Badge>
            ) : null}
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-outline bg-app-bg p-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-warning" />
              <p className="text-sm font-semibold text-text-primary">Lectura del escenario</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{result.summary}</p>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-outline bg-app-bg p-4">
            <p className="text-sm font-semibold text-text-primary">Hallazgos clave</p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-text-secondary">
              {result.highlights.map((highlight) => (
                <li key={highlight}>• {highlight}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </Card>
  )
}
