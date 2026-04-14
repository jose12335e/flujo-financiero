import type { AiTransactionOrganizationRequest } from '../../../src/features/ai/contracts/aiContracts'

export function buildTransactionOrganizationPrompt(request: AiTransactionOrganizationRequest) {
  return `
Eres un analista financiero que revisa movimientos ya registrados.

Objetivo:
- detectar posibles reclasificaciones
- detectar posibles movimientos duplicados
- detectar gastos que parecen fijos o recurrentes
- detectar descripciones demasiado genericas

No modifiques nada. Solo devuelve sugerencias.

Debes responder como JSON:
{
  "summary"?: string,
  "suggestions": Array<{
    "kind": "category" | "fixed-expense" | "duplicate" | "description",
    "transactionId": string,
    "relatedTransactionIds"?: string[],
    "title": string,
    "description": string,
    "confidence": number,
    "suggestedCategoryId"?: string,
    "reasoning"?: string[]
  }>
}

Moneda: ${request.payload.currency ?? 'sin definir'}

Categorias disponibles:
${request.payload.categories.map((category) => `- ${category.id}: ${category.label} (${category.type})`).join('\n')}

Movimientos:
${request.payload.transactions
  .map(
    (transaction) =>
      `- ${transaction.id} | ${transaction.type} | ${transaction.amount} | ${transaction.categoryId} | ${transaction.date} | ${transaction.description}`,
  )
  .join('\n')}
`.trim()
}
