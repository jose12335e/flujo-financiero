import { useState } from 'react'

import { useAuth } from '@/hooks/useAuth'
import { useFinanceStore } from '@/hooks/useFinanceStore'
import { analyzeTransactionOrganization } from '@/features/transaction-organization/services/analyzeTransactionOrganization'
import type { TransactionOrganizationState } from '@/features/transaction-organization/types/transactionOrganization'

export function useTransactionOrganization() {
  const { user } = useAuth()
  const { selectors, state } = useFinanceStore()
  const [analysisState, setAnalysisState] = useState<TransactionOrganizationState>({ status: 'idle' })

  const analyze = async () => {
    setAnalysisState({ status: 'processing' })

    try {
      const result = await analyzeTransactionOrganization({
        transactions: selectors.sortedTransactions,
        categories: state.categories,
        currency: state.currency,
        locale: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        userId: user?.id,
      })

      setAnalysisState({
        status: 'ready',
        result,
      })
    } catch (error) {
      setAnalysisState({
        status: 'error',
        message: error instanceof Error ? error.message : 'No pudimos revisar la organizacion de tus movimientos.',
      })
    }
  }

  return {
    state: analysisState,
    selectors,
    categories: state.categories,
    actions: {
      analyze,
      reset: () => setAnalysisState({ status: 'idle' }),
    },
  }
}
