import type { AiInsightsRequest, AiInsightsResult } from '../../../src/features/ai/contracts/aiContracts'
import { buildFinancialInsightsPrompt } from './financialInsightsPrompt'
import { financialInsightsSchema } from './financialInsightsSchema'
import { generateGeminiJson } from '../gemini/geminiClient'

export async function generateFinancialInsightsWithGemini(request: AiInsightsRequest): Promise<AiInsightsResult> {
  return generateGeminiJson<AiInsightsResult>({
    prompt: buildFinancialInsightsPrompt(request),
    schema: financialInsightsSchema,
  })
}
