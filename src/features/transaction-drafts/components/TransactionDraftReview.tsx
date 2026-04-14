import { useMemo } from 'react'
import { ArrowRight, Brain, CalendarDays, Landmark, ReceiptText } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { getCategoriesByType } from '@/utils/finance'
import { formatCurrency } from '@/utils/format'
import type { Category } from '@/types/finance'
import type { TransactionDraftSuggestion } from '@/features/transaction-drafts/types/transactionDraft'

interface TransactionDraftReviewProps {
  categories: Category[]
  currency: string
  suggestion: TransactionDraftSuggestion
  onContinue: () => void
  onFieldChange: <TField extends keyof TransactionDraftSuggestion['values']>(
    field: TField,
    value: TransactionDraftSuggestion['values'][TField],
  ) => void
}

function getConfidenceText(confidenceLabel: TransactionDraftSuggestion['confidenceLabel']) {
  if (confidenceLabel === 'high') {
    return 'alta'
  }

  if (confidenceLabel === 'medium') {
    return 'media'
  }

  return 'baja'
}

function getSourceLabel(source: TransactionDraftSuggestion['analysisSource']) {
  if (source === 'hybrid') {
    return 'Analisis mixto'
  }

  if (source === 'ai') {
    return 'Analisis IA'
  }

  return 'Analisis local'
}

export function TransactionDraftReview({
  categories,
  currency,
  suggestion,
  onContinue,
  onFieldChange,
}: TransactionDraftReviewProps) {
  const availableCategories = useMemo(
    () => getCategoriesByType(categories, suggestion.values.type),
    [categories, suggestion.values.type],
  )

  const canContinue = typeof suggestion.values.amount === 'number' && Boolean(suggestion.values.categoryId) && Boolean(suggestion.values.date)

  return (
    <Card className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Revision sugerida</p>
          <h2 className="mt-2 text-xl font-semibold text-text-primary">Borrador listo para validar</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Ajusta cualquier campo y luego continua al formulario normal para guardar el movimiento manualmente.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="brand">{getSourceLabel(suggestion.analysisSource)}</Badge>
          <Badge variant="neutral">Confianza {getConfidenceText(suggestion.confidenceLabel)}</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          className={`rounded-[1.4rem] border p-4 text-left transition ${
            suggestion.values.type === 'expense'
              ? 'border-danger bg-danger-soft text-danger'
              : 'border-outline bg-panel-muted text-text-secondary hover:bg-app-bg'
          }`}
          onClick={() => onFieldChange('type', 'expense')}
          type="button"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ReceiptText className="h-4 w-4" />
            Gasto
          </span>
          <p className="mt-2 text-sm leading-6">Se descontara del balance una vez que lo guardes desde el formulario.</p>
        </button>

        <button
          className={`rounded-[1.4rem] border p-4 text-left transition ${
            suggestion.values.type === 'income'
              ? 'border-success bg-success-soft text-success'
              : 'border-outline bg-panel-muted text-text-secondary hover:bg-app-bg'
          }`}
          onClick={() => onFieldChange('type', 'income')}
          type="button"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Landmark className="h-4 w-4" />
            Ingreso
          </span>
          <p className="mt-2 text-sm leading-6">Se sumara al balance una vez que lo confirmes y guardes.</p>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Monto</span>
          <input
            className="min-h-12 w-full rounded-2xl border border-outline bg-app-bg px-4 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand"
            min="0"
            onChange={(event) => onFieldChange('amount', event.target.value ? Number(event.target.value) : undefined)}
            placeholder="0.00"
            step="0.01"
            type="number"
            value={typeof suggestion.values.amount === 'number' ? suggestion.values.amount : ''}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Categoria</span>
          <select
            className="min-h-12 w-full rounded-2xl border border-outline bg-app-bg px-4 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand"
            onChange={(event) => onFieldChange('categoryId', event.target.value || undefined)}
            value={suggestion.values.categoryId ?? ''}
          >
            <option value="">Selecciona una categoria</option>
            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-text-primary">Descripcion</span>
        <textarea
          className="min-h-[120px] w-full rounded-2xl border border-outline bg-app-bg px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand"
          onChange={(event) => onFieldChange('description', event.target.value)}
          value={suggestion.values.description}
        />
      </label>

      <label className="space-y-2">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
          <CalendarDays className="h-4 w-4 text-text-muted" />
          Fecha
        </span>
        <input
          className="min-h-12 w-full rounded-2xl border border-outline bg-app-bg px-4 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand"
          onChange={(event) => onFieldChange('date', event.target.value)}
          type="date"
          value={suggestion.values.date}
        />
      </label>

      <div className="rounded-[1.4rem] border border-outline bg-panel-muted p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Brain className="h-4 w-4 text-brand" />
          <span>Lectura actual</span>
        </div>
        <p className="mt-2 text-sm text-text-secondary">
          {typeof suggestion.values.amount === 'number'
            ? `${suggestion.values.type === 'income' ? 'Ingreso' : 'Gasto'} sugerido por ${formatCurrency(suggestion.values.amount, currency)}.`
            : 'Aun falta completar el monto antes de continuar.'}
        </p>
      </div>

      {suggestion.reasoning.length > 0 ? (
        <div className="rounded-[1.4rem] border border-outline bg-app-bg p-4">
          <p className="text-sm font-semibold text-text-primary">Razones de la sugerencia</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-text-secondary">
            {suggestion.reasoning.map((reason) => (
              <li key={reason}>• {reason}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {suggestion.warnings.length > 0 ? (
        <div className="rounded-[1.4rem] border border-warning/25 bg-warning-soft p-4">
          <p className="text-sm font-semibold text-warning">Puntos a revisar</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-warning">
            {suggestion.warnings.map((warning) => (
              <li key={warning}>• {warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button disabled={!canContinue} onClick={onContinue}>
          Continuar al formulario
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
