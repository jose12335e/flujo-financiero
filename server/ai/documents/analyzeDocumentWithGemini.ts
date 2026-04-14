import type { AiDocumentAnalysisRequest, AiDocumentAnalysisResult } from '../../../src/features/ai/contracts/aiContracts'
import { buildDocumentAnalysisPrompt } from './documentAnalysisPrompt'
import { documentAnalysisSchema } from './documentAnalysisSchema'
import { generateGeminiJson } from '../gemini/geminiClient'

export async function analyzeDocumentWithGemini(request: AiDocumentAnalysisRequest): Promise<AiDocumentAnalysisResult> {
  const prompt = buildDocumentAnalysisPrompt(request)

  return generateGeminiJson<AiDocumentAnalysisResult>({
    prompt,
    schema: documentAnalysisSchema,
  })
}
