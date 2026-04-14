import type { AiTransactionOrganizationRequest, AiTransactionOrganizationResult } from '../../../src/features/ai/contracts/aiContracts'
import { buildTransactionOrganizationPrompt } from './transactionOrganizationPrompt'
import { transactionOrganizationSchema } from './transactionOrganizationSchema'
import { generateGeminiJson } from '../gemini/geminiClient'

export async function organizeTransactionsWithGemini(
  request: AiTransactionOrganizationRequest,
): Promise<AiTransactionOrganizationResult> {
  return generateGeminiJson<AiTransactionOrganizationResult>({
    prompt: buildTransactionOrganizationPrompt(request),
    schema: transactionOrganizationSchema,
  })
}
