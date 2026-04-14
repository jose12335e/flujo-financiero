import type { AiChatRequest, AiChatResult } from '@/features/ai/contracts/aiContracts'
import type { AiBackendResponse } from '@/features/ai/types/ai'
import { postAiRequest } from '@/features/ai/services/aiClient'

export function sendFinancialChatMessage(request: AiChatRequest): Promise<AiBackendResponse<AiChatResult>> {
  return postAiRequest('chat', '/api/ai/chat/message', request)
}

