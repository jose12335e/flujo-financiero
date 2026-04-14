import { describe, expect, it } from 'vitest'

import { normalizeExtractedText } from '@/features/documents/helpers/normalizeExtractedText'

describe('normalizeExtractedText', () => {
  it('compacta espacios y limpia saltos sobrantes', () => {
    const result = normalizeExtractedText('  Total   1500 \r\n\r\n\r\n  Banco   Nacional  ')

    expect(result).toBe('Total 1500\n\nBanco Nacional')
  })
})

