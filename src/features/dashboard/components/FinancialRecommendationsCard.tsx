import { Lightbulb, LoaderCircle } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { FinancialRecommendationsState } from '@/features/recommendations/types/financialRecommendations'

interface FinancialRecommendationsCardProps {
  state: FinancialRecommendationsState
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

function getPriorityVariant(priority: 'low' | 'medium' | 'high') {
  if (priority === 'high') {
    return 'danger' as const
  }

  if (priority === 'medium') {
    return 'warning' as const
  }

  return 'neutral' as const
}

function getPriorityLabel(priority: 'low' | 'medium' | 'high') {
  if (priority === 'high') {
    return 'Alta'
  }

  if (priority === 'medium') {
    return 'Media'
  }

  return 'Baja'
}

export function FinancialRecommendationsCard({ state }: FinancialRecommendationsCardProps) {
  const result = state.result

  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warning-soft text-warning">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">Recomendaciones</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">Acciones sugeridas</h2>
          </div>
        </div>

        {state.status === 'loading' ? (
          <Badge variant="neutral">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            Evaluando
          </Badge>
        ) : result ? (
          <Badge variant="neutral">{getSourceLabel(result.analysisSource)}</Badge>
        ) : null}
      </div>

      {result ? (
        <>
          <div className="mt-5 rounded-[1.5rem] border border-outline bg-panel-muted p-4">
            <p className="text-sm leading-6 text-text-secondary">{result.summary}</p>
          </div>

          <div className="mt-5 space-y-4">
            {result.recommendations.map((recommendation) => (
              <div key={recommendation.id} className="rounded-[1.4rem] border border-outline bg-app-bg p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={getPriorityVariant(recommendation.priority)}>
                    Prioridad {getPriorityLabel(recommendation.priority)}
                  </Badge>
                  <Badge variant="neutral">
                    {recommendation.analysisSource === 'hybrid'
                      ? 'Mixto'
                      : recommendation.analysisSource === 'ai'
                        ? 'IA'
                        : 'Local'}
                  </Badge>
                </div>
                <h3 className="mt-3 text-base font-semibold text-text-primary">{recommendation.title}</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{recommendation.description}</p>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {state.status === 'error' && !result ? (
        <div className="mt-5 rounded-[1.4rem] border border-danger/25 bg-danger-soft p-4 text-sm text-danger">
          {state.message}
        </div>
      ) : null}
    </Card>
  )
}
