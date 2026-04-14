import type { AiForecastRequest, AiForecastResult } from '../../../src/features/ai/contracts/aiContracts'
import { generateGeminiJson } from '../gemini/geminiClient.js'
import { buildFinancialForecastPrompt } from './financialForecastPrompt.js'
import { financialForecastSchema } from './financialForecastSchema.js'

export async function generateFinancialForecastWithGemini(request: AiForecastRequest) {
  return generateGeminiJson<AiForecastResult>({
    schema: financialForecastSchema,
    prompt: buildFinancialForecastPrompt(request),
  })
}
