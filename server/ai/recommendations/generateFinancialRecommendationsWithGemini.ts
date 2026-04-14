import type { AiRecommendationsRequest, AiRecommendationsResult } from '../../../src/features/ai/contracts/aiContracts'
import { buildFinancialRecommendationsPrompt } from './financialRecommendationsPrompt.js'
import { financialRecommendationsSchema } from './financialRecommendationsSchema.js'
import { generateGeminiJson } from '../gemini/geminiClient.js'

export async function generateFinancialRecommendationsWithGemini(
  request: AiRecommendationsRequest,
): Promise<AiRecommendationsResult> {
  return generateGeminiJson<AiRecommendationsResult>({
    prompt: buildFinancialRecommendationsPrompt(request),
    schema: financialRecommendationsSchema,
  })
}
