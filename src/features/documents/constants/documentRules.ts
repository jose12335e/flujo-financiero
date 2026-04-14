import type { DocumentAnalysisSource, DocumentClassificationRule, DocumentKind } from '@/features/documents/types/documents'

export const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  payslip: 'Volante de pago',
  receipt: 'Recibo o factura',
  transfer: 'Transferencia',
  unknown: 'Sin clasificar',
}

export const DOCUMENT_ANALYSIS_SOURCE_LABELS: Record<DocumentAnalysisSource, string> = {
  local: 'Analisis local',
  ai: 'Analisis IA',
  hybrid: 'Analisis mixto',
}

export const DOCUMENT_ACCEPTED_FILES = {
  'application/pdf': ['.pdf'],
} as const

export const DOCUMENT_MAX_SIZE_BYTES = 12 * 1024 * 1024

export const DOCUMENT_CLASSIFICATION_RULES: DocumentClassificationRule[] = [
  {
    kind: 'payslip',
    keywords: ['volante de pago', 'nomina', 'sueldo', 'neto a pagar', 'impuesto', 'pensiones'],
    minConfidence: 0.4,
  },
]

export const DOCUMENT_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
