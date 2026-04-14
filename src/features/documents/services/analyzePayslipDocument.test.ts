import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AiClientConfigurationError } from '@/features/ai/services/aiClient'
import { analyzePayslipDocument } from '@/features/documents/services/analyzePayslipDocument'

const sampleRawText = `
VOLANTE DE PAGO
Fecha: 20/03/2026
Periodo de Pago: 2026-3
Departamento: Tecnologia
Cargo: Analista
Municipio: La Paz
Cuenta bancaria: 0123456789
12345 JUAN PEREZ
SUELDO 60,720.00
IMPUESTO SOBRE LA RENTA 3,611.20
Neto a Pagar: 51,616.98
`

vi.mock('@/features/documents/services/extractPdfText', () => ({
  extractPdfText: vi.fn(),
}))

vi.mock('@/features/ai/services/aiDocumentAnalysis', () => ({
  analyzeDocumentWithAi: vi.fn(),
}))

describe('analyzePayslipDocument', () => {
  beforeEach(async () => {
    const { extractPdfText } = await import('@/features/documents/services/extractPdfText')
    const { analyzeDocumentWithAi } = await import('@/features/ai/services/aiDocumentAnalysis')

    vi.mocked(extractPdfText).mockResolvedValue({
      rawText: sampleRawText,
      extractionMethod: 'pdf-text',
      usedOcrFallback: false,
      debugReasons: ['Se extrajo texto nativo del PDF.'],
    })

    vi.mocked(analyzeDocumentWithAi).mockRejectedValue(new AiClientConfigurationError('not-configured'))
  })

  it('mantiene el analisis local cuando la IA no esta configurada', async () => {
    const file = new File(['dummy'], 'volante.pdf', { type: 'application/pdf' })
    const result = await analyzePayslipDocument(file)

    expect(result.documentType).toBe('payslip')
    expect(result.analysisSource).toBe('local')
    expect(result.extracted.grossSalary).toBe(60720)
    expect(result.extracted.netSalary).toBe(51616.98)
    expect(result.summary).toBeUndefined()
  })

  it('mezcla datos locales con apoyo de IA cuando el backend responde', async () => {
    const file = new File(['dummy'], 'volante.pdf', { type: 'application/pdf' })
    const { analyzeDocumentWithAi } = await import('@/features/ai/services/aiDocumentAnalysis')

    vi.mocked(analyzeDocumentWithAi).mockResolvedValue({
      ok: true,
      data: {
        documentType: 'payslip',
        confidence: 0.91,
        summary: 'Volante de pago detectado con sueldo y neto claros.',
        extracted: {
          company: 'Junta Central Electoral',
          deductions: [{ name: 'IMPUESTO SOBRE LA RENTA', amount: 3611.2 }],
        },
        debugReasons: ['Coinciden terminos de nomina y neto a pagar.'],
      },
      meta: {
        requestId: 'req-1',
        module: 'documents',
        provider: 'gemini',
        model: 'stub',
      },
    })

    const result = await analyzePayslipDocument(file)

    expect(result.analysisSource).toBe('hybrid')
    expect(result.summary).toBe('Volante de pago detectado con sueldo y neto claros.')
    expect(result.extracted.company).toBe('Junta Central Electoral')
    expect(result.debugReasons).toContain('[IA] Coinciden terminos de nomina y neto a pagar.')
  })
})
