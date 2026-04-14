import { Cpu, PenSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { EmptyState } from '@/components/ui/EmptyState'
import { PageIntro } from '@/components/ui/PageIntro'
import { useTransactionDraft } from '@/features/transaction-drafts/hooks/useTransactionDraft'
import { TransactionDraftReview } from '@/features/transaction-drafts/components/TransactionDraftReview'
import { TransactionTextInputCard } from '@/features/transaction-drafts/components/TransactionTextInputCard'
import type { RegisterPageDraftState } from '@/features/transaction-drafts/types/transactionDraft'

export function SmartRegisterPage() {
  const navigate = useNavigate()
  const { actions, canAnalyze, selectors, state } = useTransactionDraft()

  const handleContinue = () => {
    if (state.status !== 'review') {
      return
    }

    const { amount, categoryId, date, description, type } = state.suggestion.values

    if (typeof amount !== 'number' || !categoryId || !date) {
      return
    }

    const draftState: RegisterPageDraftState = {
      draftValues: {
        type,
        amount,
        categoryId,
        description: description.trim(),
        date,
      },
      draftMeta: {
        analysisSource: state.suggestion.analysisSource,
        confidenceLabel: state.suggestion.confidenceLabel,
      },
    }

    navigate('/registrar', { state: draftState })
  }

  return (
    <div className="space-y-8">
      <PageIntro
        description="Escribe el movimiento como lo contarias en una conversacion y recibe un borrador estructurado antes de pasar al formulario normal."
        eyebrow="Registro asistido por IA"
        title="Crear borrador desde texto libre"
      >
        <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
          <span className="rounded-full border border-outline bg-panel px-3 py-2">Sin guardado automatico</span>
          <span className="rounded-full border border-outline bg-panel px-3 py-2">Revision manual obligatoria</span>
          <span className="rounded-full border border-outline bg-panel px-3 py-2">Compatible con el formulario actual</span>
        </div>
      </PageIntro>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <TransactionTextInputCard
          canAnalyze={canAnalyze}
          onAnalyze={actions.analyze}
          onInputChange={actions.setInput}
          onReset={actions.reset}
          state={state}
        />

        {state.status === 'review' ? (
          <TransactionDraftReview
            categories={selectors.categories}
            currency={selectors.currency}
            onContinue={handleContinue}
            onFieldChange={actions.updateField}
            suggestion={state.suggestion}
          />
        ) : (
          <EmptyState
            description="Aqui aparecera el tipo sugerido, el monto, la categoria, la fecha y las razones del analisis antes de continuar al formulario."
            icon={state.status === 'processing' ? Cpu : PenSquare}
            title={state.status === 'processing' ? 'Procesando sugerencia' : 'Borrador pendiente'}
          />
        )}
      </div>
    </div>
  )
}
