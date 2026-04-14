import type { AiForecastRequest, AiForecastResult } from '../../../src/features/ai/contracts/aiContracts'
import { generateGeminiJson } from '../gemini/geminiClient'
import { buildFinancialForecastPrompt } from './financialForecastPrompt'
import { financialForecastSchema } from './financialForecastSchema'

export async function generateFinancialForecastWithGemini(request: AiForecastRequest) {
  return generateGeminiJson<AiForecastResult>({
    schema: financialForecastSchema,
    prompt: buildFinancialForecastPrompt(request),
  })
}
