import { describe, expect, it } from 'vitest'

import { defaultCategories } from '@/data/categories'
import {
  calculateBudgetStatus,
  calculateCategorySummary,
  calculateMonthlySummary,
  calculateTotals,
  filterTransactions,
} from '@/utils/finance'

const sampleTransactions = [
  {
    id: 'income-1',
    type: 'income' as const,
    amount: 3200,
    categoryId: 'salary',
    description: 'Salario abril',
    date: '2026-04-01',
    createdAt: '2026-04-01T08:00:00.000Z',
    updatedAt: '2026-04-01T08:00:00.000Z',
  },
  {
    id: 'expense-1',
    type: 'expense' as const,
    amount: 480,
    categoryId: 'food',
    description: 'Supermercado',
    date: '2026-04-03',
    createdAt: '2026-04-03T09:00:00.000Z',
    updatedAt: '2026-04-03T09:00:00.000Z',
  },
  {
    id: 'expense-2',
    type: 'expense' as const,
    amount: 240,
    categoryId: 'transport',
    description: 'Combustible',
    date: '2026-04-04',
    createdAt: '2026-04-04T09:00:00.000Z',
    updatedAt: '2026-04-04T09:00:00.000Z',
  },
  {
    id: 'expense-3',
    type: 'expense' as const,
    amount: 350,
    categoryId: 'housing',
    description: 'Alquiler parcial',
    date: '2026-03-20',
    createdAt: '2026-03-20T09:00:00.000Z',
    updatedAt: '2026-03-20T09:00:00.000Z',
  },
]

describe('finance utils', () => {
  it('calculates totals and balance correctly', () => {
    expect(calculateTotals(sampleTransactions)).toEqual({
      income: 3200,
      expenses: 1070,
      balance: 2130,
    })
  })

  it('filters by query, type, category and date range', () => {
    const filtered = filterTransactions(
      sampleTransactions,
      {
        query: 'super',
        type: 'expense',
        categoryId: 'food',
        dateFrom: '2026-04-01',
        dateTo: '2026-04-30',
      },
      defaultCategories,
    )

    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.id).toBe('expense-1')
  })

  it('creates category summary only for matching expense categories', () => {
    const summary = calculateCategorySummary(sampleTransactions, defaultCategories, {
      monthKey: '2026-04',
      type: 'expense',
    })

    expect(summary.map((item) => item.categoryId)).toEqual(['food', 'transport'])
    expect(summary[0]?.value).toBe(480)
    expect(summary[1]?.value).toBe(240)
  })

  it('returns monthly summary and budget alerts', () => {
    const summary = calculateMonthlySummary(sampleTransactions, '2026-04')
    const budgetStatus = calculateBudgetStatus(
      sampleTransactions,
      {
        monthKey: '2026-04',
        limit: 600,
        warningThreshold: 0.8,
      },
      '2026-04',
    )

    expect(summary).toEqual({
      monthKey: '2026-04',
      income: 3200,
      expenses: 720,
      balance: 2480,
      transactionsCount: 3,
    })
    expect(budgetStatus.isOverLimit).toBe(true)
    expect(budgetStatus.isNearLimit).toBe(false)
    expect(budgetStatus.remaining).toBe(-120)
  })
})
