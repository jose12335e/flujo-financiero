import type { AiForecastRequest, AiForecastResult } from '@/features/ai/contracts/aiContracts'
import type { AiBackendResponse } from '@/features/ai/types/ai'
import { postAiRequest } from '@/features/ai/services/aiClient'

export function generateFinancialForecast(
  request: AiForecastRequest,
): Promise<AiBackendResponse<AiForecastResult>> {
  return postAiRequest('forecasting', '/api/ai/forecasting/generate', request)
}

