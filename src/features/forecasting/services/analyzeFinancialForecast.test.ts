import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AiClientConfigurationError } from '@/features/ai/services/aiClient'
import { analyzeFinancialForecast, buildLocalFinancialForecast } from '@/features/forecasting/services/analyzeFinancialForecast'
import type { BudgetStatus, DebtSummary, MonthlySummary, SalarySummary } from '@/types/finance'
import type { FinancialOutlook } from '@/utils/dashboard'

vi.mock('@/features/ai/services/aiForecasting', () => ({
  generateFinancialForecast: vi.fn(),
}))

const currentMonthSummary: MonthlySummary = {
  monthKey: '2026-04',
  income: 12000,
  expenses: 4800,
  balance: 7200,
  transactionsCount: 9,
}

const budgetStatus: BudgetStatus = {
  monthKey: '2026-04',
  limit: 9000,
  spent: 4800,
  remaining: 4200,
  progress: 0.53,
  warningThreshold: 0.85,
  isNearLimit: false,
  isOverLimit: false,
}

const debtSummary: DebtSummary = {
  totalOriginal: 15000,
  totalPending: 8000,
  monthlyCommitted: 2000,
  activeCount: 2,
}

const salarySummary: SalarySummary = {
  grossPerPeriod: 6000,
  grossMonthlyEstimate: 12000,
  totalDeductionsPerPeriod: 800,
  totalDeductionsMonthly: 1600,
  netPerPeriod: 5200,
  netMonthlyEstimate: 10400,
  activeDeductionsCount: 3,
}

const financialOutlook: FinancialOutlook = {
  monthlyIncome: 12000,
  committedMoney: 3500,
  pendingDebt: 8000,
  estimatedNetSalary: 10400,
  estimatedAvailableBalance: 4200,
}

describe('analyzeFinancialForecast', () => {
  beforeEach(async () => {
    const { generateFinancialForecast } = await import('@/features/ai/services/aiForecasting')
    vi.mocked(generateFinancialForecast).mockRejectedValue(new AiClientConfigurationError('not-configured'))
  })

  it('proyecta un escenario local con impacto en ahorro y deuda', () => {
    const result = buildLocalFinancialForecast({
      currency: 'DOP',
      currentMonthKey: '2026-04',
      currentMonthSummary,
      budgetStatus,
      debtSummary,
      financialOutlook,
      salarySummary,
      scenario: {
        extraIncome: 2000,
        extraExpense: 500,
        extraDebtPayment: 1000,
        savingsGoal: 700,
      },
    })

    expect(result.analysisSource).toBe('local')
    expect(result.projectedClosingBalance).toBe(4000)
    expect(result.debtMonthsReduced).toBe(0.5)
    expect(result.highlights.length).toBeGreaterThan(0)
  })

  it('enriquece la proyeccion cuando el backend responde', async () => {
    const { generateFinancialForecast } = await import('@/features/ai/services/aiForecasting')

    vi.mocked(generateFinancialForecast).mockResolvedValue({
      ok: true,
      data: {
        projectedBalance: 5100,
        explanation: 'Si mantienes este escenario, cierras con margen razonable y mejor liquidez.',
        riskLevel: 'low',
      },
      meta: {
        requestId: 'forecast-1',
        module: 'forecasting',
        provider: 'gemini',
        model: 'stub',
      },
    })

    const result = await analyzeFinancialForecast({
      currency: 'DOP',
      currentMonthKey: '2026-04',
      currentMonthSummary,
      budgetStatus,
      debtSummary,
      financialOutlook,
      salarySummary,
      scenario: {
        extraIncome: 2000,
        extraExpense: 0,
        extraDebtPayment: 0,
        savingsGoal: 0,
      },
    })

    expect(result.analysisSource).toBe('hybrid')
    expect(result.projectedClosingBalance).toBe(5100)
    expect(result.summary).toContain('margen razonable')
  })
})
