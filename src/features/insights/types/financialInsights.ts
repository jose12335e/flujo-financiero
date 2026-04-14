export type FinancialInsightsSource = 'local' | 'ai' | 'hybrid'

export interface FinancialInsightsResult {
  summary: string
  insights: string[]
  riskFlags: string[]
  analysisSource: FinancialInsightsSource
}

export type FinancialInsightsState =
  | { status: 'idle'; result: FinancialInsightsResult | null }
  | { status: 'loading'; result: FinancialInsightsResult | null }
  | { status: 'ready'; result: FinancialInsightsResult }
  | { status: 'error'; result: FinancialInsightsResult | null; message: string }
