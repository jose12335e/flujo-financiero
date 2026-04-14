import type { AiTransactionDraftRequest, AiTransactionDraftResult } from '@/features/ai/contracts/aiContracts'
import type { AiBackendResponse } from '@/features/ai/types/ai'
import { postAiRequest } from '@/features/ai/services/aiClient'

export function classifyTransactionTextWithAi(
  request: AiTransactionDraftRequest,
): Promise<AiBackendResponse<AiTransactionDraftResult>> {
  return postAiRequest('transaction-classifier', '/api/ai/transactions/classify', request)
}

