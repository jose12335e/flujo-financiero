import type { AiRecommendationsRequest, AiRecommendationsResult } from '../../../src/features/ai/contracts/aiContracts'
import { buildFinancialRecommendationsPrompt } from './financialRecommendationsPrompt'
import { financialRecommendationsSchema } from './financialRecommendationsSchema'
import { generateGeminiJson } from '../gemini/geminiClient'

export async function generateFinancialRecommendationsWithGemini(
  request: AiRecommendationsRequest,
): Promise<AiRecommendationsResult> {
  return generateGeminiJson<AiRecommendationsResult>({
    prompt: buildFinancialRecommendationsPrompt(request),
    schema: financialRecommendationsSchema,
  })
}
