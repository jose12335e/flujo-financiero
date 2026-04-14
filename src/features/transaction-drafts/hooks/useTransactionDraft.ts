import { useMemo, useState } from 'react'

import { useAuth } from '@/hooks/useAuth'
import { useFinanceStore } from '@/hooks/useFinanceStore'
import { analyzeTransactionDraft } from '@/features/transaction-drafts/services/analyzeTransactionDraft'
import type { TransactionDraftState, TransactionDraftSuggestion } from '@/features/transaction-drafts/types/transactionDraft'

function updateSuggestionValue<
  TField extends keyof TransactionDraftSuggestion['values'],
>(
  suggestion: TransactionDraftSuggestion,
  field: TField,
  value: TransactionDraftSuggestion['values'][TField],
): TransactionDraftSuggestion {
  return {
    ...suggestion,
    values: {
      ...suggestion.values,
      [field]: value,
    },
  }
}

export function useTransactionDraft() {
  const { user } = useAuth()
  const { state } = useFinanceStore()
  const [draftState, setDraftState] = useState<TransactionDraftState>({ status: 'idle', input: '' })

  const canAnalyze = draftState.input.trim().length > 0 && draftState.status !== 'processing'

  const analyze = async () => {
    const input = draftState.input.trim()

    if (!input) {
      setDraftState({
        status: 'error',
        input,
        message: 'Escribe una descripcion antes de pedir una sugerencia.',
      })
      return
    }

    setDraftState({
      status: 'processing',
      input,
    })

    try {
      const suggestion = await analyzeTransactionDraft(input, {
        categories: state.categories,
        currency: state.currency,
        locale: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        userId: user?.id,
      })

      setDraftState({
        status: 'review',
        input,
        suggestion,
      })
    } catch (error) {
      setDraftState({
        status: 'error',
        input,
        message: error instanceof Error ? error.message : 'No pudimos interpretar el texto en este momento.',
      })
    }
  }

  const selectors = useMemo(
    () => ({
      currency: state.currency,
      categories: state.categories,
    }),
    [state.categories, state.currency],
  )

  return {
    state: draftState,
    canAnalyze,
    selectors,
    actions: {
      setInput: (input: string) =>
        setDraftState((currentState) => ({
          ...(currentState.status === 'review'
            ? { status: 'review' as const, suggestion: currentState.suggestion }
            : currentState.status === 'processing'
              ? { status: 'processing' as const }
              : currentState.status === 'error'
                ? { status: 'error' as const, message: currentState.message }
                : { status: 'idle' as const }),
          input,
        })),
      analyze,
      reset: () => setDraftState({ status: 'idle', input: '' }),
      updateField: <TField extends keyof TransactionDraftSuggestion['values']>(
        field: TField,
        value: TransactionDraftSuggestion['values'][TField],
      ) =>
        setDraftState((currentState) => {
          if (currentState.status !== 'review') {
            return currentState
          }

          return {
            ...currentState,
            suggestion: updateSuggestionValue(currentState.suggestion, field, value),
          }
        }),
    },
  }
}
