import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AiClientConfigurationError } from '@/features/ai/services/aiClient'
import { analyzeFinancialInsights } from '@/features/insights/services/analyzeFinancialInsights'
import { defaultCategories } from '@/data/categories'
import type { MonthlyBudget, RecurringRule, Transaction } from '@/types/finance'

vi.mock('@/features/ai/services/aiInsights', () => ({
  generateFinancialInsights: vi.fn(),
}))

const transactions: Transaction[] = [
  {
    id: 't-1',
    type: 'income',
    amount: 10000,
    categoryId: 'salary',
    description: 'Salario abril',
    date: '2026-04-03',
    createdAt: '2026-04-03T10:00:00.000Z',
    updatedAt: '2026-04-03T10:00:00.000Z',
    source: 'manual',
    recurringRuleId: null,
    scheduledFor: null,
    debtId: null,
  },
  {
    id: 't-2',
    type: 'expense',
    amount: 4200,
    categoryId: 'transport',
    description: 'Transporte abril',
    date: '2026-04-05',
    createdAt: '2026-04-05T10:00:00.000Z',
    updatedAt: '2026-04-05T10:00:00.000Z',
    source: 'manual',
    recurringRuleId: null,
    scheduledFor: null,
    debtId: null,
  },
  {
    id: 't-3',
    type: 'expense',
    amount: 2000,
    categoryId: 'transport',
    description: 'Transporte marzo',
    date: '2026-03-04',
    createdAt: '2026-03-04T10:00:00.000Z',
    updatedAt: '2026-03-04T10:00:00.000Z',
    source: 'manual',
    recurringRuleId: null,
    scheduledFor: null,
    debtId: null,
  },
]

const recurringRules: RecurringRule[] = [
  {
    id: 'r-1',
    type: 'expense',
    amount: 1500,
    categoryId: 'services',
    description: 'Internet hogar',
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
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
  },
]

const monthlyBudget: MonthlyBudget = {
  monthKey: '2026-04',
  limit: 5000,
  warningThreshold: 0.85,
}

describe('analyzeFinancialInsights', () => {
  beforeEach(async () => {
    const { generateFinancialInsights } = await import('@/features/ai/services/aiInsights')
    vi.mocked(generateFinancialInsights).mockRejectedValue(new AiClientConfigurationError('not-configured'))
  })

  it('genera insights locales cuando la IA no esta disponible', async () => {
    const result = await analyzeFinancialInsights({
      currentMonthKey: '2026-04',
      transactions,
      categories: defaultCategories,
      monthlyBudget,
      recurringRules,
      financialOutlook: {
        monthlyIncome: 10000,
        committedMoney: 1500,
        pendingDebt: 0,
        estimatedNetSalary: 8000,
        estimatedAvailableBalance: 300,
      },
    })

    expect(result.analysisSource).toBe('local')
    expect(result.insights.length).toBeGreaterThan(0)
    expect(result.insights.some((insight) => insight.includes('subieron') || insight.includes('bajaron'))).toBe(true)
  })

  it('mezcla insights IA si el backend responde', async () => {
    const { generateFinancialInsights } = await import('@/features/ai/services/aiInsights')
    vi.mocked(generateFinancialInsights).mockResolvedValue({
      ok: true,
      data: {
        summary: 'Tus gastos crecieron fuerte en transporte y conviene revisar el ritmo del mes.',
        insights: ['El aumento en transporte supera el comportamiento del mes anterior.'],
        riskFlags: ['El margen disponible del mes esta muy ajustado.'],
      },
      meta: {
        requestId: 'req-1',
        module: 'insights',
        provider: 'gemini',
        model: 'stub',
      },
    })

    const result = await analyzeFinancialInsights({
      currentMonthKey: '2026-04',
      transactions,
      categories: defaultCategories,
      monthlyBudget,
      recurringRules,
      financialOutlook: {
        monthlyIncome: 10000,
        committedMoney: 1500,
        pendingDebt: 0,
        estimatedNetSalary: 8000,
        estimatedAvailableBalance: 300,
      },
    })

    expect(result.analysisSource).toBe('hybrid')
    expect(result.summary).toContain('transporte')
    expect(result.riskFlags).toContain('El margen disponible del mes esta muy ajustado.')
  })
})
