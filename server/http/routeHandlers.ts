import type {
  AiDocumentAnalysisRequest,
  AiForecastRequest,
  AiInsightsRequest,
  AiRecommendationsRequest,
  AiTransactionDraftRequest,
  AiTransactionOrganizationRequest,
} from '../../src/features/ai/contracts/aiContracts'
import {
  AI_GEMINI_MODEL,
  ENABLED_AI_MODULES,
  buildError,
  buildSuccess,
  chatRequestSchema,
  documentRequestSchema,
  forecastRequestSchema,
  insightsRequestSchema,
  recommendationsRequestSchema,
  transactionDraftRequestSchema,
  transactionOrganizationRequestSchema,
} from './shared.js'

type HandlerResult = {
  status: number
  body: unknown
}

export function getHealthPayload() {
  return {
    ok: true,
    service: 'ai-backend',
    model: AI_GEMINI_MODEL,
    enabledModules: ENABLED_AI_MODULES,
  }
}

export function methodNotAllowed(): HandlerResult {
  return {
    status: 405,
    body: buildError('AI_INVALID_REQUEST', 'Metodo no permitido para este endpoint.', true),
  }
}

export async function handleDocumentRequest(body: unknown): Promise<HandlerResult> {
  const parsed = documentRequestSchema.safeParse(body)
  if (!parsed.success) {
    return {
      status: 400,
      body: buildError('AI_INVALID_REQUEST', 'La solicitud de analisis documental no tiene el formato esperado.', true),
    }
  }

  const startedAt = Date.now()
  try {
    const { analyzeDocumentWithGemini } = await import('../ai/documents/analyzeDocumentWithGemini.js')
    const result = await analyzeDocumentWithGemini(parsed.data)
    return {
      status: 200,
      body: buildSuccess<typeof result, AiDocumentAnalysisRequest>(parsed.data, result, Date.now() - startedAt),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No pudimos analizar el documento con Gemini.'
    const code = message.includes('AI_GEMINI_API_KEY') ? 'AI_NOT_CONFIGURED' : 'AI_PROVIDER_ERROR'
    return {
      status: code === 'AI_NOT_CONFIGURED' ? 500 : 502,
      body: buildError(code, 'No pudimos obtener un analisis documental valido del servicio de IA.', true, {
        requestId: parsed.data.meta.requestId,
        module: 'documents',
        provider: 'gemini',
        model: AI_GEMINI_MODEL,
        durationMs: Date.now() - startedAt,
      }),
    }
  }
}

export async function handleChatRequest(body: unknown): Promise<HandlerResult> {
  const parsed = chatRequestSchema.safeParse(body)
  if (!parsed.success) {
    return {
      status: 400,
      body: buildError('AI_INVALID_REQUEST', 'La consulta al chat de IA no tiene el formato esperado.', true),
    }
  }

  const startedAt = Date.now()
  try {
    const { generateFinancialChatWithGemini } = await import('../ai/chat/generateFinancialChatWithGemini.js')
    const result = await generateFinancialChatWithGemini(parsed.data)
    return {
      status: 200,
      body: buildSuccess(parsed.data, result, Date.now() - startedAt),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No pudimos completar la consulta con Gemini.'
    const code = message.includes('AI_GEMINI_API_KEY') ? 'AI_NOT_CONFIGURED' : 'AI_PROVIDER_ERROR'
    return {
      status: code === 'AI_NOT_CONFIGURED' ? 500 : 502,
      body: buildError(code, 'No pudimos obtener una respuesta valida del servicio de IA.', true, {
        requestId: parsed.data.meta.requestId,
        module: 'chat',
        provider: 'gemini',
        model: AI_GEMINI_MODEL,
        durationMs: Date.now() - startedAt,
      }),
    }
  }
}

export async function handleRecommendationsRequest(body: unknown): Promise<HandlerResult> {
  const parsed = recommendationsRequestSchema.safeParse(body)
  if (!parsed.success) {
    return {
      status: 400,
      body: buildError('AI_INVALID_REQUEST', 'La solicitud de recomendaciones de IA no tiene el formato esperado.', true),
    }
  }

  const startedAt = Date.now()
  try {
    const { generateFinancialRecommendationsWithGemini } = await import('../ai/recommendations/generateFinancialRecommendationsWithGemini.js')
    const result = await generateFinancialRecommendationsWithGemini(parsed.data)
    return {
      status: 200,
      body: buildSuccess<typeof result, AiRecommendationsRequest>(parsed.data, result, Date.now() - startedAt),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No pudimos generar recomendaciones con Gemini.'
    const code = message.includes('AI_GEMINI_API_KEY') ? 'AI_NOT_CONFIGURED' : 'AI_PROVIDER_ERROR'
    return {
      status: code === 'AI_NOT_CONFIGURED' ? 500 : 502,
      body: buildError(code, 'No pudimos obtener recomendaciones validas del servicio de IA.', true, {
        requestId: parsed.data.meta.requestId,
        module: 'recommendations',
        provider: 'gemini',
        model: AI_GEMINI_MODEL,
        durationMs: Date.now() - startedAt,
      }),
    }
  }
}

export async function handleInsightsRequest(body: unknown): Promise<HandlerResult> {
  const parsed = insightsRequestSchema.safeParse(body)
  if (!parsed.success) {
    return {
      status: 400,
      body: buildError('AI_INVALID_REQUEST', 'La solicitud de insights de IA no tiene el formato esperado.', true),
    }
  }

  const startedAt = Date.now()
  try {
    const { generateFinancialInsightsWithGemini } = await import('../ai/insights/generateFinancialInsightsWithGemini.js')
    const result = await generateFinancialInsightsWithGemini(parsed.data)
    return {
      status: 200,
      body: buildSuccess<typeof result, AiInsightsRequest>(parsed.data, result, Date.now() - startedAt),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No pudimos generar insights con Gemini.'
    const code = message.includes('AI_GEMINI_API_KEY') ? 'AI_NOT_CONFIGURED' : 'AI_PROVIDER_ERROR'
    return {
      status: code === 'AI_NOT_CONFIGURED' ? 500 : 502,
      body: buildError(code, 'No pudimos obtener insights validos del servicio de IA.', true, {
        requestId: parsed.data.meta.requestId,
        module: 'insights',
        provider: 'gemini',
        model: AI_GEMINI_MODEL,
        durationMs: Date.now() - startedAt,
      }),
    }
  }
}

export async function handleForecastRequest(body: unknown): Promise<HandlerResult> {
  const parsed = forecastRequestSchema.safeParse(body)
  if (!parsed.success) {
    return {
      status: 400,
      body: buildError('AI_INVALID_REQUEST', 'La solicitud de proyeccion de IA no tiene el formato esperado.', true),
    }
  }

  const startedAt = Date.now()
  try {
    const { generateFinancialForecastWithGemini } = await import('../ai/forecasting/generateFinancialForecastWithGemini.js')
    const result = await generateFinancialForecastWithGemini(parsed.data)
    return {
      status: 200,
      body: buildSuccess<typeof result, AiForecastRequest>(parsed.data, result, Date.now() - startedAt),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No pudimos generar la proyeccion con Gemini.'
    const code = message.includes('AI_GEMINI_API_KEY') ? 'AI_NOT_CONFIGURED' : 'AI_PROVIDER_ERROR'
    return {
      status: code === 'AI_NOT_CONFIGURED' ? 500 : 502,
      body: buildError(code, 'No pudimos obtener una proyeccion valida del servicio de IA.', true, {
        requestId: parsed.data.meta.requestId,
        module: 'forecasting',
        provider: 'gemini',
        model: AI_GEMINI_MODEL,
        durationMs: Date.now() - startedAt,
      }),
    }
  }
}

export async function handleTransactionClassifierRequest(body: unknown): Promise<HandlerResult> {
  const parsed = transactionDraftRequestSchema.safeParse(body)
  if (!parsed.success) {
    return {
      status: 400,
      body: buildError('AI_INVALID_REQUEST', 'La solicitud de clasificacion de transaccion no tiene el formato esperado.', true),
    }
  }

  const startedAt = Date.now()
  try {
    const { classifyTransactionWithGemini } = await import('../ai/transactions/classifyTransactionWithGemini.js')
    const result = await classifyTransactionWithGemini(parsed.data)
    return {
      status: 200,
      body: buildSuccess<typeof result, AiTransactionDraftRequest>(parsed.data, result, Date.now() - startedAt),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No pudimos clasificar el movimiento con Gemini.'
    const code = message.includes('AI_GEMINI_API_KEY') ? 'AI_NOT_CONFIGURED' : 'AI_PROVIDER_ERROR'
    return {
      status: code === 'AI_NOT_CONFIGURED' ? 500 : 502,
      body: buildError(code, 'No pudimos obtener una clasificacion valida del servicio de IA.', true, {
        requestId: parsed.data.meta.requestId,
        module: 'transaction-classifier',
        provider: 'gemini',
        model: AI_GEMINI_MODEL,
        durationMs: Date.now() - startedAt,
      }),
    }
  }
}

export async function handleTransactionOrganizationRequest(body: unknown): Promise<HandlerResult> {
  const parsed = transactionOrganizationRequestSchema.safeParse(body)
  if (!parsed.success) {
    return {
      status: 400,
      body: buildError('AI_INVALID_REQUEST', 'La solicitud de organizacion de transacciones no tiene el formato esperado.', true),
    }
  }

  const startedAt = Date.now()
  try {
    const { organizeTransactionsWithGemini } = await import('../ai/transactions/organizeTransactionsWithGemini.js')
    const result = await organizeTransactionsWithGemini(parsed.data)
    return {
      status: 200,
      body: buildSuccess<typeof result, AiTransactionOrganizationRequest>(parsed.data, result, Date.now() - startedAt),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No pudimos analizar la organizacion de movimientos con Gemini.'
    const code = message.includes('AI_GEMINI_API_KEY') ? 'AI_NOT_CONFIGURED' : 'AI_PROVIDER_ERROR'
    return {
      status: code === 'AI_NOT_CONFIGURED' ? 500 : 502,
      body: buildError(code, 'No pudimos obtener sugerencias validas de organizacion desde IA.', true, {
        requestId: parsed.data.meta.requestId,
        module: 'transaction-organization',
        provider: 'gemini',
        model: AI_GEMINI_MODEL,
        durationMs: Date.now() - startedAt,
      }),
    }
  }
}
