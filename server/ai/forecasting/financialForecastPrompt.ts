import type { AiForecastRequest } from '../../../src/features/ai/contracts/aiContracts'

export function buildFinancialForecastPrompt(request: AiForecastRequest) {
  return `
Eres un asistente financiero especializado en proyecciones.
Debes analizar el snapshot recibido y el escenario propuesto.
No inventes datos.
No ejecutes acciones.
Devuelve solo JSON con esta forma:
{
  "projectedBalance": number,
  "explanation": string,
  "riskLevel": "low" | "medium" | "high"
}

Mes objetivo:
${request.payload.monthKey}

Snapshot financiero:
${JSON.stringify(request.payload.snapshot, null, 2)}

Escenario:
${JSON.stringify(request.payload.scenario ?? {}, null, 2)}
`.trim()
}
