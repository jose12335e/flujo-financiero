import { ArrowRight, CopyCheck, FolderTree, Layers3, Repeat } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Category } from '@/types/finance'
import type { TransactionOrganizationResult, TransactionOrganizationSuggestion } from '@/features/transaction-organization/types/transactionOrganization'

interface TransactionOrganizationSuggestionListProps {
  categories: Category[]
  result: TransactionOrganizationResult
}

function getKindIcon(kind: TransactionOrganizationSuggestion['kind']) {
  if (kind === 'duplicate') {
    return CopyCheck
  }

  if (kind === 'fixed-expense') {
    return Repeat
  }

  if (kind === 'category') {
    return FolderTree
  }

  return Layers3
}

function getKindLabel(kind: TransactionOrganizationSuggestion['kind']) {
  if (kind === 'duplicate') {
    return 'Posible duplicado'
  }

  if (kind === 'fixed-expense') {
    return 'Gasto fijo'
  }

  if (kind === 'category') {
    return 'Categoria'
  }

  return 'Descripcion'
}

function getConfidenceVariant(confidenceLabel: TransactionOrganizationSuggestion['confidenceLabel']) {
  if (confidenceLabel === 'high') {
    return 'success' as const
  }

  if (confidenceLabel === 'medium') {
    return 'warning' as const
  }

  return 'neutral' as const
}

export function TransactionOrganizationSuggestionList({
  categories,
  result,
}: TransactionOrganizationSuggestionListProps) {
  const navigate = useNavigate()

  if (result.suggestions.length === 0) {
    return (
      <EmptyState
        description="No encontramos reclasificaciones, gastos fijos ni posibles duplicados que requieran tu atencion."
        icon={FolderTree}
        title="No hay sugerencias pendientes"
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Sugerencias</p>
          <p className="text-3xl font-bold text-text-primary">{result.summary.totalSuggestions}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Categorias</p>
          <p className="text-3xl font-bold text-text-primary">{result.summary.categorySuggestions}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Gastos fijos</p>
          <p className="text-3xl font-bold text-text-primary">{result.summary.fixedExpenseCandidates}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Duplicados</p>
          <p className="text-3xl font-bold text-text-primary">{result.summary.duplicateCandidates}</p>
        </Card>
      </div>

      {result.overview ? (
        <Card>
          <p className="text-sm leading-6 text-text-secondary">{result.overview}</p>
        </Card>
      ) : null}

      <div className="space-y-4">
        {result.suggestions.map((suggestion) => {
          const Icon = getKindIcon(suggestion.kind)
          const suggestedCategory = suggestion.suggestedCategoryId
            ? categories.find((category) => category.id === suggestion.suggestedCategoryId)
            : null

          return (
            <Card key={suggestion.id} className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="brand">{getKindLabel(suggestion.kind)}</Badge>
                      <Badge variant={getConfidenceVariant(suggestion.confidenceLabel)}>
                        Confianza {suggestion.confidenceLabel === 'high' ? 'alta' : suggestion.confidenceLabel === 'medium' ? 'media' : 'baja'}
                      </Badge>
                      <Badge variant="neutral">
                        {suggestion.analysisSource === 'hybrid'
                          ? 'Analisis mixto'
                          : suggestion.analysisSource === 'ai'
                            ? 'Analisis IA'
                            : 'Analisis local'}
                      </Badge>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-text-primary">{suggestion.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">{suggestion.description}</p>
                  </div>
                </div>

                <Button onClick={() => navigate(`/registrar/${suggestion.transactionId}`)} variant="secondary">
                  Abrir movimiento
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {suggestedCategory ? (
                <div className="rounded-[1.3rem] border border-outline bg-panel-muted p-4 text-sm text-text-secondary">
                  Categoria sugerida: <span className="font-semibold text-text-primary">{suggestedCategory.label}</span>
                </div>
              ) : null}

              {suggestion.reasoning.length > 0 ? (
                <div className="rounded-[1.3rem] border border-outline bg-app-bg p-4">
                  <p className="text-sm font-semibold text-text-primary">Por que la sugerencia?</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-text-secondary">
                    {suggestion.reasoning.map((reason) => (
                      <li key={reason}>• {reason}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
