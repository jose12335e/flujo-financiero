import type { Category, TransactionFormValues, TransactionType } from '@/types/finance'

export type TransactionDraftAnalysisSource = 'local' | 'ai' | 'hybrid'

export interface TransactionDraftValues {
  type: TransactionType
  amount?: number
  categoryId?: string
  description: string
  date: string
}

export interface TransactionDraftSuggestion {
  values: TransactionDraftValues
  confidence: number
  confidenceLabel: 'low' | 'medium' | 'high'
  analysisSource: TransactionDraftAnalysisSource
  reasoning: string[]
  warnings: string[]
  rawInput: string
}

export type TransactionDraftState =
  | { status: 'idle'; input: string }
  | { status: 'processing'; input: string }
  | { status: 'review'; input: string; suggestion: TransactionDraftSuggestion }
  | { status: 'error'; input: string; message: string }

export interface TransactionDraftContext {
  currency: string
  categories: Category[]
  locale?: string
  timezone?: string
  userId?: string
}

export interface RegisterPageDraftState {
  draftValues: TransactionFormValues
  draftMeta: {
    analysisSource: TransactionDraftAnalysisSource
    confidenceLabel: TransactionDraftSuggestion['confidenceLabel']
  }
}
