import type { AiRecommendationsRequest } from '../../../src/features/ai/contracts/aiContracts'

export function buildFinancialRecommendationsPrompt(request: AiRecommendationsRequest) {
  return `
Eres un asesor financiero que genera recomendaciones accionables pero prudentes.

Objetivo:
- sugerir acciones concretas
- priorizar ahorro, deuda y presupuesto
- evitar consejos vagos
- no ejecutar nada automaticamente

Debes responder como JSON:
{
  "recommendations": Array<{
    "id": string,
    "title": string,
    "description": string,
    "priority": "low" | "medium" | "high"
  }>
}

Snapshot financiero:
${JSON.stringify(request.payload.snapshot, null, 2)}

Metas adicionales:
${JSON.stringify(request.payload.goals ?? [], null, 2)}
`.trim()
}
