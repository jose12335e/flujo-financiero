import type { AiTransactionDraftRequest, AiTransactionDraftResult } from '../../../src/features/ai/contracts/aiContracts'
import { buildTransactionClassificationPrompt } from './transactionClassificationPrompt'
import { transactionClassificationSchema } from './transactionClassificationSchema'
import { generateGeminiJson } from '../gemini/geminiClient'

export async function classifyTransactionWithGemini(request: AiTransactionDraftRequest): Promise<AiTransactionDraftResult> {
  return generateGeminiJson<AiTransactionDraftResult>({
    prompt: buildTransactionClassificationPrompt(request),
    schema: transactionClassificationSchema,
  })
}
