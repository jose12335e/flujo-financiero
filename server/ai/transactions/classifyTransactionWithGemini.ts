import type { AiTransactionDraftRequest, AiTransactionDraftResult } from '../../../src/features/ai/contracts/aiContracts'
import { buildTransactionClassificationPrompt } from './transactionClassificationPrompt.js'
import { transactionClassificationSchema } from './transactionClassificationSchema.js'
import { generateGeminiJson } from '../gemini/geminiClient.js'

export async function classifyTransactionWithGemini(request: AiTransactionDraftRequest): Promise<AiTransactionDraftResult> {
  return generateGeminiJson<AiTransactionDraftResult>({
    prompt: buildTransactionClassificationPrompt(request),
    schema: transactionClassificationSchema,
  })
}
