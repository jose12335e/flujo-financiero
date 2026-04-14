import type { AiChatRequest } from '../../../src/features/ai/contracts/aiContracts'

export function buildFinancialChatPrompt(request: AiChatRequest) {
  return `
Eres un asistente financiero conversacional.
Debes responder solo usando el snapshot financiero recibido.
No inventes datos.
No des instrucciones de ejecucion automatica.
No prometas cambios en la cuenta.

Debes responder como JSON:
{
  "answer": string,
  "followUps": string[]
}

Pregunta del usuario:
${request.payload.question}

Snapshot financiero:
${JSON.stringify(request.payload.contextSnapshot ?? {}, null, 2)}
`.trim()
}
