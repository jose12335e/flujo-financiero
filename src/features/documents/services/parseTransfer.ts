import type { ParsedDocumentExtractedData } from '@/features/documents/types/documents'

function extractAmount(rawText: string) {
  const match = rawText.match(/(?:monto|importe|enviado)[:\s$]*([\d.,]+)/i)

  if (!match?.[1]) {
    return undefined
  }

  const normalized = match[1].replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.')
  const amount = Number(normalized)
  return Number.isNaN(amount) ? undefined : amount
}

export function parseTransfer(rawText: string): ParsedDocumentExtractedData {
  return {
    netSalary: extractAmount(rawText),
    company: rawText.match(/banco[:\s]*(.+)/i)?.[1]?.trim(),
    date: rawText.match(/(\d{2}[/-]\d{2}[/-]\d{2,4})/)?.[1],
    bankAccount: rawText.match(/(?:referencia|operacion|transaccion)[:\s#-]*([A-Z0-9-]+)/i)?.[1],
  }
}
