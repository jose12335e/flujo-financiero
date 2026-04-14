import type { AiRequestMeta, AiModuleKey } from '@/features/ai/types/ai'

export type AiDocumentKind = 'payslip' | 'receipt' | 'transfer' | 'unknown'
export type AiTextExtractionMethod = 'pdf-text' | 'ocr' | 'mixed' | 'manual'

export interface AiDocumentAnalysisRequest {
  meta: AiRequestMeta
  payload: {
    fileName: string
    mimeType: string
    extractionMethod: AiTextExtractionMethod
    extractedText: string
    kindHint?: AiDocumentKind
  }
}

export interface AiDocumentAnalysisResult {
  documentType: AiDocumentKind
  confidence: number
  summary?: string
  extracted: Record<string, unknown>
  debugReasons?: string[]
}

export interface AiTransactionDraftRequest {
  meta: AiRequestMeta
  payload: {
    userText: string
    currency?: string
    locale?: string
  }
}

export interface AiTransactionDraftResult {
  type?: 'income' | 'expense'
  amount?: number
  categoryId?: string
  description?: string
  date?: string
  confidence: number
  reasoning?: string[]
}

export interface AiTransactionOrganizationRequest {
  meta: AiRequestMeta
  payload: {
    currency?: string
    transactions: Array<{
      id: string
      type: 'income' | 'expense'
      amount: number
      categoryId: string
      description: string
      date: string
      source?: string
    }>
    categories: Array<{
      id: string
      type: 'income' | 'expense'
      label: string
    }>
  }
}

export interface AiTransactionOrganizationResult {
  summary?: string
  suggestions: Array<{
    kind: 'category' | 'fixed-expense' | 'duplicate' | 'description'
    transactionId: string
    relatedTransactionIds?: string[]
    title: string
    description: string
    confidence: number
    suggestedCategoryId?: string
    reasoning?: string[]
  }>
}

export interface AiInsightsRequest {
  meta: AiRequestMeta
  payload: {
    monthKey: string
    snapshot: Record<string, unknown>
  }
}

export interface AiInsightsResult {
  summary: string
  insights: string[]
  riskFlags?: string[]
}

export interface AiRecommendationsRequest {
  meta: AiRequestMeta
  payload: {
    snapshot: Record<string, unknown>
    goals?: string[]
  }
}

export interface AiRecommendationsResult {
  recommendations: Array<{
    id: string
    title: string
    description: string
    priority: 'low' | 'medium' | 'high'
  }>
}

export interface AiChatRequest {
  meta: AiRequestMeta
  payload: {
    question: string
    contextSnapshot?: Record<string, unknown>
    conversationId?: string
  }
}

export interface AiChatResult {
  answer: string
  followUps?: string[]
}

export interface AiForecastRequest {
  meta: AiRequestMeta
  payload: {
    monthKey: string
    snapshot: Record<string, unknown>
    scenario?: Record<string, unknown>
  }
}

export interface AiForecastResult {
  projectedBalance: number
  explanation: string
  riskLevel: 'low' | 'medium' | 'high'
}

export type AiContractMap = {
  documents: {
    request: AiDocumentAnalysisRequest
    response: AiDocumentAnalysisResult
  }
  'transaction-classifier': {
    request: AiTransactionDraftRequest
    response: AiTransactionDraftResult
  }
  'transaction-organization': {
    request: AiTransactionOrganizationRequest
    response: AiTransactionOrganizationResult
  }
  insights: {
    request: AiInsightsRequest
    response: AiInsightsResult
  }
  recommendations: {
    request: AiRecommendationsRequest
    response: AiRecommendationsResult
  }
  chat: {
    request: AiChatRequest
    response: AiChatResult
  }
  forecasting: {
    request: AiForecastRequest
    response: AiForecastResult
  }
}

export type AiRequestForModule<TKey extends AiModuleKey> = AiContractMap[TKey]['request']
export type AiResponseForModule<TKey extends AiModuleKey> = AiContractMap[TKey]['response']
