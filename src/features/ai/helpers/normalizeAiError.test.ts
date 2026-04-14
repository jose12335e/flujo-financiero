import { describe, expect, it } from 'vitest'

import { normalizeAiError } from '@/features/ai/helpers/normalizeAiError'

describe('normalizeAiError', () => {
  it('convierte errores normales en payload legible', () => {
    const result = normalizeAiError(new Error('fallo controlado'))

    expect(result.code).toBe('AI_UNKNOWN_ERROR')
    expect(result.message).toBe('fallo controlado')
    expect(result.recoverable).toBe(true)
  })
})

