import type { AiInsightsRequest, AiInsightsResult } from '@/features/ai/contracts/aiContracts'
import type { AiBackendResponse } from '@/features/ai/types/ai'
import { postAiRequest } from '@/features/ai/services/aiClient'

export function generateFinancialInsights(
  request: AiInsightsRequest,
): Promise<AiBackendResponse<AiInsightsResult>> {
  return postAiRequest('insights', '/api/ai/insights/generate', request)
}

