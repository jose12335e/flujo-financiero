import type { Category, Transaction } from '@/types/finance'

export type TransactionOrganizationSuggestionKind = 'category' | 'fixed-expense' | 'duplicate' | 'description'
export type TransactionOrganizationSource = 'local' | 'ai' | 'hybrid'

export interface TransactionOrganizationSuggestion {
  id: string
  kind: TransactionOrganizationSuggestionKind
  transactionId: string
  relatedTransactionIds?: string[]
  title: string
  description: string
  confidence: number
  confidenceLabel: 'low' | 'medium' | 'high'
  suggestedCategoryId?: string
  analysisSource: TransactionOrganizationSource
  reasoning: string[]
}

export interface TransactionOrganizationSummary {
  totalSuggestions: number
  categorySuggestions: number
  fixedExpenseCandidates: number
  duplicateCandidates: number
  descriptionSuggestions: number
}

export interface TransactionOrganizationResult {
  summary: TransactionOrganizationSummary
  suggestions: TransactionOrganizationSuggestion[]
  overview?: string
}

export interface TransactionOrganizationContext {
  transactions: Transaction[]
  categories: Category[]
  currency: string
  locale?: string
  timezone?: string
  userId?: string
}

export type TransactionOrganizationState =
  | { status: 'idle' }
  | { status: 'processing' }
  | { status: 'ready'; result: TransactionOrganizationResult }
  | { status: 'error'; message: string }
