import type { AiInsightsRequest } from '../../../src/features/ai/contracts/aiContracts'

export function buildFinancialInsightsPrompt(request: AiInsightsRequest) {
  return `
Eres un analista financiero que genera insights mensuales utiles y concretos.

Objetivo:
- resumir el estado financiero del periodo
- detectar variaciones relevantes
- senalar riesgos o alertas
- usar lenguaje claro y accionable

No inventes cifras que no existan en el contexto.

Debes responder como JSON:
{
  "summary": string,
  "insights": string[],
  "riskFlags"?: string[]
}

Mes objetivo: ${request.payload.monthKey}

Snapshot:
${JSON.stringify(request.payload.snapshot, null, 2)}
`.trim()
}
