import { describe, expect, it } from 'vitest'

import { classifyDocument } from '@/features/documents/services/classifyDocument'

describe('classifyDocument', () => {
  it('detecta un volante de pago por palabras clave del payslip', () => {
    const result = classifyDocument('VOLANTE DE PAGO sueldo neto a pagar impuesto pensiones')

    expect(result.documentType).toBe('payslip')
    expect(result.confidence).toBeGreaterThan(0.4)
    expect(result.confidenceLabel).not.toBe('low')
  })

  it('cae en unknown cuando el texto no alcanza el umbral', () => {
    const result = classifyDocument('documento sin patrones suficientes')

    expect(result.documentType).toBe('unknown')
    expect(result.confidenceLabel).toBe('low')
  })
})
