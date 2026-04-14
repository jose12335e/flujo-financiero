import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AiClientConfigurationError } from '@/features/ai/services/aiClient'
import { answerFinancialChat, buildLocalFinancialChatReply } from '@/features/chat/services/answerFinancialChat'
import type { FinancialChatSnapshot } from '@/features/chat/types/financialChat'

vi.mock('@/features/ai/services/aiChat', () => ({
  sendFinancialChatMessage: vi.fn(),
}))

const snapshot: FinancialChatSnapshot = {
  currency: 'DOP',
  currentMonthKey: '2026-04',
  currentMonthSummary: {
    income: 60720,
    expenses: 6500,
    balance: 54220,
    transactionsCount: 2,
  },
  previousMonthSummary: {
    income: 50000,
    expenses: 5200,
    balance: 44800,
    transactionsCount: 4,
  },
  totals: {
    income: 60720,
    expenses: 6500,
    balance: 54220,
  },
  budgetStatus: {
    limit: 25000,
    spent: 6500,
    remaining: 18500,
    isNearLimit: false,
    isOverLimit: false,
  },
  debtSummary: {
    totalPending: 18000,
    monthlyCommitted: 3500,
    activeCount: 2,
  },
  salarySummary: {
    netMonthlyEstimate: 51616.98,
    netPerPeriod: 25808.49,
  },
  financialOutlook: {
    committedMoney: 5400,
    estimatedAvailableBalance: 10000,
    estimatedNetSalary: 51616.98,
  },
  topExpenseCategories: [
    {
      label: 'Vivienda',
      value: 6500,
      percentage: 1,
    },
  ],
}

describe('answerFinancialChat', () => {
  beforeEach(async () => {
    const { sendFinancialChatMessage } = await import('@/features/ai/services/aiChat')
    vi.mocked(sendFinancialChatMessage).mockRejectedValue(new AiClientConfigurationError('not-configured'))
  })

  it('responde localmente cuando preguntan en que se gasto mas', () => {
    const result = buildLocalFinancialChatReply('En que gaste mas este mes?', snapshot)

    expect(result.analysisSource).toBe('local')
    expect(result.answer).toContain('Vivienda')
    expect(result.followUps.length).toBeGreaterThan(0)
  })

  it('usa fallback local y mezcla IA si el backend responde', async () => {
    const { sendFinancialChatMessage } = await import('@/features/ai/services/aiChat')

    vi.mocked(sendFinancialChatMessage).mockResolvedValue({
      ok: true,
      data: {
        answer: 'Tu margen libre sigue positivo y esta respaldado por tu balance actual.',
        followUps: ['Como va mi presupuesto'],
      },
      meta: {
        requestId: 'chat-1',
        module: 'chat',
        provider: 'gemini',
        model: 'stub',
      },
    })

    const result = await answerFinancialChat('Cuanto me queda libre?', snapshot)

    expect(result.analysisSource).toBe('hybrid')
    expect(result.answer).toContain('margen libre')
    expect(result.followUps).toEqual(['Como va mi presupuesto'])
  })
})
