import type { AiChatRequest, AiChatResult } from '../../../src/features/ai/contracts/aiContracts'
import { generateGeminiJson } from '../gemini/geminiClient'
import { buildFinancialChatPrompt } from './financialChatPrompt'
import { financialChatSchema } from './financialChatSchema'

export async function generateFinancialChatWithGemini(request: AiChatRequest) {
  return generateGeminiJson<AiChatResult>({
    schema: financialChatSchema,
    prompt: buildFinancialChatPrompt(request),
  })
}
