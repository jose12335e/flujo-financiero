import type { AiModuleDefinition } from '@/features/ai/types/ai'

export const AI_MODULES: AiModuleDefinition[] = [
  {
    key: 'documents',
    label: 'AI Document Analysis',
    description: 'Extrae texto, interpreta documentos y prepara revision editable.',
    route: '/documentos',
  },
  {
    key: 'transaction-classifier',
    label: 'AI Transaction Classifier',
    description: 'Interpreta texto libre y propone movimientos estructurados.',
    route: '/registrar-inteligente',
  },
  {
    key: 'transaction-organization',
    label: 'AI Transaction Organization',
    description: 'Revisa movimientos existentes y sugiere clasificacion, duplicados y gastos fijos.',
    route: '/clasificacion-ia',
  },
  {
    key: 'insights',
    label: 'AI Financial Insights',
    description: 'Genera resúmenes y detecta cambios relevantes.',
    route: '/',
  },
  {
    key: 'recommendations',
    label: 'AI Recommendations',
    description: 'Sugiere acciones sobre ahorro, deuda y presupuesto.',
    route: '/',
  },
  {
    key: 'chat',
    label: 'AI Chat Assistant',
    description: 'Responde preguntas usando el contexto real del usuario.',
    route: '/',
  },
  {
    key: 'forecasting',
    label: 'AI Forecasting',
    description: 'Simula cierres de mes y escenarios financieros.',
    route: '/',
  },
]

export const AI_DEFAULT_REQUEST_TIMEOUT_MS = 20_000
