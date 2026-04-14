import type { AiChatRequest, AiChatResult } from '../../../src/features/ai/contracts/aiContracts'
import { generateGeminiJson } from '../gemini/geminiClient.js'
import { buildFinancialChatPrompt } from './financialChatPrompt.js'
import { financialChatSchema } from './financialChatSchema.js'

export async function generateFinancialChatWithGemini(request: AiChatRequest) {
  return generateGeminiJson<AiChatResult>({
    schema: financialChatSchema,
    prompt: buildFinancialChatPrompt(request),
  })
}
