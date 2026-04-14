import type { AiTransactionOrganizationRequest, AiTransactionOrganizationResult } from '@/features/ai/contracts/aiContracts'
import type { AiBackendResponse } from '@/features/ai/types/ai'
import { postAiRequest } from '@/features/ai/services/aiClient'

export function organizeTransactionsWithAi(
  request: AiTransactionOrganizationRequest,
): Promise<AiBackendResponse<AiTransactionOrganizationResult>> {
  return postAiRequest('transaction-organization', '/api/ai/transactions/organize', request)
}
