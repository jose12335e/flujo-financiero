import { createAiRequestMeta } from '@/features/ai/helpers/createAiRequestMeta'
import { AiClientConfigurationError } from '@/features/ai/services/aiClient'
import { analyzeDocumentWithAi } from '@/features/ai/services/aiDocumentAnalysis'
import type { AiDocumentAnalysisResult } from '@/features/ai/contracts/aiContracts'
import { classifyDocument } from '@/features/documents/services/classifyDocument'
import { extractPdfText } from '@/features/documents/services/extractPdfText'
import { parsePayslip } from '@/features/documents/services/parsePayslip'
import { normalizeExtractedText } from '@/features/documents/helpers/normalizeExtractedText'
import type {
  DocumentAnalysisSource,
  DocumentClassificationResult,
  ParsedDeduction,
  ParsedDocumentExtractedData,
  ParsedDocumentResult,
} from '@/features/documents/types/documents'

const AI_DOCUMENT_DEBUG_PREFIX = '[IA]'

interface AnalyzePayslipDocumentOptions {
  userId?: string
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function toOptionalNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const normalized = Number(value.replace(/[^\d,.-]/g, '').replace(/,(?=\d{3}\b)/g, ''))
    return Number.isFinite(normalized) ? normalized : undefined
  }

  return undefined
}

function toParsedDeductions(value: unknown): ParsedDeduction[] | undefined {
  if (!Array.isArray(value)) {
    return undefined
  }

  const deductions = value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') {
      return []
    }

    const name = 'name' in entry && isNonEmptyString(entry.name) ? entry.name.trim() : undefined
    const amount = 'amount' in entry ? toOptionalNumber(entry.amount) : undefined

    if (!name || typeof amount !== 'number') {
      return []
    }

    return [{ name, amount }]
  })

  return deductions.length > 0 ? deductions : undefined
}

function pickString(localValue: string | undefined, aiValue: unknown) {
  if (isNonEmptyString(localValue)) {
    return localValue.trim()
  }

  return isNonEmptyString(aiValue) ? aiValue.trim() : undefined
}

function pickNumber(localValue: number | undefined, aiValue: unknown) {
  if (typeof localValue === 'number') {
    return localValue
  }

  return toOptionalNumber(aiValue)
}

function mergePayslipExtractedData(
  localExtracted: ParsedDocumentExtractedData,
  aiExtracted: Record<string, unknown> | undefined,
) {
  if (!aiExtracted) {
    return localExtracted
  }

  return {
    grossSalary: pickNumber(localExtracted.grossSalary, aiExtracted.grossSalary),
    netSalary: pickNumber(localExtracted.netSalary, aiExtracted.netSalary),
    date: pickString(localExtracted.date, aiExtracted.date),
    period: pickString(localExtracted.period, aiExtracted.period),
    company: pickString(localExtracted.company, aiExtracted.company),
    employeeCode: pickString(localExtracted.employeeCode, aiExtracted.employeeCode),
    employeeName: pickString(localExtracted.employeeName, aiExtracted.employeeName),
    department: pickString(localExtracted.department, aiExtracted.department),
    position: pickString(localExtracted.position, aiExtracted.position),
    municipality: pickString(localExtracted.municipality, aiExtracted.municipality),
    bankAccount: pickString(localExtracted.bankAccount, aiExtracted.bankAccount),
    deductions: localExtracted.deductions?.length ? localExtracted.deductions : toParsedDeductions(aiExtracted.deductions),
  }
}

function mergeConfidence(
  localClassification: DocumentClassificationResult,
  aiAnalysis: AiDocumentAnalysisResult | null,
) {
  const localConfidence = localClassification.confidence
  const aiConfidence = aiAnalysis?.confidence ?? 0
  const mergedConfidence = Math.max(localConfidence, aiConfidence)

  if (mergedConfidence >= 0.8) {
    return {
      confidence: mergedConfidence,
      confidenceLabel: 'high' as const,
    }
  }

  if (mergedConfidence >= 0.5) {
    return {
      confidence: mergedConfidence,
      confidenceLabel: 'medium' as const,
    }
  }

  return {
    confidence: mergedConfidence,
    confidenceLabel: 'low' as const,
  }
}

function resolveDocumentType(localType: DocumentClassificationResult['documentType'], aiType: AiDocumentAnalysisResult['documentType'] | null) {
  if (localType === 'payslip') {
    return 'payslip' as const
  }

  if (aiType === 'payslip') {
    return 'payslip' as const
  }

  return aiType ?? localType
}

async function tryAnalyzeWithAi(
  file: File,
  rawText: string,
  extractionMethod: 'pdf-text' | 'ocr' | 'unavailable',
  userId?: string,
) {
  try {
    const response = await analyzeDocumentWithAi({
      meta: createAiRequestMeta('documents', { userId }),
      payload: {
        fileName: file.name,
        mimeType: file.type || 'application/pdf',
        extractionMethod: extractionMethod === 'unavailable' ? 'manual' : extractionMethod,
        extractedText: rawText,
        kindHint: 'payslip',
      },
    })

    if (!response.ok) {
      return {
        analysis: null,
        debugReasons: [`${AI_DOCUMENT_DEBUG_PREFIX} ${response.error.message}`],
      }
    }

    return {
      analysis: response.data,
      debugReasons: response.data.debugReasons?.map((reason) => `${AI_DOCUMENT_DEBUG_PREFIX} ${reason}`) ?? [],
    }
  } catch (error) {
    if (error instanceof AiClientConfigurationError) {
      return {
        analysis: null,
        debugReasons: [],
      }
    }

    return {
      analysis: null,
      debugReasons: [`${AI_DOCUMENT_DEBUG_PREFIX} No pudimos completar el apoyo de IA. Se uso el analisis local.`],
    }
  }
}

export async function analyzePayslipDocument(
  file: File,
  options: AnalyzePayslipDocumentOptions = {},
): Promise<ParsedDocumentResult> {
  if (file.type !== 'application/pdf') {
    throw new Error('Por ahora solo puedes importar volantes de pago en PDF.')
  }

  const extractionResult = await extractPdfText(file)
  const rawText = normalizeExtractedText(extractionResult.rawText)

  if (!rawText) {
    throw new Error('No pudimos extraer texto suficiente del PDF. Intenta con una copia mas legible o con texto seleccionable.')
  }

  const localClassification = classifyDocument(rawText)
  const aiResult = await tryAnalyzeWithAi(file, rawText, extractionResult.extractionMethod, options.userId)
  const resolvedDocumentType = resolveDocumentType(localClassification.documentType, aiResult.analysis?.documentType ?? null)

  if (resolvedDocumentType !== 'payslip') {
    throw new Error('El archivo no fue reconocido como un volante de pago. En esta etapa solo procesamos payslips.')
  }

  const localExtracted = parsePayslip(rawText)
  const extracted = mergePayslipExtractedData(localExtracted, aiResult.analysis?.extracted)
  const mergedConfidence = mergeConfidence(localClassification, aiResult.analysis)

  let analysisSource: DocumentAnalysisSource = 'local'

  if (aiResult.analysis) {
    analysisSource = localClassification.documentType === 'payslip' ? 'hybrid' : 'ai'
  }

  return {
    documentType: 'payslip',
    confidence: mergedConfidence.confidence,
    confidenceLabel: mergedConfidence.confidenceLabel,
    rawText,
    extracted,
    summary: aiResult.analysis?.summary,
    analysisSource,
    extractionMethod: extractionResult.extractionMethod,
    usedOcrFallback: extractionResult.usedOcrFallback,
    debugReasons: [
      ...localClassification.debugReasons,
      ...extractionResult.debugReasons,
      ...aiResult.debugReasons,
    ],
  }
}
