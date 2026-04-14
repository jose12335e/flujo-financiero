import { useEffect, useMemo, useState } from 'react'

import { useFinanceStore } from '@/hooks/useFinanceStore'
import { analyzeFinancialInsights, buildLocalFinancialInsights } from '@/features/insights/services/analyzeFinancialInsights'
import type { FinancialInsightsState } from '@/features/insights/types/financialInsights'

interface AsyncInsightsState {
  requestKey: string
  status: 'idle' | 'ready' | 'error'
  result: FinancialInsightsState['result']
  message?: string
}

export function useFinancialInsights() {
  const { selectors, state } = useFinanceStore()
  const financialOutlook = selectors.financialOutlook

  const requestKey = useMemo(
    () =>
      JSON.stringify({
        currentMonthKey: selectors.currentMonthKey,
        transactionIds: state.transactions.map((transaction) => transaction.id),
        updatedAt: state.transactions.map((transaction) => transaction.updatedAt),
        recurringRules: state.recurringRules.map((rule) => `${rule.id}:${rule.updatedAt}:${rule.isActive}:${rule.amount}`),
        monthlyBudget: state.monthlyBudget,
        financialOutlook,
      }),
    [financialOutlook, selectors.currentMonthKey, state.monthlyBudget, state.recurringRules, state.transactions],
  )

  const localResult = useMemo(
    () =>
      buildLocalFinancialInsights({
        currentMonthKey: selectors.currentMonthKey,
        transactions: state.transactions,
        categories: state.categories,
        monthlyBudget: state.monthlyBudget,
        recurringRules: state.recurringRules,
        financialOutlook,
      }),
    [financialOutlook, selectors.currentMonthKey, state.categories, state.monthlyBudget, state.recurringRules, state.transactions],
  )

  const [asyncState, setAsyncState] = useState<AsyncInsightsState>({
    requestKey: '',
    status: 'idle',
    result: null,
  })

  useEffect(() => {
    let isActive = true

    void analyzeFinancialInsights({
      currentMonthKey: selectors.currentMonthKey,
      transactions: state.transactions,
      categories: state.categories,
      monthlyBudget: state.monthlyBudget,
      recurringRules: state.recurringRules,
      financialOutlook,
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
          message: error instanceof Error ? error.message : 'No pudimos generar insights en este momento.',
        })
      })

    return () => {
      isActive = false
    }
  }, [financialOutlook, requestKey, selectors.currentMonthKey, state.categories, state.monthlyBudget, state.recurringRules, state.transactions])

  if (asyncState.requestKey === requestKey && asyncState.status === 'ready' && asyncState.result) {
    return {
      status: 'ready',
      result: asyncState.result,
    } satisfies FinancialInsightsState
  }

  if (asyncState.requestKey === requestKey && asyncState.status === 'error') {
    return {
      status: 'error',
      result: localResult,
      message: asyncState.message ?? 'No pudimos generar insights en este momento.',
    } satisfies FinancialInsightsState
  }

  return {
    status: 'loading',
    result: localResult,
  } satisfies FinancialInsightsState
}
