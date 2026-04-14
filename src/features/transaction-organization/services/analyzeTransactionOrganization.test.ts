import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AiClientConfigurationError } from '@/features/ai/services/aiClient'
import { analyzeTransactionOrganization } from '@/features/transaction-organization/services/analyzeTransactionOrganization'
import { defaultCategories } from '@/data/categories'
import type { Transaction } from '@/types/finance'

vi.mock('@/features/ai/services/aiTransactionOrganization', () => ({
  organizeTransactionsWithAi: vi.fn(),
}))

const sampleTransactions: Transaction[] = [
  {
    id: 't-1',
    type: 'expense',
    amount: 850,
    categoryId: 'other-expense',
    description: 'Comida del trabajo',
    date: '2026-04-12',
    createdAt: '2026-04-12T10:00:00.000Z',
    updatedAt: '2026-04-12T10:00:00.000Z',
    source: 'manual',
    recurringRuleId: null,
    scheduledFor: null,
    debtId: null,
  },
  {
    id: 't-2',
    type: 'expense',
    amount: 3000,
    categoryId: 'services',
    description: 'Internet hogar',
    date: '2026-03-05',
    createdAt: '2026-03-05T10:00:00.000Z',
    updatedAt: '2026-03-05T10:00:00.000Z',
    source: 'manual',
    recurringRuleId: null,
    scheduledFor: null,
    debtId: null,
  },
  {
    id: 't-3',
    type: 'expense',
    amount: 3000,
    categoryId: 'services',
    description: 'Internet hogar',
    date: '2026-04-05',
    createdAt: '2026-04-05T10:00:00.000Z',
    updatedAt: '2026-04-05T10:00:00.000Z',
    source: 'manual',
    recurringRuleId: null,
    scheduledFor: null,
    debtId: null,
  },
  {
    id: 't-4',
    type: 'expense',
    amount: 120,
    categoryId: 'transport',
    description: 'Taxi',
    date: '2026-04-10',
    createdAt: '2026-04-10T10:00:00.000Z',
    updatedAt: '2026-04-10T10:00:00.000Z',
    source: 'manual',
    recurringRuleId: null,
    scheduledFor: null,
    debtId: null,
  },
  {
    id: 't-5',
    type: 'expense',
    amount: 120,
    categoryId: 'transport',
    description: 'Taxi',
    date: '2026-04-11',
    createdAt: '2026-04-11T10:00:00.000Z',
    updatedAt: '2026-04-11T10:00:00.000Z',
    source: 'manual',
    recurringRuleId: null,
    scheduledFor: null,
    debtId: null,
  },
]

describe('analyzeTransactionOrganization', () => {
  beforeEach(async () => {
    const { organizeTransactionsWithAi } = await import('@/features/ai/services/aiTransactionOrganization')
    vi.mocked(organizeTransactionsWithAi).mockRejectedValue(new AiClientConfigurationError('not-configured'))
  })

  it('detecta sugerencias locales de categoria, gasto fijo y duplicado', async () => {
    const result = await analyzeTransactionOrganization({
      transactions: sampleTransactions,
      categories: defaultCategories,
      currency: 'DOP',
    })

    expect(result.summary.totalSuggestions).toBeGreaterThanOrEqual(3)
    expect(result.summary.categorySuggestions).toBeGreaterThanOrEqual(1)
    expect(result.summary.fixedExpenseCandidates).toBeGreaterThanOrEqual(1)
    expect(result.summary.duplicateCandidates).toBeGreaterThanOrEqual(1)
  })

  it('agrega sugerencias IA cuando el backend responde', async () => {
    const { organizeTransactionsWithAi } = await import('@/features/ai/services/aiTransactionOrganization')

    vi.mocked(organizeTransactionsWithAi).mockResolvedValue({
      ok: true,
      data: {
        summary: 'La IA encontro una mejor categoria para un gasto ambiguo.',
        suggestions: [
          {
            kind: 'category',
            transactionId: 't-1',
            title: 'Categoria sugerida por IA',
            description: 'El gasto parece corresponder a comida.',
            confidence: 0.9,
            suggestedCategoryId: 'food',
            reasoning: ['La descripcion menciona comida y un contexto de alimentacion.'],
          },
        ],
      },
      meta: {
        requestId: 'req-1',
        module: 'transaction-organization',
        provider: 'gemini',
        model: 'stub',
      },
    })

    const result = await analyzeTransactionOrganization({
      transactions: sampleTransactions,
      categories: defaultCategories,
      currency: 'DOP',
    })

    expect(result.overview).toBe('La IA encontro una mejor categoria para un gasto ambiguo.')
    expect(result.suggestions.some((suggestion) => suggestion.analysisSource === 'ai')).toBe(true)
  })
})
