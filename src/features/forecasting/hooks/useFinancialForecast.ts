import { useEffect, useMemo, useState } from 'react'

import { analyzeFinancialForecast, buildLocalFinancialForecast } from '@/features/forecasting/services/analyzeFinancialForecast'
import type {
  ForecastScenario,
  ForecastScenarioPreset,
  FinancialForecastState,
} from '@/features/forecasting/types/financialForecast'
import { useFinanceStore } from '@/hooks/useFinanceStore'

const defaultScenario: ForecastScenario = {
  extraIncome: 0,
  extraExpense: 0,
  extraDebtPayment: 0,
  savingsGoal: 0,
}

const scenarioPresets: ForecastScenarioPreset[] = [
  {
    id: 'salary-bonus',
    label: 'Bono extra',
    scenario: {
      extraIncome: 2000,
      extraExpense: 0,
      extraDebtPayment: 0,
      savingsGoal: 0,
    },
  },
  {
    id: 'debt-push',
    label: 'Abono a deuda',
    scenario: {
      extraIncome: 0,
      extraExpense: 0,
      extraDebtPayment: 1500,
      savingsGoal: 0,
    },
  },
  {
    id: 'save-first',
    label: 'Separar ahorro',
    scenario: {
      extraIncome: 0,
      extraExpense: 0,
      extraDebtPayment: 0,
      savingsGoal: 1000,
    },
  },
]

interface AsyncForecastState {
  requestKey: string
  status: 'idle' | 'ready' | 'error'
  result: FinancialForecastState['result']
  message?: string
}

export function useFinancialForecast() {
  const { selectors, state } = useFinanceStore()
  const [scenario, setScenario] = useState<ForecastScenario>(defaultScenario)
  const [asyncState, setAsyncState] = useState<AsyncForecastState>({
    requestKey: '',
    status: 'idle',
    result: null,
  })

  const requestKey = useMemo(
    () =>
      JSON.stringify({
        currentMonthKey: selectors.currentMonthKey,
        summary: selectors.currentMonthSummary,
        budget: selectors.budgetStatus,
        debt: selectors.debtSummary,
        outlook: selectors.financialOutlook,
        salary: selectors.salarySummary,
        scenario,
      }),
    [
      scenario,
      selectors.budgetStatus,
      selectors.currentMonthKey,
      selectors.currentMonthSummary,
      selectors.debtSummary,
      selectors.financialOutlook,
      selectors.salarySummary,
    ],
  )

  const localResult = useMemo(
    () =>
      buildLocalFinancialForecast({
        currency: state.currency,
        currentMonthKey: selectors.currentMonthKey,
        currentMonthSummary: selectors.currentMonthSummary,
        budgetStatus: selectors.budgetStatus,
        debtSummary: selectors.debtSummary,
        financialOutlook: selectors.financialOutlook,
        salarySummary: selectors.salarySummary,
        scenario,
      }),
    [
      scenario,
      selectors.budgetStatus,
      selectors.currentMonthKey,
      selectors.currentMonthSummary,
      selectors.debtSummary,
      selectors.financialOutlook,
      selectors.salarySummary,
      state.currency,
    ],
  )

  useEffect(() => {
    let isCancelled = false

    void analyzeFinancialForecast({
      currency: state.currency,
      currentMonthKey: selectors.currentMonthKey,
      currentMonthSummary: selectors.currentMonthSummary,
      budgetStatus: selectors.budgetStatus,
      debtSummary: selectors.debtSummary,
      financialOutlook: selectors.financialOutlook,
      salarySummary: selectors.salarySummary,
      scenario,
    })
      .then((result) => {
        if (isCancelled) {
          return
        }

        setAsyncState({
          requestKey,
          status: 'ready',
          result,
        })
      })
      .catch(() => {
        if (isCancelled) {
          return
        }

        setAsyncState({
          requestKey,
          status: 'error',
          result: null,
          message: 'No pudimos enriquecer la simulacion con IA. Te mostramos la proyeccion local.',
        })
      })

    return () => {
      isCancelled = true
    }
  }, [
    localResult,
    requestKey,
    scenario,
    selectors.budgetStatus,
    selectors.currentMonthKey,
    selectors.currentMonthSummary,
    selectors.debtSummary,
    selectors.financialOutlook,
    selectors.salarySummary,
    state.currency,
  ])

  const stateValue: FinancialForecastState =
    asyncState.requestKey === requestKey && asyncState.status === 'ready' && asyncState.result
      ? { status: 'ready', result: asyncState.result }
      : asyncState.requestKey === requestKey && asyncState.status === 'error'
        ? { status: 'error', result: localResult, message: asyncState.message ?? 'No pudimos proyectar el escenario.' }
        : { status: 'loading', result: localResult }

  return {
    state: stateValue,
    scenario,
    actions: {
      resetScenario: () => setScenario(defaultScenario),
      applyPreset: (presetId: string) => {
        const preset = scenarioPresets.find((item) => item.id === presetId)

        if (!preset) {
          return
        }

        setScenario(preset.scenario)
      },
      updateScenario: (key: keyof ForecastScenario, value: number) => {
        setScenario((current) => ({
          ...current,
          [key]: Number.isFinite(value) ? Math.max(0, value) : 0,
        }))
      },
    },
    selectors: {
      scenarioPresets,
    },
  }
}
