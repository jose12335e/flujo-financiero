import { describe, expect, it } from 'vitest'

import { calculateDebtSummary, createDebtPaymentMutation, getUpcomingDebtPayments } from '@/utils/debts'

const sampleDebts = [
  {
    id: 'debt-1',
    name: 'Prestamo personal',
    type: 'loan' as const,
    originalAmount: 12000,
    pendingBalance: 6000,
    monthlyPayment: 800,
    interestRate: 12,
    paymentDay: 15,
    startDate: '2026-01-01',
    endDate: null,
    status: 'active' as const,
    priority: 'high' as const,
    notes: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'debt-2',
    name: 'Tarjeta principal',
    type: 'credit_card' as const,
    originalAmount: 4000,
    pendingBalance: 1500,
    monthlyPayment: 300,
    interestRate: null,
    paymentDay: 8,
    startDate: '2026-02-01',
    endDate: null,
    status: 'active' as const,
    priority: 'medium' as const,
    notes: '',
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
  },
]

describe('debt utils', () => {
  it('calculates debt summary from active debts', () => {
    expect(calculateDebtSummary(sampleDebts)).toEqual({
      totalOriginal: 16000,
      totalPending: 7500,
      monthlyCommitted: 1100,
      activeCount: 2,
    })
  })

  it('builds upcoming debt payments sorted by due date', () => {
    const upcoming = getUpcomingDebtPayments(sampleDebts, new Date('2026-04-10T10:00:00.000Z'))

    expect(upcoming).toHaveLength(2)
    expect(upcoming[0]?.debtId).toBe('debt-1')
    expect(upcoming[0]?.dueDate).toBe('2026-04-15')
    expect(upcoming[1]?.debtId).toBe('debt-2')
    expect(upcoming[1]?.dueDate).toBe('2026-05-08')
  })

  it('creates linked transaction and debt payment when recording a payment', () => {
    const mutation = createDebtPaymentMutation(
      sampleDebts[0],
      {
        amount: 700,
        paymentDate: '2026-04-15',
        notes: 'Cuota abril',
      },
      '2026-04-15T12:00:00.000Z',
    )

    expect(mutation.updatedDebt.pendingBalance).toBe(5300)
    expect(mutation.transaction.source).toBe('debt_payment')
    expect(mutation.transaction.type).toBe('expense')
    expect(mutation.transaction.debtId).toBe('debt-1')
    expect(mutation.debtPayment.transactionId).toBe(mutation.transaction.id)
    expect(mutation.debtPayment.amount).toBe(700)
  })
})
