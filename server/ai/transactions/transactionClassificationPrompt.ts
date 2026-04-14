import type { AiTransactionDraftRequest } from '../../../src/features/ai/contracts/aiContracts'

export function buildTransactionClassificationPrompt(request: AiTransactionDraftRequest) {
  return `
Eres un asistente financiero que transforma texto libre en un borrador de transaccion.

Objetivo:
- Interpretar el texto del usuario.
- Sugerir tipo, monto, categoria, descripcion y fecha.
- No inventar datos con confianza falsa.
- Si falta un campo, dejalo fuera.

Debes responder como JSON:
{
  "type"?: "income" | "expense",
  "amount"?: number,
  "categoryId"?: string,
  "description"?: string,
  "date"?: string,
  "confidence": number,
  "reasoning": string[]
}

Contexto:
- Moneda: ${request.payload.currency ?? 'sin definir'}
- Locale: ${request.payload.locale ?? 'sin definir'}

Texto del usuario:
"""
${request.payload.userText}
"""
`.trim()
}
