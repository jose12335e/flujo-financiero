import { createAiRequestMeta } from '@/features/ai/helpers/createAiRequestMeta'
import { AiClientConfigurationError } from '@/features/ai/services/aiClient'
import { generateFinancialForecast } from '@/features/ai/services/aiForecasting'
import type { ForecastScenario, FinancialForecastResult } from '@/features/forecasting/types/financialForecast'
import type { BudgetStatus, DebtSummary, MonthlySummary, SalarySummary } from '@/types/finance'
import type { FinancialOutlook } from '@/utils/dashboard'
import { formatCurrency } from '@/utils/format'

interface AnalyzeFinancialForecastInput {
  currency: string
  currentMonthKey: string
  currentMonthSummary: MonthlySummary
  budgetStatus: BudgetStatus
  debtSummary: DebtSummary
  financialOutlook: FinancialOutlook
  salarySummary: SalarySummary | null
  scenario: ForecastScenario
}

function roundToSingleDecimal(value: number) {
  return Math.round(value * 10) / 10
}

export function buildLocalFinancialForecast(
  input: AnalyzeFinancialForecastInput,
): FinancialForecastResult {
  const scenarioImpact =
    input.scenario.extraIncome
    - input.scenario.extraExpense
    - input.scenario.extraDebtPayment
    - input.scenario.savingsGoal

  const projectedClosingBalance = input.financialOutlook.estimatedAvailableBalance + scenarioImpact
  const projectedFreeCashFlow =
    input.currentMonthSummary.income
    - input.currentMonthSummary.expenses
    - input.financialOutlook.committedMoney
    + scenarioImpact
  const projectedSavings = Math.max(projectedClosingBalance, 0)
  const debtMonthsReduced =
    input.debtSummary.monthlyCommitted > 0 && input.scenario.extraDebtPayment > 0
      ? roundToSingleDecimal(input.scenario.extraDebtPayment / input.debtSummary.monthlyCommitted)
      : 0

  const highlights: string[] = []

  if (input.scenario.extraIncome > 0) {
    highlights.push(`El escenario suma ${formatCurrency(input.scenario.extraIncome, input.currency)} en ingresos adicionales.`)
  }

  if (input.scenario.extraExpense > 0) {
    highlights.push(`El escenario descuenta ${formatCurrency(input.scenario.extraExpense, input.currency)} por gastos extra.`)
  }

  if (input.scenario.extraDebtPayment > 0) {
    highlights.push(`Un abono extra a deuda de ${formatCurrency(input.scenario.extraDebtPayment, input.currency)} podria adelantarte ${debtMonthsReduced} meses aproximados de cuota.`)
  }

  if (input.scenario.savingsGoal > 0) {
    highlights.push(`Reservar ${formatCurrency(input.scenario.savingsGoal, input.currency)} para ahorro reduce tu liquidez disponible del cierre.`)
  }

  let riskLevel: FinancialForecastResult['riskLevel'] = 'low'
  let summary = 'Tu escenario proyectado sigue sano y con margen para cerrar el mes.'

  if (projectedClosingBalance < 0) {
    riskLevel = 'high'
    summary = 'Este escenario te dejaria con balance disponible negativo al cierre del mes.'
  } else if (
    projectedClosingBalance < input.financialOutlook.committedMoney * 0.25
    || input.budgetStatus.isOverLimit
  ) {
    riskLevel = 'medium'
    summary = 'El escenario sigue siendo posible, pero te deja con poco margen para imprevistos.'
  }

  if (highlights.length === 0) {
    highlights.push('No aplicaste cambios al escenario base. Esta proyeccion refleja el cierre esperado con la informacion actual.')
  }

  return {
    projectedClosingBalance,
    projectedFreeCashFlow,
    projectedSavings,
    debtMonthsReduced,
    riskLevel,
    summary,
    highlights,
    analysisSource: 'local',
  }
}

export async function analyzeFinancialForecast(
  input: AnalyzeFinancialForecastInput,
): Promise<FinancialForecastResult> {
  const localResult = buildLocalFinancialForecast(input)

  try {
    const response = await generateFinancialForecast({
      meta: createAiRequestMeta('forecasting'),
      payload: {
        monthKey: input.currentMonthKey,
        snapshot: {
          currentMonthSummary: input.currentMonthSummary,
          budgetStatus: input.budgetStatus,
          debtSummary: input.debtSummary,
          financialOutlook: input.financialOutlook,
          salarySummary: input.salarySummary,
        },
        scenario: input.scenario as unknown as Record<string, unknown>,
      },
    })

    if (!response.ok) {
      return localResult
    }

    return {
      ...localResult,
      summary: response.data.explanation || localResult.summary,
      riskLevel: response.data.riskLevel || localResult.riskLevel,
      projectedClosingBalance: response.data.projectedBalance ?? localResult.projectedClosingBalance,
      analysisSource: 'hybrid',
    }
  } catch (error) {
    if (error instanceof AiClientConfigurationError) {
      return localResult
    }

    return localResult
  }
}
