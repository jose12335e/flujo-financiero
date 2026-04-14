import { describe, expect, it } from 'vitest'

import { parsePayslip } from '@/features/documents/services/parsePayslip'

const samplePayslip = `
VOLANTE DE PAGO
Junta Central Electoral
Fecha: 20/03/2026
Periodo de Pago: 2026-3
Departamento: Tecnologia
Cargo: Analista
Municipio: La Paz
Cuenta bancaria: 0123456789
12345 JUAN PEREZ
SUELDO 60,720.00
IMPUESTO SOBRE LA RENTA 3,611.20
PENSIONES Y JUBILACIONES 6% 3,643.20
SAVICA 25.00
PRESTAMO EXTRAORDINARIO 1,494.27
Desc. Seguro ROYAL 329.35
Neto a Pagar: 51,616.98
`

describe('parsePayslip', () => {
  it('extrae los campos principales del volante de pago', () => {
    const result = parsePayslip(samplePayslip)

    expect(result.company).toBe('Junta Central Electoral')
    expect(result.date).toBe('20/03/2026')
    expect(result.period).toBe('2026-3')
    expect(result.employeeCode).toBe('12345')
    expect(result.employeeName).toBe('JUAN PEREZ')
    expect(result.department).toBe('Tecnologia')
    expect(result.position).toBe('Analista')
    expect(result.municipality).toBe('La Paz')
    expect(result.bankAccount).toBe('0123456789')
    expect(result.grossSalary).toBe(60720)
    expect(result.netSalary).toBe(51616.98)
    expect(result.deductions).toHaveLength(5)
  })
})
