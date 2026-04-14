export interface ForecastScenario {
  extraIncome: number
  extraExpense: number
  extraDebtPayment: number
  savingsGoal: number
}

export interface ForecastScenarioPreset {
  id: string
  label: string
  scenario: ForecastScenario
}

export interface FinancialForecastResult {
  projectedClosingBalance: number
  projectedFreeCashFlow: number
  projectedSavings: number
  debtMonthsReduced: number
  riskLevel: 'low' | 'medium' | 'high'
  summary: string
  highlights: string[]
  analysisSource: 'local' | 'ai' | 'hybrid'
}

export type FinancialForecastState =
  | { status: 'idle'; result: FinancialForecastResult | null }
  | { status: 'loading'; result: FinancialForecastResult | null }
  | { status: 'ready'; result: FinancialForecastResult }
  | { status: 'error'; result: FinancialForecastResult | null; message: string }
