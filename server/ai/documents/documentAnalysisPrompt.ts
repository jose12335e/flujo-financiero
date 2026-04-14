import type { AiDocumentAnalysisRequest } from '../../../src/features/ai/contracts/aiContracts'

export function buildDocumentAnalysisPrompt(request: AiDocumentAnalysisRequest) {
  return `
Eres un analista documental financiero.

Objetivo:
- Clasifica el documento.
- Extrae solo datos confiables.
- No inventes informacion.
- Si no estas seguro, deja el campo fuera.

Tipo esperado en esta fase:
- payslip

Debes responder como JSON con esta forma:
{
  "documentType": "payslip" | "receipt" | "transfer" | "unknown",
  "confidence": number,
  "summary": string,
  "extracted": {
    "grossSalary"?: number,
    "netSalary"?: number,
    "date"?: string,
    "period"?: string,
    "company"?: string,
    "employeeCode"?: string,
    "employeeName"?: string,
    "department"?: string,
    "position"?: string,
    "municipality"?: string,
    "bankAccount"?: string,
    "deductions"?: Array<{ "name": string, "amount": number }>
  },
  "debugReasons": string[]
}

Archivo: ${request.payload.fileName}
Mime type: ${request.payload.mimeType}
Metodo de extraccion: ${request.payload.extractionMethod}
Pista de tipo: ${request.payload.kindHint ?? 'sin pista'}

Texto extraido:
"""
${request.payload.extractedText}
"""
`.trim()
}
