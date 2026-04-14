import { format, parse, subMonths } from 'date-fns'

import { createAiRequestMeta } from '@/features/ai/helpers/createAiRequestMeta'
import { AiClientConfigurationError } from '@/features/ai/services/aiClient'
import { generateFinancialInsights } from '@/features/ai/services/aiInsights'
import type { Category, MonthlyBudget, RecurringRule, Transaction } from '@/types/finance'
import type { FinancialOutlook } from '@/utils/dashboard'
import { calculateCategorySummary, calculateMonthlySummary } from '@/utils/finance'
import { formatMonthLabel, formatPercentage } from '@/utils/format'
import type { FinancialInsightsResult } from '@/features/insights/types/financialInsights'

interface AnalyzeFinancialInsightsInput {
  currentMonthKey: string
  transactions: Transaction[]
  categories: Category[]
  monthlyBudget: MonthlyBudget
  recurringRules: RecurringRule[]
  financialOutlook: FinancialOutlook
  userId?: string
}

function calculateVariation(currentValue: number, previousValue: number) {
  if (previousValue === 0) {
    return currentValue > 0 ? 1 : 0
  }

  return (currentValue - previousValue) / previousValue
}

export function buildLocalFinancialInsights(input: AnalyzeFinancialInsightsInput): FinancialInsightsResult {
  const previousMonthKey = format(subMonths(parse(input.currentMonthKey, 'yyyy-MM', new Date()), 1), 'yyyy-MM')
  const currentMonthSummary = calculateMonthlySummary(input.transactions, input.currentMonthKey)
  const previousMonthSummary = calculateMonthlySummary(input.transactions, previousMonthKey)
  const currentMonthCategories = calculateCategorySummary(input.transactions, input.categories, {
    monthKey: input.currentMonthKey,
    type: 'expense',
  })

  const insights: string[] = []
  const riskFlags: string[] = []

  const expenseVariation = calculateVariation(currentMonthSummary.expenses, previousMonthSummary.expenses)
  if (Math.abs(expenseVariation) >= 0.1 && currentMonthSummary.expenses > 0) {
    insights.push(
      expenseVariation > 0
        ? `Tus gastos de ${formatMonthLabel(input.currentMonthKey)} subieron ${formatPercentage(expenseVariation)} frente a ${formatMonthLabel(previousMonthKey)}.`
        : `Tus gastos de ${formatMonthLabel(input.currentMonthKey)} bajaron ${formatPercentage(Math.abs(expenseVariation))} frente a ${formatMonthLabel(previousMonthKey)}.`,
    )
  }

  const topCategory = currentMonthCategories[0]
  if (topCategory) {
    insights.push(`La categoria con mayor impacto del mes es ${topCategory.label}, con ${formatPercentage(topCategory.percentage)} del gasto del periodo.`)
  }

  const recurringFixedExpenses = input.recurringRules
    .filter((rule) => rule.isActive && rule.isFixed && rule.type === 'expense')
    .reduce((sum, rule) => sum + rule.amount, 0)

  const committedBase = input.financialOutlook.committedMoney
  if (input.financialOutlook.estimatedNetSalary && input.financialOutlook.estimatedNetSalary > 0) {
    const commitmentRatio = committedBase / input.financialOutlook.estimatedNetSalary

    insights.push(`Tus compromisos fijos representan ${formatPercentage(commitmentRatio)} de tu sueldo neto mensual estimado.`)

    if (commitmentRatio >= 0.6) {
      riskFlags.push('Tus compromisos fijos estan consumiendo una parte alta del ingreso estimado del mes.')
    }
  } else if (currentMonthSummary.income > 0) {
    const commitmentRatio = committedBase / currentMonthSummary.income
    insights.push(`Tus compromisos actuales equivalen a ${formatPercentage(commitmentRatio)} del ingreso registrado este mes.`)
  } else if (recurringFixedExpenses > 0 || committedBase > 0) {
    riskFlags.push('Hay compromisos del mes, pero aun no registras ingresos suficientes para compararlos con claridad.')
  }

  const budgetSpent = currentMonthSummary.expenses
  const budgetLimit = input.monthlyBudget.limit
  if (budgetLimit > 0) {
    const budgetRatio = budgetSpent / budgetLimit

    if (budgetRatio >= 1) {
      riskFlags.push('Ya superaste el presupuesto mensual configurado.')
    } else if (budgetRatio >= input.monthlyBudget.warningThreshold) {
      riskFlags.push('Estas cerca del limite de tu presupuesto mensual.')
    }
  }

  if (input.financialOutlook.estimatedAvailableBalance < 0) {
    riskFlags.push('Hay riesgo de cerrar el periodo con balance disponible negativo si el ritmo actual se mantiene.')
  } else if (input.financialOutlook.estimatedAvailableBalance === 0) {
    riskFlags.push('Tu balance disponible estimado esta en un punto muy justo para cerrar el periodo.')
  }

  if (insights.length === 0) {
    insights.push('Tus datos actuales no muestran cambios fuertes, pero ya tenemos base para seguir detectando patrones a medida que registres mas movimientos.')
  }

  return {
    summary:
      riskFlags.length > 0
        ? 'Hay puntos del mes que conviene revisar antes de cerrar el periodo.'
        : 'Tu panorama mensual se ve estable con los datos registrados hasta ahora.',
    insights: insights.slice(0, 4),
    riskFlags,
    analysisSource: 'local',
  }
}

export async function analyzeFinancialInsights(
  input: AnalyzeFinancialInsightsInput,
): Promise<FinancialInsightsResult> {
  const localResult = buildLocalFinancialInsights(input)

  try {
    const response = await generateFinancialInsights({
      meta: createAiRequestMeta('insights', {
        userId: input.userId,
      }),
      payload: {
        monthKey: input.currentMonthKey,
        snapshot: {
          monthlyBudget: input.monthlyBudget,
          financialOutlook: input.financialOutlook,
          currentMonthSummary: calculateMonthlySummary(input.transactions, input.currentMonthKey),
          transactions: input.transactions.map((transaction) => ({
            id: transaction.id,
            type: transaction.type,
            amount: transaction.amount,
            categoryId: transaction.categoryId,
            description: transaction.description,
            date: transaction.date,
            source: transaction.source,
          })),
        },
      },
    })

    if (!response.ok) {
      return localResult
    }

    return {
      summary: response.data.summary || localResult.summary,
      insights: response.data.insights?.length ? response.data.insights : localResult.insights,
      riskFlags: response.data.riskFlags?.length ? response.data.riskFlags : localResult.riskFlags,
      analysisSource: 'hybrid',
    }
  } catch (error) {
    if (error instanceof AiClientConfigurationError) {
      return localResult
    }

    return localResult
  }
}
