import type { AiTransactionOrganizationRequest, AiTransactionOrganizationResult } from '../../../src/features/ai/contracts/aiContracts'
import { buildTransactionOrganizationPrompt } from './transactionOrganizationPrompt.js'
import { transactionOrganizationSchema } from './transactionOrganizationSchema.js'
import { generateGeminiJson } from '../gemini/geminiClient.js'

export async function organizeTransactionsWithGemini(
  request: AiTransactionOrganizationRequest,
): Promise<AiTransactionOrganizationResult> {
  return generateGeminiJson<AiTransactionOrganizationResult>({
    prompt: buildTransactionOrganizationPrompt(request),
    schema: transactionOrganizationSchema,
  })
}
