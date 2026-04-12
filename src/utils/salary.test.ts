import { describe, expect, it } from 'vitest'

import { calculateSalarySummary, createSalaryPaymentTransaction } from '@/utils/salary'

const sampleProfile = {
  id: 'salary-1',
  grossSalary: 3000,
  payFrequency: 'monthly' as const,
  bonuses: 200,
  overtimePay: 100,
  otherIncome: 50,
  notes: '',
  allowTransactionGeneration: true,
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-01T00:00:00.000Z',
}

const sampleDeductions = [
  {
    id: 'ded-1',
    name: 'Seguro',
    type: 'fixed' as const,
    value: 150,
    isActive: true,
    isMandatory: true,
    frequency: 'per_period' as const,
    notes: '',
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
  {
    id: 'ded-2',
    name: 'Cooperativa',
    type: 'percentage' as const,
    value: 10,
    isActive: true,
    isMandatory: false,
    frequency: 'per_period' as const,
    notes: '',
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
]

describe('salary utils', () => {
  it('calculates gross, deductions and net salary summary', () => {
    const summary = calculateSalarySummary(sampleProfile, sampleDeductions)

    expect(summary).not.toBeNull()
    expect(summary?.grossPerPeriod).toBe(3350)
    expect(summary?.totalDeductionsPerPeriod).toBe(485)
    expect(summary?.netPerPeriod).toBe(2865)
    expect(summary?.netMonthlyEstimate).toBe(2865)
    expect(summary?.activeDeductionsCount).toBe(2)
  })

  it('creates a salary payment transaction from the net estimate', () => {
    const transaction = createSalaryPaymentTransaction(
      sampleProfile,
      sampleDeductions,
      {
        paymentDate: '2026-04-30',
        description: 'Nomina abril',
      },
      '2026-04-30T12:00:00.000Z',
    )

    expect(transaction.source).toBe('salary_payment')
    expect(transaction.type).toBe('income')
    expect(transaction.categoryId).toBe('salary')
    expect(transaction.amount).toBe(2865)
  })
})
