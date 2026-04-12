import { describe, expect, it } from 'vitest'

import { buildUpcomingPayments, calculateFinancialOutlook } from '@/utils/dashboard'

describe('dashboard utils', () => {
  it('calculates the financial outlook with debts, fixed rules and salary', () => {
    const outlook = calculateFinancialOutlook({
      currentMonthIncome: 1800,
      currentBalance: 2500,
      recurringRules: [
        {
          id: 'rule-1',
          type: 'expense',
          amount: 400,
          categoryId: 'housing',
          description: 'Alquiler',
          frequency: 'monthly',
          intervalValue: 1,
          startDate: '2026-01-01',
          runTime: '09:00',
          endDate: null,
          timezone: 'America/La_Paz',
          isFixed: true,
          isActive: true,
          nextRunAt: '2026-04-20T09:00:00.000Z',
          lastRunAt: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      debtSummary: {
        totalOriginal: 9000,
        totalPending: 5000,
        monthlyCommitted: 600,
        activeCount: 1,
      },
      salarySummary: {
        grossPerPeriod: 3000,
        grossMonthlyEstimate: 3000,
        totalDeductionsPerPeriod: 300,
        totalDeductionsMonthly: 300,
        netPerPeriod: 2700,
        netMonthlyEstimate: 2700,
        activeDeductionsCount: 2,
      },
    })

    expect(outlook.committedMoney).toBe(1000)
    expect(outlook.pendingDebt).toBe(5000)
    expect(outlook.estimatedNetSalary).toBe(2700)
    expect(outlook.estimatedAvailableBalance).toBe(4200)
  })

  it('merges debt and recurring payments ordered by due date', () => {
    const items = buildUpcomingPayments(
      [
        {
          debtId: 'debt-1',
          debtName: 'Prestamo',
          amount: 500,
          dueDate: '2026-04-14',
          paymentDay: 14,
          priority: 'high',
          status: 'active',
        },
      ],
      [
        {
          id: 'rule-1',
          type: 'expense',
          amount: 300,
          categoryId: 'services',
          description: 'Internet',
          frequency: 'monthly',
          intervalValue: 1,
          startDate: '2026-01-01',
          runTime: '09:00',
          endDate: null,
          timezone: 'America/La_Paz',
          isFixed: true,
          isActive: true,
          nextRunAt: '2026-04-12T09:00:00.000Z',
          lastRunAt: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    )

    expect(items).toHaveLength(2)
    expect(items[0]?.source).toBe('recurring')
    expect(items[1]?.source).toBe('debt')
  })
})
