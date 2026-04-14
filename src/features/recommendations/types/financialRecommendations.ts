export type FinancialRecommendationSource = 'local' | 'ai' | 'hybrid'
export type FinancialRecommendationPriority = 'low' | 'medium' | 'high'

export interface FinancialRecommendationItem {
  id: string
  title: string
  description: string
  priority: FinancialRecommendationPriority
  analysisSource: FinancialRecommendationSource
}

export interface FinancialRecommendationsResult {
  recommendations: FinancialRecommendationItem[]
  summary: string
  analysisSource: FinancialRecommendationSource
}

export type FinancialRecommendationsState =
  | { status: 'idle'; result: FinancialRecommendationsResult | null }
  | { status: 'loading'; result: FinancialRecommendationsResult | null }
  | { status: 'ready'; result: FinancialRecommendationsResult }
  | { status: 'error'; result: FinancialRecommendationsResult | null; message: string }
