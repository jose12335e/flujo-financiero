import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AiClientConfigurationError } from '@/features/ai/services/aiClient'
import { analyzeTransactionDraft } from '@/features/transaction-drafts/services/analyzeTransactionDraft'
import { defaultCategories } from '@/data/categories'

vi.mock('@/features/ai/services/aiTransactionClassifier', () => ({
  classifyTransactionTextWithAi: vi.fn(),
}))

describe('analyzeTransactionDraft', () => {
  beforeEach(async () => {
    const { classifyTransactionTextWithAi } = await import('@/features/ai/services/aiTransactionClassifier')
    vi.mocked(classifyTransactionTextWithAi).mockRejectedValue(new AiClientConfigurationError('not-configured'))
  })

  it('crea un borrador local de gasto cuando describe un consumo', async () => {
    const result = await analyzeTransactionDraft('Gaste 850 en comida ayer', {
      categories: defaultCategories,
      currency: 'DOP',
    })

    expect(result.analysisSource).toBe('local')
    expect(result.values.type).toBe('expense')
    expect(result.values.amount).toBe(850)
    expect(result.values.categoryId).toBe('food')
  })

  it('mezcla la respuesta IA cuando esta disponible', async () => {
    const { classifyTransactionTextWithAi } = await import('@/features/ai/services/aiTransactionClassifier')

    vi.mocked(classifyTransactionTextWithAi).mockResolvedValue({
      ok: true,
      data: {
        type: 'income',
        amount: 12000,
        categoryId: 'salary',
        description: 'Pago extra recibido',
        date: '2026-04-13',
        confidence: 0.92,
        reasoning: ['Se detecto una entrada de dinero por pago extra.'],
      },
      meta: {
        requestId: 'req-1',
        module: 'transaction-classifier',
        provider: 'gemini',
        model: 'stub',
      },
    })

    const result = await analyzeTransactionDraft('Me pagaron 12000 extra', {
      categories: defaultCategories,
      currency: 'DOP',
    })

    expect(result.analysisSource).toBe('hybrid')
    expect(result.values.type).toBe('income')
    expect(result.values.amount).toBe(12000)
    expect(result.values.categoryId).toBe('salary')
    expect(result.reasoning).toContain('[IA] Se detecto una entrada de dinero por pago extra.')
  })
})
