import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AiClientConfigurationError } from '@/features/ai/services/aiClient'
import { analyzeFinancialRecommendations } from '@/features/recommendations/services/analyzeFinancialRecommendations'
import type { BudgetStatus, DebtSummary, MonthlySummary, RecurringRule, SalarySummary } from '@/types/finance'

vi.mock('@/features/ai/services/aiRecommendations', () => ({
  generateRecommendations: vi.fn(),
}))

const budgetStatus: BudgetStatus = {
  monthKey: '2026-04',
  limit: 5000,
  spent: 4800,
  remaining: 200,
  progress: 0.96,
  warningThreshold: 0.85,
  isNearLimit: true,
  isOverLimit: false,
}

const currentMonthSummary: MonthlySummary = {
  monthKey: '2026-04',
  income: 10000,
  expenses: 4800,
  balance: 5200,
  transactionsCount: 8,
}

const debtSummary: DebtSummary = {
  totalOriginal: 15000,
  totalPending: 8000,
  monthlyCommitted: 2500,
  activeCount: 2,
}

const salarySummary: SalarySummary = {
  grossPerPeriod: 5500,
  grossMonthlyEstimate: 11000,
  totalDeductionsPerPeriod: 800,
  totalDeductionsMonthly: 1600,
  netPerPeriod: 4700,
  netMonthlyEstimate: 9400,
  activeDeductionsCount: 3,
}

const recurringRules: RecurringRule[] = [
  {
    id: 'r-1',
    type: 'expense',
    amount: 1200,
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
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

describe('analyzeFinancialRecommendations', () => {
  beforeEach(async () => {
    const { generateRecommendations } = await import('@/features/ai/services/aiRecommendations')
    vi.mocked(generateRecommendations).mockRejectedValue(new AiClientConfigurationError('not-configured'))
  })

  it('genera recomendaciones locales accionables sin IA', async () => {
    const result = await analyzeFinancialRecommendations({
      currentMonthKey: '2026-04',
      currentMonthSummary,
      budgetStatus,
      debtSummary,
      recurringRules,
      financialOutlook: {
        monthlyIncome: 10000,
        committedMoney: 3700,
        pendingDebt: 8000,
        estimatedNetSalary: 9400,
        estimatedAvailableBalance: -500,
      },
      salarySummary,
    })

    expect(result.analysisSource).toBe('local')
    expect(result.recommendations.length).toBeGreaterThan(0)
    expect(result.recommendations.some((recommendation) => recommendation.priority === 'high')).toBe(true)
  })

  it('enriquece recomendaciones cuando el backend responde', async () => {
    const { generateRecommendations } = await import('@/features/ai/services/aiRecommendations')

    vi.mocked(generateRecommendations).mockResolvedValue({
      ok: true,
      data: {
        recommendations: [
          {
            id: 'ai-1',
            title: 'Reduce gasto variable esta semana',
            description: 'Un recorte pequeno en ocio y transporte podria devolverte margen antes del cierre.',
            priority: 'medium',
          },
        ],
      },
      meta: {
        requestId: 'req-1',
        module: 'recommendations',
        provider: 'gemini',
        model: 'stub',
      },
    })

    const result = await analyzeFinancialRecommendations({
      currentMonthKey: '2026-04',
      currentMonthSummary,
      budgetStatus,
      debtSummary,
      recurringRules,
      financialOutlook: {
        monthlyIncome: 10000,
        committedMoney: 3700,
        pendingDebt: 8000,
        estimatedNetSalary: 9400,
        estimatedAvailableBalance: -500,
      },
      salarySummary,
    })

    expect(result.analysisSource).toBe('hybrid')
    expect(result.recommendations.some((recommendation) => recommendation.analysisSource === 'ai')).toBe(true)
  })
})
