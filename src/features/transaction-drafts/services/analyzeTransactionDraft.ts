import { format, subDays } from 'date-fns'

import { createAiRequestMeta } from '@/features/ai/helpers/createAiRequestMeta'
import { AiClientConfigurationError } from '@/features/ai/services/aiClient'
import { classifyTransactionTextWithAi } from '@/features/ai/services/aiTransactionClassifier'
import type { AiTransactionDraftResult } from '@/features/ai/contracts/aiContracts'
import type { Category, TransactionType } from '@/types/finance'
import type { TransactionDraftContext, TransactionDraftSuggestion, TransactionDraftValues } from '@/features/transaction-drafts/types/transactionDraft'

const categoryKeywordMap: Record<string, string[]> = {
  salary: ['salario', 'nomina', 'sueldo', 'quincena', 'pago'],
  freelance: ['freelance', 'cliente', 'proyecto', 'honorarios'],
  gift: ['regalo', 'regalaron', 'obsequio'],
  investment: ['inversion', 'interes', 'dividendo'],
  'other-income': ['extra', 'bono', 'comision', 'ingreso'],
  housing: ['alquiler', 'renta', 'vivienda', 'hipoteca'],
  food: ['comida', 'almuerzo', 'cena', 'mercado', 'supermercado', 'desayuno'],
  transport: ['uber', 'gasolina', 'pasaje', 'transporte', 'taxi', 'combustible'],
  health: ['farmacia', 'medico', 'salud', 'seguro', 'hospital'],
  education: ['curso', 'educacion', 'colegio', 'universidad', 'matricula'],
  entertainment: ['cine', 'ocio', 'netflix', 'spotify', 'salida'],
  services: ['internet', 'luz', 'agua', 'servicio', 'telefono', 'wifi'],
  shopping: ['ropa', 'compra', 'tienda', 'shopping', 'zapatos'],
  'debt-payment': ['tarjeta', 'prestamo', 'deuda', 'cuota', 'pague la tarjeta'],
  'other-expense': ['gaste', 'pague', 'pago'],
}

function getConfidenceLabel(confidence: number) {
  if (confidence >= 0.8) {
    return 'high' as const
  }

  if (confidence >= 0.5) {
    return 'medium' as const
  }

  return 'low' as const
}

function parseLocalizedAmount(value: string) {
  const cleaned = value.replace(/[^\d,.-]/g, '')
  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')

  let normalized = cleaned

  if (lastComma !== -1 && lastDot !== -1) {
    normalized = lastComma > lastDot ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned.replace(/,/g, '')
  } else if (lastComma !== -1) {
    normalized = cleaned.replace(/\.(?=\d{3}\b)/g, '').replace(',', '.')
  } else {
    normalized = cleaned.replace(/,(?=\d{3}\b)/g, '')
  }

  const amount = Number(normalized)
  return Number.isFinite(amount) ? amount : undefined
}

function inferType(text: string): { type: TransactionType; reasons: string[] } {
  const normalized = text.toLowerCase()
  const incomeMatches = ['me pagaron', 'recibi', 'recibí', 'ingreso', 'cobre', 'cobré', 'salario', 'bono']
  const expenseMatches = ['gaste', 'gasté', 'pague', 'pagué', 'compre', 'compré', 'deuda', 'tarjeta']

  const incomeHits = incomeMatches.filter((token) => normalized.includes(token))
  const expenseHits = expenseMatches.filter((token) => normalized.includes(token))

  if (incomeHits.length > expenseHits.length) {
    return {
      type: 'income',
      reasons: [`Se detectaron señales de ingreso: ${incomeHits.join(', ')}.`],
    }
  }

  return {
    type: 'expense',
    reasons:
      expenseHits.length > 0
        ? [`Se detectaron señales de gasto: ${expenseHits.join(', ')}.`]
        : ['Sin señal fuerte de ingreso; se asumio gasto como punto de partida.'],
  }
}

function inferAmount(text: string) {
  const match = text.match(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})|\d+(?:[.,]\d{1,2})?)/)
  return match?.[1] ? parseLocalizedAmount(match[1]) : undefined
}

function inferDate(text: string) {
  const normalized = text.toLowerCase()

  if (normalized.includes('ayer')) {
    return format(subDays(new Date(), 1), 'yyyy-MM-dd')
  }

  if (normalized.includes('hoy')) {
    return format(new Date(), 'yyyy-MM-dd')
  }

  const explicitDate = text.match(/(\d{2})[/-](\d{2})[/-](\d{2,4})/)

  if (explicitDate) {
    const [, day, month, year] = explicitDate
    const normalizedYear = year.length === 2 ? `20${year}` : year
    return `${normalizedYear}-${month}-${day}`
  }

  return format(new Date(), 'yyyy-MM-dd')
}

function inferDescription(text: string) {
  return text.trim().replace(/\s+/g, ' ').slice(0, 140)
}

function inferCategoryId(text: string, type: TransactionType, categories: Category[]) {
  const normalized = text.toLowerCase()
  const availableCategories = categories.filter((category) => category.type === type)

  let bestCategoryId = availableCategories[0]?.id
  let bestScore = -1

  for (const category of availableCategories) {
    const tokens = categoryKeywordMap[category.id] ?? [category.label.toLowerCase()]
    const score = tokens.reduce((total, token) => total + (normalized.includes(token) ? 1 : 0), 0)

    if (score > bestScore) {
      bestScore = score
      bestCategoryId = category.id
    }
  }

  return bestCategoryId
}

function buildLocalDraft(text: string, categories: Category[]): { draft: TransactionDraftValues; reasoning: string[]; warnings: string[] } {
  const typeResult = inferType(text)
  const amount = inferAmount(text)
  const date = inferDate(text)
  const description = inferDescription(text)
  const categoryId = inferCategoryId(text, typeResult.type, categories)
  const warnings: string[] = []

  if (typeof amount !== 'number') {
    warnings.push('No pudimos detectar el monto con suficiente claridad. Revísalo antes de continuar.')
  }

  if (!categoryId) {
    warnings.push('No encontramos una categoria clara. Selecciona una manualmente.')
  }

  return {
    draft: {
      type: typeResult.type,
      amount,
      categoryId,
      description,
      date,
    },
    reasoning: [...typeResult.reasons],
    warnings,
  }
}

function mergeDraftValues(localDraft: TransactionDraftValues, aiDraft: AiTransactionDraftResult | null, categories: Category[]) {
  if (!aiDraft) {
    return localDraft
  }

  const aiType = aiDraft.type ?? localDraft.type
  const validAiCategory =
    aiDraft.categoryId && categories.some((category) => category.id === aiDraft.categoryId && category.type === aiType)
      ? aiDraft.categoryId
      : undefined
  const shouldPreferAiCategory =
    validAiCategory &&
    (!localDraft.categoryId || localDraft.categoryId === 'other-income' || localDraft.categoryId === 'other-expense')

  return {
    type: aiType,
    amount: typeof localDraft.amount === 'number' ? localDraft.amount : aiDraft.amount,
    categoryId:
      (shouldPreferAiCategory ? validAiCategory : localDraft.categoryId) ??
      validAiCategory ??
      inferCategoryId(localDraft.description || '', aiType, categories),
    description: localDraft.description || aiDraft.description || '',
    date: localDraft.date || aiDraft.date || format(new Date(), 'yyyy-MM-dd'),
  }
}

async function tryAnalyzeWithAi(text: string, context: TransactionDraftContext) {
  try {
    const response = await classifyTransactionTextWithAi({
      meta: createAiRequestMeta('transaction-classifier', {
        locale: context.locale,
        timezone: context.timezone,
        userId: context.userId,
      }),
      payload: {
        userText: text,
        currency: context.currency,
        locale: context.locale,
      },
    })

    if (!response.ok) {
      return {
        result: null,
        reasons: [response.error.message],
      }
    }

    return {
      result: response.data,
      reasons: response.data.reasoning ?? [],
    }
  } catch (error) {
    if (error instanceof AiClientConfigurationError) {
      return {
        result: null,
        reasons: [],
      }
    }

    return {
      result: null,
      reasons: ['No pudimos completar el apoyo de IA. Se uso el analisis local.'],
    }
  }
}

export async function analyzeTransactionDraft(text: string, context: TransactionDraftContext): Promise<TransactionDraftSuggestion> {
  const normalizedText = text.trim()

  if (!normalizedText) {
    throw new Error('Escribe una descripcion antes de pedir una sugerencia.')
  }

  const local = buildLocalDraft(normalizedText, context.categories)
  const ai = await tryAnalyzeWithAi(normalizedText, context)
  const mergedValues = mergeDraftValues(local.draft, ai.result, context.categories)

  let analysisSource: TransactionDraftSuggestion['analysisSource'] = 'local'

  if (ai.result) {
    analysisSource = 'hybrid'
  }

  const confidence = Math.max(ai.result?.confidence ?? 0, local.warnings.length === 0 ? 0.72 : 0.48)

  return {
    rawInput: normalizedText,
    values: mergedValues,
    confidence,
    confidenceLabel: getConfidenceLabel(confidence),
    analysisSource,
    reasoning: [...local.reasoning, ...ai.reasons.map((reason) => `[IA] ${reason}`)],
    warnings: local.warnings,
  }
}
