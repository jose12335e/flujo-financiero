import express from 'express'

import { AI_SERVER_PORT } from './http/shared'
import {
  getHealthPayload,
  handleChatRequest,
  handleDocumentRequest,
  handleForecastRequest,
  handleInsightsRequest,
  handleRecommendationsRequest,
  handleTransactionClassifierRequest,
  handleTransactionOrganizationRequest,
} from './http/routeHandlers'

export { AI_SERVER_PORT }

export function createAiApp() {
  const app = express()

  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', (_request, response) => {
    response.json(getHealthPayload())
  })

  app.post('/api/ai/documents/analyze', async (request, response) => {
    const result = await handleDocumentRequest(request.body)
    response.status(result.status).json(result.body)
  })

  app.post('/api/ai/chat/message', async (request, response) => {
    const result = await handleChatRequest(request.body)
    response.status(result.status).json(result.body)
  })

  app.post('/api/ai/recommendations/generate', async (request, response) => {
    const result = await handleRecommendationsRequest(request.body)
    response.status(result.status).json(result.body)
  })

  app.post('/api/ai/insights/generate', async (request, response) => {
    const result = await handleInsightsRequest(request.body)
    response.status(result.status).json(result.body)
  })

  app.post('/api/ai/forecasting/generate', async (request, response) => {
    const result = await handleForecastRequest(request.body)
    response.status(result.status).json(result.body)
  })

  app.post('/api/ai/transactions/classify', async (request, response) => {
    const result = await handleTransactionClassifierRequest(request.body)
    response.status(result.status).json(result.body)
  })

  app.post('/api/ai/transactions/organize', async (request, response) => {
    const result = await handleTransactionOrganizationRequest(request.body)
    response.status(result.status).json(result.body)
  })

  app.use('/api/ai', (_request, response) => {
    response.status(501).json({
      ok: false,
      error: {
        code: 'AI_PROVIDER_ERROR',
        message: 'Ese endpoint de IA todavia no esta conectado al backend real.',
        recoverable: true,
      },
    })
  })

  return app
}

export const app = createAiApp()
