import { createAiRequestMeta } from '@/features/ai/helpers/createAiRequestMeta'
import { AiClientConfigurationError } from '@/features/ai/services/aiClient'
import { generateRecommendations } from '@/features/ai/services/aiRecommendations'
import type { BudgetStatus, DebtSummary, MonthlySummary, RecurringRule, SalarySummary } from '@/types/finance'
import type { FinancialOutlook } from '@/utils/dashboard'
import type { FinancialRecommendationsResult, FinancialRecommendationItem } from '@/features/recommendations/types/financialRecommendations'

interface AnalyzeFinancialRecommendationsInput {
  currentMonthKey: string
  currentMonthSummary: MonthlySummary
  budgetStatus: BudgetStatus
  debtSummary: DebtSummary
  recurringRules: RecurringRule[]
  financialOutlook: FinancialOutlook
  salarySummary: SalarySummary | null
}

function buildRecommendation(
  id: string,
  title: string,
  description: string,
  priority: FinancialRecommendationItem['priority'],
): FinancialRecommendationItem {
  return {
    id,
    title,
    description,
    priority,
    analysisSource: 'local',
  }
}

export function buildLocalFinancialRecommendations(
  input: AnalyzeFinancialRecommendationsInput,
): FinancialRecommendationsResult {
  const recommendations: FinancialRecommendationItem[] = []

  if (input.budgetStatus.isOverLimit) {
    recommendations.push(
      buildRecommendation(
        'budget-over-limit',
        'Congela gastos no esenciales',
        'Ya superaste tu presupuesto mensual. Conviene pausar compras prescindibles y priorizar solo gastos necesarios hasta cerrar el periodo.',
        'high',
      ),
    )
  } else if (input.budgetStatus.isNearLimit) {
    recommendations.push(
      buildRecommendation(
        'budget-near-limit',
        'Baja el ritmo del resto del mes',
        'Estas cerca del limite presupuestario. Reducir gastos variables ahora te ayudara a cerrar el mes sin presion extra.',
        'high',
      ),
    )
  }

  if (input.financialOutlook.estimatedAvailableBalance < 0) {
    recommendations.push(
      buildRecommendation(
        'negative-available-balance',
        'Protege liquidez antes del cierre',
        'Tu balance disponible estimado quedaria negativo. Revisa pagos posponibles, recorta gasto variable o adelanta una entrada si es posible.',
        'high',
      ),
    )
  }

  const estimatedNetSalary = input.financialOutlook.estimatedNetSalary
  if (input.salarySummary && estimatedNetSalary && estimatedNetSalary > 0) {
    const commitmentRatio = input.financialOutlook.committedMoney / estimatedNetSalary

    if (commitmentRatio >= 0.5) {
      recommendations.push(
        buildRecommendation(
          'commitment-ratio',
          'Revisa compromisos fijos del mes',
          'Tus compromisos fijos consumen una parte alta del sueldo neto estimado. Vale la pena renegociar pagos o revisar servicios recurrentes.',
          'medium',
        ),
      )
    }
  }

  if (input.debtSummary.totalPending > 0 && input.debtSummary.monthlyCommitted > 0) {
    recommendations.push(
      buildRecommendation(
        'debt-plan',
        'Define una estrategia para tus deudas',
        'Tienes saldo pendiente y cuota mensual activa. Ordena tus pagos por prioridad e identifica si alguna deuda critica merece un abono adicional.',
        input.debtSummary.activeCount > 2 ? 'high' : 'medium',
      ),
    )
  }

  const fixedRulesCount = input.recurringRules.filter((rule) => rule.isActive && rule.isFixed && rule.type === 'expense').length
  if (fixedRulesCount > 0 && input.currentMonthSummary.income > 0 && input.currentMonthSummary.expenses > input.currentMonthSummary.income * 0.7) {
    recommendations.push(
      buildRecommendation(
        'fixed-expense-review',
        'Evalua tus gastos recurrentes',
        'Tus gastos del mes ya consumen gran parte del ingreso registrado. Revisa si alguno de tus gastos fijos puede ajustarse o posponerse.',
        'medium',
      ),
    )
  }

  if (recommendations.length === 0) {
    recommendations.push(
      buildRecommendation(
        'stable-month',
        'Mantén el ritmo actual',
        'Tu panorama financiero del mes se ve estable. Aprovecha este margen para reforzar ahorro o adelantar algun objetivo puntual.',
        'low',
      ),
    )
  }

  return {
    summary:
      recommendations[0]?.priority === 'high'
        ? 'Hay acciones concretas que conviene priorizar este mes.'
        : 'Tienes oportunidades puntuales para optimizar tu dinero sin necesidad de cambios bruscos.',
    recommendations: recommendations.slice(0, 4),
    analysisSource: 'local',
  }
}

export async function analyzeFinancialRecommendations(
  input: AnalyzeFinancialRecommendationsInput,
): Promise<FinancialRecommendationsResult> {
  const localResult = buildLocalFinancialRecommendations(input)

  try {
    const response = await generateRecommendations({
      meta: createAiRequestMeta('recommendations'),
      payload: {
        snapshot: {
          monthKey: input.currentMonthKey,
          currentMonthSummary: input.currentMonthSummary,
          budgetStatus: input.budgetStatus,
          debtSummary: input.debtSummary,
          financialOutlook: input.financialOutlook,
          salarySummary: input.salarySummary,
          recurringRules: input.recurringRules.map((rule) => ({
            id: rule.id,
            type: rule.type,
            amount: rule.amount,
            description: rule.description,
            isFixed: rule.isFixed,
            isActive: rule.isActive,
          })),
        },
      },
    })

    if (!response.ok) {
      return localResult
    }

    return {
      summary: localResult.summary,
      recommendations: [
        ...localResult.recommendations,
        ...response.data.recommendations.map((recommendation) => ({
          ...recommendation,
          analysisSource: 'ai' as const,
        })),
      ].slice(0, 5),
      analysisSource: 'hybrid',
    }
  } catch (error) {
    if (error instanceof AiClientConfigurationError) {
      return localResult
    }

    return localResult
  }
}
