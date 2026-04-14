import type { AiDocumentAnalysisRequest, AiDocumentAnalysisResult } from '@/features/ai/contracts/aiContracts'
import type { AiBackendResponse } from '@/features/ai/types/ai'
import { postAiRequest } from '@/features/ai/services/aiClient'

export function analyzeDocumentWithAi(request: AiDocumentAnalysisRequest): Promise<AiBackendResponse<AiDocumentAnalysisResult>> {
  return postAiRequest('documents', '/api/ai/documents/analyze', request)
}

