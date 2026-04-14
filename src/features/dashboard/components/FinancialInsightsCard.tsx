import { BrainCircuit, LoaderCircle, TriangleAlert } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { FinancialInsightsState } from '@/features/insights/types/financialInsights'

interface FinancialInsightsCardProps {
  state: FinancialInsightsState
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

export function FinancialInsightsCard({ state }: FinancialInsightsCardProps) {
  const result = state.result

  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">Insights</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">Lectura inteligente del mes</h2>
          </div>
        </div>

        {state.status === 'loading' ? (
          <Badge variant="neutral">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            Analizando
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
          <div className="mt-5 rounded-[1.5rem] border border-outline bg-panel-muted p-4">
            <p className="text-sm font-semibold text-text-primary">Resumen</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{result.summary}</p>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[1.5rem] border border-outline bg-app-bg p-4">
              <p className="text-sm font-semibold text-text-primary">Hallazgos</p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-text-secondary">
                {result.insights.map((insight) => (
                  <li key={insight}>• {insight}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.5rem] border border-outline bg-app-bg p-4">
              <div className="flex items-center gap-2">
                <TriangleAlert className="h-4 w-4 text-warning" />
                <p className="text-sm font-semibold text-text-primary">Alertas</p>
              </div>

              {result.riskFlags.length > 0 ? (
                <ul className="mt-3 space-y-3 text-sm leading-6 text-text-secondary">
                  {result.riskFlags.map((flag) => (
                    <li key={flag}>• {flag}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  No se detectaron alertas criticas con la informacion disponible.
                </p>
              )}
            </div>
          </div>
        </>
      ) : null}
    </Card>
  )
}
