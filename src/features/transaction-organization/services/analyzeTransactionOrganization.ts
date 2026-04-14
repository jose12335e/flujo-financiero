import { differenceInCalendarDays, parseISO } from 'date-fns'

import { createAiRequestMeta } from '@/features/ai/helpers/createAiRequestMeta'
import { AiClientConfigurationError } from '@/features/ai/services/aiClient'
import { organizeTransactionsWithAi } from '@/features/ai/services/aiTransactionOrganization'
import type { AiTransactionOrganizationResult } from '@/features/ai/contracts/aiContracts'
import type { Category, Transaction } from '@/types/finance'
import type {
  TransactionOrganizationContext,
  TransactionOrganizationResult,
  TransactionOrganizationSuggestion,
  TransactionOrganizationSuggestionKind,
} from '@/features/transaction-organization/types/transactionOrganization'

const genericDescriptions = new Set(['', 'gasto', 'ingreso', 'pago', 'compra', 'deposito', 'depósito'])

const categoryKeywordMap: Record<string, string[]> = {
  salary: ['salario', 'nomina', 'sueldo', 'quincena'],
  freelance: ['cliente', 'freelance', 'honorarios', 'proyecto'],
  gift: ['regalo', 'obsequio'],
  investment: ['dividendo', 'interes', 'inversion'],
  'other-income': ['ingreso', 'extra', 'bono'],
  housing: ['alquiler', 'renta', 'hipoteca', 'vivienda'],
  food: ['comida', 'almuerzo', 'supermercado', 'mercado', 'desayuno', 'cena'],
  transport: ['uber', 'taxi', 'gasolina', 'pasaje', 'transporte'],
  health: ['farmacia', 'medico', 'salud', 'hospital', 'seguro'],
  education: ['curso', 'universidad', 'colegio', 'educacion', 'matricula'],
  entertainment: ['cine', 'spotify', 'netflix', 'ocio', 'salida'],
  services: ['internet', 'telefono', 'wifi', 'agua', 'luz', 'servicio'],
  shopping: ['ropa', 'zapatos', 'tienda', 'compra'],
  'debt-payment': ['tarjeta', 'prestamo', 'deuda', 'cuota'],
  'other-expense': ['gasto', 'pago', 'compra'],
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

function buildSuggestion(
  partial: Omit<TransactionOrganizationSuggestion, 'confidenceLabel'>,
): TransactionOrganizationSuggestion {
  return {
    ...partial,
    confidenceLabel: getConfidenceLabel(partial.confidence),
  }
}

function normalizeDescription(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function inferCategoryId(transaction: Transaction, categories: Category[]) {
  const description = normalizeDescription(transaction.description)
  const availableCategories = categories.filter((category) => category.type === transaction.type)

  let bestCategoryId: string | undefined
  let bestScore = 0

  for (const category of availableCategories) {
    const tokens = categoryKeywordMap[category.id] ?? [category.label.toLowerCase()]
    const score = tokens.reduce((sum, token) => sum + (description.includes(token) ? 1 : 0), 0)

    if (score > bestScore) {
      bestScore = score
      bestCategoryId = category.id
    }
  }

  return bestScore > 0 ? bestCategoryId : undefined
}

function createCategorySuggestions(transactions: Transaction[], categories: Category[]) {
  return transactions.flatMap((transaction) => {
    const inferredCategoryId = inferCategoryId(transaction, categories)

    if (!inferredCategoryId || inferredCategoryId === transaction.categoryId) {
      return []
    }

    if (transaction.categoryId !== 'other-expense' && transaction.categoryId !== 'other-income') {
      return []
    }

    const suggestedCategoryLabel = categories.find((category) => category.id === inferredCategoryId)?.label ?? 'categoria sugerida'

    return [
      buildSuggestion({
        id: `category-${transaction.id}`,
        kind: 'category',
        transactionId: transaction.id,
        title: 'Categoria mas precisa detectada',
        description: `Este movimiento podria encajar mejor en ${suggestedCategoryLabel}.`,
        confidence: 0.74,
        suggestedCategoryId: inferredCategoryId,
        analysisSource: 'local',
        reasoning: ['La descripcion contiene palabras clave asociadas a una categoria mas especifica.'],
      }),
    ]
  })
}

function createDescriptionSuggestions(transactions: Transaction[]) {
  return transactions.flatMap((transaction) => {
    const normalizedDescription = normalizeDescription(transaction.description)
    const isGeneric = genericDescriptions.has(normalizedDescription) || normalizedDescription.length < 5

    if (!isGeneric) {
      return []
    }

    return [
      buildSuggestion({
        id: `description-${transaction.id}`,
        kind: 'description',
        transactionId: transaction.id,
        title: 'Descripcion poco especifica',
        description: 'Conviene agregar mas detalle para que el historial y las futuras sugerencias sean mas utiles.',
        confidence: 0.66,
        analysisSource: 'local',
        reasoning: ['La descripcion actual es demasiado corta o generica.'],
      }),
    ]
  })
}

function createDuplicateSuggestions(transactions: Transaction[]) {
  const suggestions: TransactionOrganizationSuggestion[] = []
  const seenPairs = new Set<string>()

  for (let leftIndex = 0; leftIndex < transactions.length; leftIndex += 1) {
    const left = transactions[leftIndex]

    for (let rightIndex = leftIndex + 1; rightIndex < transactions.length; rightIndex += 1) {
      const right = transactions[rightIndex]

      if (left.type !== right.type || left.categoryId !== right.categoryId || left.amount !== right.amount) {
        continue
      }

      const dateDistance = Math.abs(differenceInCalendarDays(parseISO(left.date), parseISO(right.date)))
      const sameDescription = normalizeDescription(left.description) === normalizeDescription(right.description)

      if (dateDistance > 3 || !sameDescription) {
        continue
      }

      const pairKey = [left.id, right.id].sort().join(':')

      if (seenPairs.has(pairKey)) {
        continue
      }

      seenPairs.add(pairKey)
      suggestions.push(
        buildSuggestion({
          id: `duplicate-${pairKey}`,
          kind: 'duplicate',
          transactionId: left.id,
          relatedTransactionIds: [right.id],
          title: 'Posible movimiento duplicado',
          description: 'Hay otro movimiento muy parecido por monto, categoria, descripcion y fecha cercana.',
          confidence: 0.87,
          analysisSource: 'local',
          reasoning: ['Coinciden monto, categoria y descripcion en un rango de pocos dias.'],
        }),
      )
    }
  }

  return suggestions
}

function createFixedExpenseSuggestions(transactions: Transaction[]) {
  const expenses = transactions.filter((transaction) => transaction.type === 'expense' && transaction.source !== 'recurring')
  const grouped = new Map<string, Transaction[]>()

  for (const transaction of expenses) {
    const key = `${transaction.categoryId}:${normalizeDescription(transaction.description)}:${transaction.amount}`
    const currentGroup = grouped.get(key) ?? []
    currentGroup.push(transaction)
    grouped.set(key, currentGroup)
  }

  const suggestions: TransactionOrganizationSuggestion[] = []

  for (const [, group] of grouped) {
    if (group.length < 2) {
      continue
    }

    const uniqueMonths = new Set(group.map((transaction) => transaction.date.slice(0, 7)))

    if (uniqueMonths.size < 2) {
      continue
    }

    const [first] = group
    suggestions.push(
      buildSuggestion({
        id: `fixed-${first.id}`,
        kind: 'fixed-expense',
        transactionId: first.id,
        relatedTransactionIds: group.slice(1).map((transaction) => transaction.id),
        title: 'Posible gasto fijo detectado',
        description: 'Este gasto aparece en varios meses con el mismo monto y descripcion parecida.',
        confidence: 0.81,
        analysisSource: 'local',
        reasoning: ['La recurrencia mensual y el monto estable sugieren un gasto fijo o repetitivo.'],
      }),
    )
  }

  return suggestions
}

function summarizeSuggestions(suggestions: TransactionOrganizationSuggestion[]) {
  return {
    totalSuggestions: suggestions.length,
    categorySuggestions: suggestions.filter((suggestion) => suggestion.kind === 'category').length,
    fixedExpenseCandidates: suggestions.filter((suggestion) => suggestion.kind === 'fixed-expense').length,
    duplicateCandidates: suggestions.filter((suggestion) => suggestion.kind === 'duplicate').length,
    descriptionSuggestions: suggestions.filter((suggestion) => suggestion.kind === 'description').length,
  }
}

function createLocalResult(transactions: Transaction[], categories: Category[]): TransactionOrganizationResult {
  const suggestions = [
    ...createCategorySuggestions(transactions, categories),
    ...createFixedExpenseSuggestions(transactions),
    ...createDuplicateSuggestions(transactions),
    ...createDescriptionSuggestions(transactions),
  ].sort((left, right) => right.confidence - left.confidence)

  return {
    summary: summarizeSuggestions(suggestions),
    suggestions,
    overview:
      suggestions.length > 0
        ? 'Encontramos oportunidades para clasificar mejor algunos movimientos y revisar patrones repetidos.'
        : 'No detectamos problemas claros de clasificacion en este momento.',
  }
}

function mapAiSuggestion(
  suggestion: AiTransactionOrganizationResult['suggestions'][number],
): TransactionOrganizationSuggestion {
  return buildSuggestion({
    id: `ai-${suggestion.kind}-${suggestion.transactionId}`,
    kind: suggestion.kind as TransactionOrganizationSuggestionKind,
    transactionId: suggestion.transactionId,
    relatedTransactionIds: suggestion.relatedTransactionIds,
    title: suggestion.title,
    description: suggestion.description,
    confidence: suggestion.confidence,
    suggestedCategoryId: suggestion.suggestedCategoryId,
    analysisSource: 'ai',
    reasoning: suggestion.reasoning ?? [],
  })
}

async function tryAnalyzeWithAi(context: TransactionOrganizationContext) {
  try {
    const response = await organizeTransactionsWithAi({
      meta: createAiRequestMeta('transaction-organization', {
        locale: context.locale,
        timezone: context.timezone,
        userId: context.userId,
      }),
      payload: {
        currency: context.currency,
        transactions: context.transactions.map((transaction) => ({
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          categoryId: transaction.categoryId,
          description: transaction.description,
          date: transaction.date,
          source: transaction.source,
        })),
        categories: context.categories.map((category) => ({
          id: category.id,
          type: category.type,
          label: category.label,
        })),
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
      reasons: [],
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
      reasons: ['No pudimos completar la revision IA. Se muestran solo sugerencias locales.'],
    }
  }
}

export async function analyzeTransactionOrganization(
  context: TransactionOrganizationContext,
): Promise<TransactionOrganizationResult> {
  const localResult = createLocalResult(context.transactions, context.categories)
  const ai = await tryAnalyzeWithAi(context)

  if (!ai.result) {
    if (ai.reasons.length > 0) {
      return {
        ...localResult,
        overview: `${localResult.overview} ${ai.reasons[0]}`.trim(),
      }
    }

    return localResult
  }

  const aiSuggestions = ai.result.suggestions.map(mapAiSuggestion)
  const suggestions = [...localResult.suggestions, ...aiSuggestions].sort((left, right) => right.confidence - left.confidence)

  return {
    summary: summarizeSuggestions(suggestions),
    suggestions,
    overview: ai.result.summary ?? localResult.overview,
  }
}
