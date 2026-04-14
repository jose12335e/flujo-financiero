import { z } from 'zod'

import type { AiBackendResponse, AiErrorPayload, AiResponseMeta } from '../../src/features/ai/types/ai'
import type {
  AiChatRequest,
  AiDocumentAnalysisRequest,
  AiForecastRequest,
  AiInsightsRequest,
  AiRecommendationsRequest,
  AiTransactionDraftRequest,
  AiTransactionOrganizationRequest,
} from '../../src/features/ai/contracts/aiContracts'

export const AI_SERVER_PORT = Number(process.env.AI_SERVER_PORT ?? 8787)
export const AI_GEMINI_MODEL = process.env.AI_GEMINI_MODEL || 'gemini-2.5-flash'
export const ENABLED_AI_MODULES = [
  'chat',
  'documents',
  'recommendations',
  'forecasting',
  'insights',
  'transaction-classifier',
  'transaction-organization',
] as const

export const chatRequestSchema = z.object({
  meta: z.object({
    requestId: z.string().min(1),
    module: z.literal('chat'),
    locale: z.string().optional(),
    timezone: z.string().optional(),
    userId: z.string().optional(),
  }),
  payload: z.object({
    question: z.string().min(1),
    contextSnapshot: z.record(z.string(), z.unknown()).optional(),
    conversationId: z.string().optional(),
  }),
}) satisfies z.ZodType<AiChatRequest>

export const documentRequestSchema = z.object({
  meta: z.object({
    requestId: z.string().min(1),
    module: z.literal('documents'),
    locale: z.string().optional(),
    timezone: z.string().optional(),
    userId: z.string().optional(),
  }),
  payload: z.object({
    fileName: z.string().min(1),
    mimeType: z.string().min(1),
    extractionMethod: z.enum(['pdf-text', 'ocr', 'mixed', 'manual']),
    extractedText: z.string().min(1),
    kindHint: z.enum(['payslip', 'receipt', 'transfer', 'unknown']).optional(),
  }),
}) satisfies z.ZodType<AiDocumentAnalysisRequest>

export const recommendationsRequestSchema = z.object({
  meta: z.object({
    requestId: z.string().min(1),
    module: z.literal('recommendations'),
    locale: z.string().optional(),
    timezone: z.string().optional(),
    userId: z.string().optional(),
  }),
  payload: z.object({
    snapshot: z.record(z.string(), z.unknown()),
    goals: z.array(z.string()).optional(),
  }),
}) satisfies z.ZodType<AiRecommendationsRequest>

export const insightsRequestSchema = z.object({
  meta: z.object({
    requestId: z.string().min(1),
    module: z.literal('insights'),
    locale: z.string().optional(),
    timezone: z.string().optional(),
    userId: z.string().optional(),
  }),
  payload: z.object({
    monthKey: z.string().min(1),
    snapshot: z.record(z.string(), z.unknown()),
  }),
}) satisfies z.ZodType<AiInsightsRequest>

export const forecastRequestSchema = z.object({
  meta: z.object({
    requestId: z.string().min(1),
    module: z.literal('forecasting'),
    locale: z.string().optional(),
    timezone: z.string().optional(),
    userId: z.string().optional(),
  }),
  payload: z.object({
    monthKey: z.string().min(1),
    snapshot: z.record(z.string(), z.unknown()),
    scenario: z.record(z.string(), z.unknown()).optional(),
  }),
}) satisfies z.ZodType<AiForecastRequest>

export const transactionDraftRequestSchema = z.object({
  meta: z.object({
    requestId: z.string().min(1),
    module: z.literal('transaction-classifier'),
    locale: z.string().optional(),
    timezone: z.string().optional(),
    userId: z.string().optional(),
  }),
  payload: z.object({
    userText: z.string().min(1),
    currency: z.string().optional(),
    locale: z.string().optional(),
  }),
}) satisfies z.ZodType<AiTransactionDraftRequest>

export const transactionOrganizationRequestSchema = z.object({
  meta: z.object({
    requestId: z.string().min(1),
    module: z.literal('transaction-organization'),
    locale: z.string().optional(),
    timezone: z.string().optional(),
    userId: z.string().optional(),
  }),
  payload: z.object({
    currency: z.string().optional(),
    transactions: z.array(
      z.object({
        id: z.string().min(1),
        type: z.enum(['income', 'expense']),
        amount: z.number(),
        categoryId: z.string().min(1),
        description: z.string(),
        date: z.string().min(1),
        source: z.string().optional(),
      }),
    ),
    categories: z.array(
      z.object({
        id: z.string().min(1),
        type: z.enum(['income', 'expense']),
        label: z.string().min(1),
      }),
    ),
  }),
}) satisfies z.ZodType<AiTransactionOrganizationRequest>

export function buildError(
  code: AiErrorPayload['code'],
  message: string,
  recoverable = true,
  meta?: Partial<AiResponseMeta>,
): AiBackendResponse<never> {
  return {
    ok: false,
    error: {
      code,
      message,
      recoverable,
    },
    meta,
  }
}

export function buildSuccess<TData, TRequest extends { meta: { requestId: string; module: AiResponseMeta['module'] } }>(
  request: TRequest,
  data: TData,
  durationMs: number,
): AiBackendResponse<TData> {
  return {
    ok: true,
    data,
    meta: {
      requestId: request.meta.requestId,
      module: request.meta.module,
      provider: 'gemini',
      model: AI_GEMINI_MODEL,
      durationMs,
    },
  }
}
