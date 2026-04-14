import { format, parse, subMonths } from 'date-fns'

import { createAiRequestMeta } from '@/features/ai/helpers/createAiRequestMeta'
import { AiClientConfigurationError } from '@/features/ai/services/aiClient'
import { sendFinancialChatMessage } from '@/features/ai/services/aiChat'
import type { FinancialChatReply, FinancialChatSnapshot } from '@/features/chat/types/financialChat'
import { formatCurrency, formatMonthLabel, formatPercentage } from '@/utils/format'

function normalizeQuestion(question: string) {
  return question
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function buildTopExpenseAnswer(snapshot: FinancialChatSnapshot): FinancialChatReply {
  const topCategory = snapshot.topExpenseCategories[0]

  if (!topCategory) {
    return {
      answer:
        'Todavia no hay suficiente gasto registrado este mes para decirte en que categoria gastaste mas. En cuanto agregues mas movimientos, podre compararlos mejor.',
      followUps: ['Cuanto me queda libre', 'Como va mi presupuesto'],
      analysisSource: 'local',
    }
  }

  return {
    answer: `En ${formatMonthLabel(snapshot.currentMonthKey)}, tu categoria con mayor gasto es ${topCategory.label}, con ${formatCurrency(topCategory.value, snapshot.currency)}. Eso representa ${formatPercentage(topCategory.percentage)} del gasto del mes.`,
    followUps: ['Como va mi presupuesto', 'Comparame este mes con el pasado'],
    analysisSource: 'local',
  }
}

function buildAvailableBalanceAnswer(snapshot: FinancialChatSnapshot): FinancialChatReply {
  const available = snapshot.financialOutlook.estimatedAvailableBalance

  return {
    answer:
      available >= 0
        ? `Tu balance disponible estimado es ${formatCurrency(available, snapshot.currency)}. Ese calculo considera tu balance actual y los compromisos del mes que ya tenemos identificados.`
        : `Tu balance disponible estimado es ${formatCurrency(available, snapshot.currency)}. Eso sugiere que, si mantienes el ritmo actual, te conviene recortar gasto variable o mover algun pago no urgente.`,
    followUps: ['Que me recomiendas este mes', 'Cuanto debo actualmente'],
    analysisSource: 'local',
  }
}

function buildComparisonAnswer(snapshot: FinancialChatSnapshot): FinancialChatReply {
  const previousMonthKey = format(subMonths(parse(snapshot.currentMonthKey, 'yyyy-MM', new Date()), 1), 'yyyy-MM')
  const expenseDelta = snapshot.currentMonthSummary.expenses - snapshot.previousMonthSummary.expenses
  const incomeDelta = snapshot.currentMonthSummary.income - snapshot.previousMonthSummary.income

  return {
    answer: `Frente a ${formatMonthLabel(previousMonthKey)}, este mes registras ${formatCurrency(snapshot.currentMonthSummary.income, snapshot.currency)} en ingresos y ${formatCurrency(snapshot.currentMonthSummary.expenses, snapshot.currency)} en gastos. La variacion es de ${formatCurrency(incomeDelta, snapshot.currency)} en ingresos y ${formatCurrency(expenseDelta, snapshot.currency)} en gastos.`,
    followUps: ['En que gaste mas este mes', 'Como va mi presupuesto'],
    analysisSource: 'local',
  }
}

function buildDebtAnswer(snapshot: FinancialChatSnapshot): FinancialChatReply {
  if (snapshot.debtSummary.activeCount === 0) {
    return {
      answer: 'Ahora mismo no tienes deudas activas registradas, asi que no veo saldo pendiente ni cuotas comprometidas en esta seccion.',
      followUps: ['Cuanto me queda libre', 'Como va mi presupuesto'],
      analysisSource: 'local',
    }
  }

  return {
    answer: `Tienes ${snapshot.debtSummary.activeCount} deudas activas con un saldo pendiente total de ${formatCurrency(snapshot.debtSummary.totalPending, snapshot.currency)}. La cuota mensual comprometida actualmente es ${formatCurrency(snapshot.debtSummary.monthlyCommitted, snapshot.currency)}.`,
    followUps: ['Que me recomiendas este mes', 'Cuanto me queda libre'],
    analysisSource: 'local',
  }
}

function buildSalaryAnswer(snapshot: FinancialChatSnapshot): FinancialChatReply {
  if (!snapshot.salarySummary) {
    return {
      answer:
        'Todavia no tienes un perfil salarial configurado. Si lo completas, podre usar tu sueldo neto estimado para responder con mas precision.',
      followUps: ['Cuanto me queda libre', 'Como va mi presupuesto'],
      analysisSource: 'local',
    }
  }

  return {
    answer: `Tu sueldo neto estimado es ${formatCurrency(snapshot.salarySummary.netMonthlyEstimate, snapshot.currency)} al mes y ${formatCurrency(snapshot.salarySummary.netPerPeriod, snapshot.currency)} por periodo.`,
    followUps: ['Cuanto me queda libre', 'Que me recomiendas este mes'],
    analysisSource: 'local',
  }
}

function buildBudgetAnswer(snapshot: FinancialChatSnapshot): FinancialChatReply {
  if (snapshot.budgetStatus.limit <= 0) {
    return {
      answer:
        'No tienes un presupuesto mensual util para comparar en este momento. Puedes configurarlo y asi te ayudare a vigilar mejor tu gasto.',
      followUps: ['En que gaste mas este mes', 'Cuanto me queda libre'],
      analysisSource: 'local',
    }
  }

  const statusText = snapshot.budgetStatus.isOverLimit
    ? 'Ya superaste tu presupuesto.'
    : snapshot.budgetStatus.isNearLimit
      ? 'Estas cerca del limite presupuestario.'
      : 'Tu presupuesto sigue bajo control.'

  return {
    answer: `${statusText} Llevas ${formatCurrency(snapshot.budgetStatus.spent, snapshot.currency)} gastados de un limite de ${formatCurrency(snapshot.budgetStatus.limit, snapshot.currency)} y te quedan ${formatCurrency(snapshot.budgetStatus.remaining, snapshot.currency)} disponibles en el presupuesto.`,
    followUps: ['Que me recomiendas este mes', 'Comparame este mes con el pasado'],
    analysisSource: 'local',
  }
}

function buildGenericAnswer(snapshot: FinancialChatSnapshot): FinancialChatReply {
  return {
    answer: `Este mes llevas ${formatCurrency(snapshot.currentMonthSummary.income, snapshot.currency)} en ingresos, ${formatCurrency(snapshot.currentMonthSummary.expenses, snapshot.currency)} en gastos y un balance acumulado de ${formatCurrency(snapshot.totals.balance, snapshot.currency)}. Si quieres, puedo enfocarme en presupuesto, deudas, sueldo neto o comparacion mensual.`,
    followUps: ['En que gaste mas este mes', 'Cuanto me queda libre', 'Comparame este mes con el pasado'],
    analysisSource: 'local',
  }
}

export function buildLocalFinancialChatReply(
  question: string,
  snapshot: FinancialChatSnapshot,
): FinancialChatReply {
  const normalizedQuestion = normalizeQuestion(question)

  if (
    normalizedQuestion.includes('gaste mas')
    || normalizedQuestion.includes('gasto mas')
    || normalizedQuestion.includes('en que gaste')
    || normalizedQuestion.includes('en que gasto')
    || normalizedQuestion.includes('categoria')
  ) {
    return buildTopExpenseAnswer(snapshot)
  }

  if (
    normalizedQuestion.includes('me queda libre')
    || normalizedQuestion.includes('cuanto me queda')
    || normalizedQuestion.includes('disponible')
    || normalizedQuestion.includes('liquidez')
  ) {
    return buildAvailableBalanceAnswer(snapshot)
  }

  if (
    normalizedQuestion.includes('compar')
    || normalizedQuestion.includes('mes pasado')
    || normalizedQuestion.includes('mes anterior')
  ) {
    return buildComparisonAnswer(snapshot)
  }

  if (normalizedQuestion.includes('deuda') || normalizedQuestion.includes('tarjeta')) {
    return buildDebtAnswer(snapshot)
  }

  if (
    normalizedQuestion.includes('sueldo')
    || normalizedQuestion.includes('salario')
    || normalizedQuestion.includes('neto')
  ) {
    return buildSalaryAnswer(snapshot)
  }

  if (normalizedQuestion.includes('presupuesto')) {
    return buildBudgetAnswer(snapshot)
  }

  return buildGenericAnswer(snapshot)
}

export async function answerFinancialChat(
  question: string,
  snapshot: FinancialChatSnapshot,
): Promise<FinancialChatReply> {
  const localReply = buildLocalFinancialChatReply(question, snapshot)

  try {
    const response = await sendFinancialChatMessage({
      meta: createAiRequestMeta('chat'),
      payload: {
        question,
        contextSnapshot: snapshot as unknown as Record<string, unknown>,
      },
    })

    if (!response.ok) {
      return localReply
    }

    return {
      answer: response.data.answer || localReply.answer,
      followUps: response.data.followUps?.length ? response.data.followUps : localReply.followUps,
      analysisSource: 'hybrid',
    }
  } catch (error) {
    if (error instanceof AiClientConfigurationError) {
      return localReply
    }

    return localReply
  }
}
