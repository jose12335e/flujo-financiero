export type DocumentKind = 'payslip' | 'receipt' | 'transfer' | 'unknown'

export type ParsedDeduction = {
  name: string
  amount: number
}

export type ParsedDocumentExtractedData = {
  grossSalary?: number
  netSalary?: number
  date?: string
  period?: string
  company?: string
  employeeCode?: string
  employeeName?: string
  department?: string
  position?: string
  municipality?: string
  bankAccount?: string
  deductions?: ParsedDeduction[]
}

export type DocumentAnalysisSource = 'local' | 'ai' | 'hybrid'

export type ParsedDocumentResult = {
  documentType: DocumentKind
  confidence: number
  confidenceLabel: 'low' | 'medium' | 'high'
  rawText: string
  extracted: ParsedDocumentExtractedData
  summary?: string
  analysisSource: DocumentAnalysisSource
  extractionMethod?: DocumentExtractionMethod
  usedOcrFallback?: boolean
  debugReasons?: string[]
}

export type DocumentImportState =
  | { status: 'idle' }
  | { status: 'selected'; file: File }
  | { status: 'processing'; file: File }
  | { status: 'review'; file: File; result: ParsedDocumentResult }
  | { status: 'error'; file?: File; message: string }

export type DocumentExtractionMethod = 'pdf-text' | 'ocr' | 'unavailable'

export interface DocumentTextExtractionResult {
  rawText: string
  extractionMethod: DocumentExtractionMethod
  usedOcrFallback: boolean
  debugReasons: string[]
}

export interface DocumentClassificationResult {
  documentType: DocumentKind
  confidence: number
  confidenceLabel: 'low' | 'medium' | 'high'
  debugReasons: string[]
}

export interface DocumentClassificationRule {
  kind: DocumentKind
  keywords: string[]
  minConfidence: number
}
