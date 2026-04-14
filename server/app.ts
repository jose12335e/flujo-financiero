import express from 'express'
import { z } from 'zod'

import { generateFinancialChatWithGemini } from './ai/chat/generateFinancialChatWithGemini'
import { analyzeDocumentWithGemini } from './ai/documents/analyzeDocumentWithGemini'
import { generateFinancialForecastWithGemini } from './ai/forecasting/generateFinancialForecastWithGemini'
import { generateFinancialInsightsWithGemini } from './ai/insights/generateFinancialInsightsWithGemini'
import { generateFinancialRecommendationsWithGemini } from './ai/recommendations/generateFinancialRecommendationsWithGemini'
import { classifyTransactionWithGemini } from './ai/transactions/classifyTransactionWithGemini'
import { organizeTransactionsWithGemini } from './ai/transactions/organizeTransactionsWithGemini'
import type { AiBackendResponse, AiErrorPayload, AiResponseMeta } from '../src/features/ai/types/ai'
import type {
  AiChatRequest,
  AiDocumentAnalysisRequest,
  AiForecastRequest,
  AiInsightsRequest,
  AiRecommendationsRequest,
  AiTransactionDraftRequest,
  AiTransactionOrganizationRequest,
} from '../src/features/ai/contracts/aiContracts'

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

const chatRequestSchema = z.object({
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

const documentRequestSchema = z.object({
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

const recommendationsRequestSchema = z.object({
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

const insightsRequestSchema = z.object({
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

const forecastRequestSchema = z.object({
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

const transactionDraftRequestSchema = z.object({
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

const transactionOrganizationRequestSchema = z.object({
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

function buildError(
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

function buildSuccess<TData, TRequest extends { meta: { requestId: string; module: AiResponseMeta['module'] } }>(
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

export function createAiApp() {
  const app = express()

  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', (_request, response) => {
    response.json({
      ok: true,
      service: 'ai-backend',
      model: AI_GEMINI_MODEL,
      enabledModules: ENABLED_AI_MODULES,
    })
  })

  app.post('/api/ai/documents/analyze', async (request, response) => {
    const parsed = documentRequestSchema.safeParse(request.body)

    if (!parsed.success) {
      response
        .status(400)
        .json(buildError('AI_INVALID_REQUEST', 'La solicitud de analisis documental no tiene el formato esperado.', true))
      return
    }

    const startedAt = Date.now()

    try {
      const result = await analyzeDocumentWithGemini(parsed.data)
      response.json(buildSuccess<typeof result, AiDocumentAnalysisRequest>(parsed.data, result, Date.now() - startedAt))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos analizar el documento con Gemini.'
      const code = message.includes('AI_GEMINI_API_KEY') ? 'AI_NOT_CONFIGURED' : 'AI_PROVIDER_ERROR'

      response.status(code === 'AI_NOT_CONFIGURED' ? 500 : 502).json(
        buildError(code, 'No pudimos obtener un analisis documental valido del servicio de IA.', true, {
          requestId: parsed.data.meta.requestId,
          module: 'documents',
          provider: 'gemini',
          model: AI_GEMINI_MODEL,
          durationMs: Date.now() - startedAt,
        }),
      )
    }
  })

  app.post('/api/ai/chat/message', async (request, response) => {
    const parsed = chatRequestSchema.safeParse(request.body)

    if (!parsed.success) {
      response.status(400).json(buildError('AI_INVALID_REQUEST', 'La consulta al chat de IA no tiene el formato esperado.', true))
      return
    }

    const startedAt = Date.now()

    try {
      const result = await generateFinancialChatWithGemini(parsed.data)
      response.json(buildSuccess(parsed.data, result, Date.now() - startedAt))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos completar la consulta con Gemini.'
      const code = message.includes('AI_GEMINI_API_KEY') ? 'AI_NOT_CONFIGURED' : 'AI_PROVIDER_ERROR'

      response.status(code === 'AI_NOT_CONFIGURED' ? 500 : 502).json(
        buildError(code, 'No pudimos obtener una respuesta valida del servicio de IA.', true, {
          requestId: parsed.data.meta.requestId,
          module: 'chat',
          provider: 'gemini',
          model: AI_GEMINI_MODEL,
          durationMs: Date.now() - startedAt,
        }),
      )
    }
  })

  app.post('/api/ai/recommendations/generate', async (request, response) => {
    const parsed = recommendationsRequestSchema.safeParse(request.body)

    if (!parsed.success) {
      response
        .status(400)
        .json(buildError('AI_INVALID_REQUEST', 'La solicitud de recomendaciones de IA no tiene el formato esperado.', true))
      return
    }

    const startedAt = Date.now()

    try {
      const result = await generateFinancialRecommendationsWithGemini(parsed.data)
      response.json(buildSuccess<typeof result, AiRecommendationsRequest>(parsed.data, result, Date.now() - startedAt))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos generar recomendaciones con Gemini.'
      const code = message.includes('AI_GEMINI_API_KEY') ? 'AI_NOT_CONFIGURED' : 'AI_PROVIDER_ERROR'

      response.status(code === 'AI_NOT_CONFIGURED' ? 500 : 502).json(
        buildError(code, 'No pudimos obtener recomendaciones validas del servicio de IA.', true, {
          requestId: parsed.data.meta.requestId,
          module: 'recommendations',
          provider: 'gemini',
          model: AI_GEMINI_MODEL,
          durationMs: Date.now() - startedAt,
        }),
      )
    }
  })

  app.post('/api/ai/insights/generate', async (request, response) => {
    const parsed = insightsRequestSchema.safeParse(request.body)

    if (!parsed.success) {
      response
        .status(400)
        .json(buildError('AI_INVALID_REQUEST', 'La solicitud de insights de IA no tiene el formato esperado.', true))
      return
    }

    const startedAt = Date.now()

    try {
      const result = await generateFinancialInsightsWithGemini(parsed.data)
      response.json(buildSuccess<typeof result, AiInsightsRequest>(parsed.data, result, Date.now() - startedAt))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos generar insights con Gemini.'
      const code = message.includes('AI_GEMINI_API_KEY') ? 'AI_NOT_CONFIGURED' : 'AI_PROVIDER_ERROR'

      response.status(code === 'AI_NOT_CONFIGURED' ? 500 : 502).json(
        buildError(code, 'No pudimos obtener insights validos del servicio de IA.', true, {
          requestId: parsed.data.meta.requestId,
          module: 'insights',
          provider: 'gemini',
          model: AI_GEMINI_MODEL,
          durationMs: Date.now() - startedAt,
        }),
      )
    }
  })

  app.post('/api/ai/forecasting/generate', async (request, response) => {
    const parsed = forecastRequestSchema.safeParse(request.body)

    if (!parsed.success) {
      response
        .status(400)
        .json(buildError('AI_INVALID_REQUEST', 'La solicitud de proyeccion de IA no tiene el formato esperado.', true))
      return
    }

    const startedAt = Date.now()

    try {
      const result = await generateFinancialForecastWithGemini(parsed.data)
      response.json(buildSuccess<typeof result, AiForecastRequest>(parsed.data, result, Date.now() - startedAt))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos generar la proyeccion con Gemini.'
      const code = message.includes('AI_GEMINI_API_KEY') ? 'AI_NOT_CONFIGURED' : 'AI_PROVIDER_ERROR'

      response.status(code === 'AI_NOT_CONFIGURED' ? 500 : 502).json(
        buildError(code, 'No pudimos obtener una proyeccion valida del servicio de IA.', true, {
          requestId: parsed.data.meta.requestId,
          module: 'forecasting',
          provider: 'gemini',
          model: AI_GEMINI_MODEL,
          durationMs: Date.now() - startedAt,
        }),
      )
    }
  })

  app.post('/api/ai/transactions/classify', async (request, response) => {
    const parsed = transactionDraftRequestSchema.safeParse(request.body)

    if (!parsed.success) {
      response
        .status(400)
        .json(buildError('AI_INVALID_REQUEST', 'La solicitud de clasificacion de transaccion no tiene el formato esperado.', true))
      return
    }

    const startedAt = Date.now()

    try {
      const result = await classifyTransactionWithGemini(parsed.data)
      response.json(buildSuccess<typeof result, AiTransactionDraftRequest>(parsed.data, result, Date.now() - startedAt))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos clasificar el movimiento con Gemini.'
      const code = message.includes('AI_GEMINI_API_KEY') ? 'AI_NOT_CONFIGURED' : 'AI_PROVIDER_ERROR'

      response.status(code === 'AI_NOT_CONFIGURED' ? 500 : 502).json(
        buildError(code, 'No pudimos obtener una clasificacion valida del servicio de IA.', true, {
          requestId: parsed.data.meta.requestId,
          module: 'transaction-classifier',
          provider: 'gemini',
          model: AI_GEMINI_MODEL,
          durationMs: Date.now() - startedAt,
        }),
      )
    }
  })

  app.post('/api/ai/transactions/organize', async (request, response) => {
    const parsed = transactionOrganizationRequestSchema.safeParse(request.body)

    if (!parsed.success) {
      response
        .status(400)
        .json(buildError('AI_INVALID_REQUEST', 'La solicitud de organizacion de transacciones no tiene el formato esperado.', true))
      return
    }

    const startedAt = Date.now()

    try {
      const result = await organizeTransactionsWithGemini(parsed.data)
      response.json(buildSuccess<typeof result, AiTransactionOrganizationRequest>(parsed.data, result, Date.now() - startedAt))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos analizar la organizacion de movimientos con Gemini.'
      const code = message.includes('AI_GEMINI_API_KEY') ? 'AI_NOT_CONFIGURED' : 'AI_PROVIDER_ERROR'

      response.status(code === 'AI_NOT_CONFIGURED' ? 500 : 502).json(
        buildError(code, 'No pudimos obtener sugerencias validas de organizacion desde IA.', true, {
          requestId: parsed.data.meta.requestId,
          module: 'transaction-organization',
          provider: 'gemini',
          model: AI_GEMINI_MODEL,
          durationMs: Date.now() - startedAt,
        }),
      )
    }
  })

  app.use('/api/ai', (_request, response) => {
    response.status(501).json(buildError('AI_PROVIDER_ERROR', 'Ese endpoint de IA todavia no esta conectado al backend real.', true))
  })

  return app
}

export const app = createAiApp()
