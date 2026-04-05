import { describe, expect, it } from 'vitest'

import { buildRecurringRuleSummary, calculateNextRunAt, getUpcomingRecurringRules } from '@/utils/recurring'
import type { RecurringRule } from '@/types/finance'

describe('recurring utilities', () => {
  it('calculates the next future monthly run from an initial schedule', () => {
    const result = calculateNextRunAt(
      {
        frequency: 'monthly',
        intervalValue: 1,
        startDate: '2026-03-05',
        runTime: '09:30',
        endDate: '',
        isActive: true,
      },
      new Date('2026-04-05T08:00:00.000Z'),
    )

    expect(result).toBeTruthy()
    expect(result?.slice(0, 10)).toBe('2026-04-05')
  })

  it('returns null for inactive rules', () => {
    const result = calculateNextRunAt(
      {
        frequency: 'weekly',
        intervalValue: 1,
        startDate: '2026-04-05',
        runTime: '09:30',
        endDate: '',
        isActive: false,
      },
      new Date('2026-04-05T08:00:00.000Z'),
    )

    expect(result).toBeNull()
  })

  it('sorts upcoming recurring rules by next run date', () => {
    const rules: RecurringRule[] = [
      {
        id: 'rule-2',
        type: 'expense',
        amount: 50,
        categoryId: 'services',
        description: 'Internet',
        frequency: 'monthly',
        intervalValue: 1,
        startDate: '2026-04-10',
        runTime: '09:00',
        endDate: null,
        timezone: 'UTC',
        isFixed: true,
        isActive: true,
        nextRunAt: '2026-04-10T09:00:00.000Z',
        lastRunAt: null,
        createdAt: '2026-04-01T00:00:00.000Z',
        updatedAt: '2026-04-01T00:00:00.000Z',
      },
      {
        id: 'rule-1',
        type: 'income',
        amount: 500,
        categoryId: 'salary',
        description: 'Pago',
        frequency: 'monthly',
        intervalValue: 1,
        startDate: '2026-04-08',
        runTime: '08:00',
        endDate: null,
        timezone: 'UTC',
        isFixed: true,
        isActive: true,
        nextRunAt: '2026-04-08T08:00:00.000Z',
        lastRunAt: null,
        createdAt: '2026-04-01T00:00:00.000Z',
        updatedAt: '2026-04-01T00:00:00.000Z',
      },
    ]

    expect(getUpcomingRecurringRules(rules)[0]?.id).toBe('rule-1')
    expect(buildRecurringRuleSummary(rules[0])).toMatch(/cada mes/i)
  })
})
