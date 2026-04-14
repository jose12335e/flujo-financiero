import type { ParsedDocumentExtractedData } from '@/features/documents/types/documents'

function extractAmount(rawText: string) {
  const match = rawText.match(/(?:total|monto)[:\s$]*([\d.,]+)/i)

  if (!match?.[1]) {
    return undefined
  }

  const normalized = match[1].replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.')
  const amount = Number(normalized)
  return Number.isNaN(amount) ? undefined : amount
}

export function parseReceipt(rawText: string): ParsedDocumentExtractedData {
  return {
    netSalary: extractAmount(rawText),
    date: rawText.match(/(\d{2}[/-]\d{2}[/-]\d{2,4})/)?.[1],
    company: rawText.match(/(?:comercio|establecimiento|tienda)[:\s]*(.+)/i)?.[1]?.trim(),
  }
}
