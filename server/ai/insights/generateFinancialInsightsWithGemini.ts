import type { AiInsightsRequest, AiInsightsResult } from '../../../src/features/ai/contracts/aiContracts'
import { buildFinancialInsightsPrompt } from './financialInsightsPrompt.js'
import { financialInsightsSchema } from './financialInsightsSchema.js'
import { generateGeminiJson } from '../gemini/geminiClient.js'

export async function generateFinancialInsightsWithGemini(request: AiInsightsRequest): Promise<AiInsightsResult> {
  return generateGeminiJson<AiInsightsResult>({
    prompt: buildFinancialInsightsPrompt(request),
    schema: financialInsightsSchema,
  })
}
