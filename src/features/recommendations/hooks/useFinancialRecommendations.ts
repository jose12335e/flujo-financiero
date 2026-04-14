import { useEffect, useMemo, useState } from 'react'

import { useFinanceStore } from '@/hooks/useFinanceStore'
import { analyzeFinancialRecommendations, buildLocalFinancialRecommendations } from '@/features/recommendations/services/analyzeFinancialRecommendations'
import type { FinancialRecommendationsState } from '@/features/recommendations/types/financialRecommendations'

interface AsyncRecommendationsState {
  requestKey: string
  status: 'idle' | 'ready' | 'error'
  result: FinancialRecommendationsState['result']
  message?: string
}

export function useFinancialRecommendations() {
  const { selectors, state } = useFinanceStore()
  const financialOutlook = selectors.financialOutlook
  const salarySummary = selectors.salarySummary
  const budgetStatus = selectors.budgetStatus
  const debtSummary = selectors.debtSummary
  const currentMonthSummary = selectors.currentMonthSummary

  const requestKey = useMemo(
    () =>
      JSON.stringify({
        monthKey: selectors.currentMonthKey,
        currentMonthSummary,
        budgetStatus,
        debtSummary,
        financialOutlook,
        salarySummary,
        recurringRules: state.recurringRules.map((rule) => `${rule.id}:${rule.updatedAt}:${rule.isActive}:${rule.amount}`),
      }),
    [budgetStatus, currentMonthSummary, debtSummary, financialOutlook, salarySummary, selectors.currentMonthKey, state.recurringRules],
  )

  const localResult = useMemo(
    () =>
      buildLocalFinancialRecommendations({
        currentMonthKey: selectors.currentMonthKey,
        currentMonthSummary,
        budgetStatus,
        debtSummary,
        recurringRules: state.recurringRules,
        financialOutlook,
        salarySummary,
      }),
    [budgetStatus, currentMonthSummary, debtSummary, financialOutlook, salarySummary, selectors.currentMonthKey, state.recurringRules],
  )

  const [asyncState, setAsyncState] = useState<AsyncRecommendationsState>({
    requestKey: '',
    status: 'idle',
    result: null,
  })

  useEffect(() => {
    let isActive = true

    void analyzeFinancialRecommendations({
      currentMonthKey: selectors.currentMonthKey,
      currentMonthSummary,
      budgetStatus,
      debtSummary,
      recurringRules: state.recurringRules,
      financialOutlook,
      salarySummary,
    })
      .then((result) => {
        if (!isActive) {
          return
        }

        setAsyncState({
          requestKey,
          status: 'ready',
          result,
        })
      })
      .catch((error) => {
        if (!isActive) {
          return
        }

        setAsyncState({
          requestKey,
          status: 'error',
          result: null,
          message: error instanceof Error ? error.message : 'No pudimos generar recomendaciones en este momento.',
        })
      })

    return () => {
      isActive = false
    }
  }, [
    budgetStatus,
    currentMonthSummary,
    debtSummary,
    financialOutlook,
    requestKey,
    salarySummary,
    selectors.currentMonthKey,
    state.recurringRules,
  ])

  if (asyncState.requestKey === requestKey && asyncState.status === 'ready' && asyncState.result) {
    return {
      status: 'ready',
      result: asyncState.result,
    } satisfies FinancialRecommendationsState
  }

  if (asyncState.requestKey === requestKey && asyncState.status === 'error') {
    return {
      status: 'error',
      result: localResult,
      message: asyncState.message ?? 'No pudimos generar recomendaciones en este momento.',
    } satisfies FinancialRecommendationsState
  }

  return {
    status: 'loading',
    result: localResult,
  } satisfies FinancialRecommendationsState
}
