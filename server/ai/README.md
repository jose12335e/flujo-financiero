# AI backend contract base

Esta carpeta deja preparada la evolucion segura del backend de IA sin mezclarla con la logica financiera del frontend.

## Endpoints esperados

- `POST /api/ai/documents/analyze`
- `POST /api/ai/transactions/classify`
- `POST /api/ai/insights/generate`
- `POST /api/ai/recommendations/generate`
- `POST /api/ai/chat/message`
- `POST /api/ai/forecasting/generate`

## Regla de integracion

- El frontend nunca envia API keys
- El backend valida input/output
- El modelo sugiere
- El usuario revisa
- La app confirma antes de guardar

## Siguiente paso recomendado

Conectar esta base a un runtime Node.js o serverless que importe los contratos definidos en:

- `src/features/ai/contracts/aiContracts.ts`
- `src/features/ai/types/ai.ts`

## Base documental disponible

La etapa documental ya deja preparados estos archivos de backend:

- `server/ai/documents/documentAnalysisPrompt.ts`
- `server/ai/documents/documentAnalysisSchema.ts`
- `server/ai/documents/analyzeDocumentWithGemini.ts`
- `server/ai/gemini/geminiClient.ts`

Su objetivo es:

- construir el prompt para el modelo
- forzar una salida JSON consistente
- mantener la llamada al proveedor fuera del frontend
- dejar el frontend consumiendo solo contratos HTTP seguros

## Base de clasificacion de transacciones disponible

La etapa de registro inteligente deja preparados estos archivos:

- `server/ai/transactions/transactionClassificationPrompt.ts`
- `server/ai/transactions/transactionClassificationSchema.ts`
- `server/ai/transactions/classifyTransactionWithGemini.ts`

Su objetivo es:

- interpretar texto libre del usuario
- devolver un borrador de transaccion estructurado
- mantener la sugerencia en backend y no en el navegador
- permitir validacion antes de devolver la respuesta al frontend

## Base de organizacion automatica disponible

La etapa de clasificacion automatica deja preparados estos archivos:

- `server/ai/transactions/transactionOrganizationPrompt.ts`
- `server/ai/transactions/transactionOrganizationSchema.ts`
- `server/ai/transactions/organizeTransactionsWithGemini.ts`

Su objetivo es:

- revisar movimientos ya registrados
- detectar reclasificaciones posibles
- detectar posibles duplicados
- detectar gastos repetitivos o fijos
- devolver solo sugerencias, nunca cambios automaticos

## Base de insights financieros disponible

La etapa de insights deja preparados estos archivos:

- `server/ai/insights/financialInsightsPrompt.ts`
- `server/ai/insights/financialInsightsSchema.ts`
- `server/ai/insights/generateFinancialInsightsWithGemini.ts`

Su objetivo es:

- generar un resumen mensual automatico
- explicar variaciones y alertas
- devolver solo texto interpretativo, nunca cambios financieros

## Base de recomendaciones financieras disponible

La etapa de recomendaciones deja preparados estos archivos:

- `server/ai/recommendations/financialRecommendationsPrompt.ts`
- `server/ai/recommendations/financialRecommendationsSchema.ts`
- `server/ai/recommendations/generateFinancialRecommendationsWithGemini.ts`

Su objetivo es:

- sugerir acciones concretas de ahorro, presupuesto y deuda
- priorizar recomendaciones por impacto
- mantener siempre la decision final del lado del usuario

## Base de chat financiero disponible

La etapa de chat deja preparados estos archivos:

- `server/ai/chat/financialChatPrompt.ts`
- `server/ai/chat/financialChatSchema.ts`
- `server/ai/chat/generateFinancialChatWithGemini.ts`

Su objetivo es:

- responder preguntas en lenguaje natural usando el snapshot financiero real
- mantener respuestas seguras y explicativas
- no inventar datos ni ejecutar acciones automaticas

## Base de proyecciones y simulaciones disponible

La etapa de forecasting deja preparados estos archivos:

- `server/ai/forecasting/financialForecastPrompt.ts`
- `server/ai/forecasting/financialForecastSchema.ts`
- `server/ai/forecasting/generateFinancialForecastWithGemini.ts`

Su objetivo es:

- proyectar un cierre de mes con escenarios de ingreso, gasto, ahorro y deuda
- devolver una lectura de riesgo entendible
- mantener la simulacion como sugerencia, nunca como cambio automatico
