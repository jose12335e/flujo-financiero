import type { AiRecommendationsRequest, AiRecommendationsResult } from '@/features/ai/contracts/aiContracts'
import type { AiBackendResponse } from '@/features/ai/types/ai'
import { postAiRequest } from '@/features/ai/services/aiClient'

export function generateRecommendations(
  request: AiRecommendationsRequest,
): Promise<AiBackendResponse<AiRecommendationsResult>> {
  return postAiRequest('recommendations', '/api/ai/recommendations/generate', request)
}

