import { useMemo, useState } from 'react'
import { format, parse, subMonths } from 'date-fns'

import { answerFinancialChat } from '@/features/chat/services/answerFinancialChat'
import type {
  FinancialChatMessage,
  FinancialChatReply,
  FinancialChatSnapshot,
  FinancialChatState,
} from '@/features/chat/types/financialChat'
import { useFinanceStore } from '@/hooks/useFinanceStore'
import { calculateMonthlySummary } from '@/utils/finance'

function createMessage(
  role: FinancialChatMessage['role'],
  content: string,
  source?: FinancialChatMessage['source'],
  followUps?: string[],
): FinancialChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    source,
    followUps,
  }
}

function buildWelcomeMessage(): FinancialChatMessage {
  return createMessage(
    'assistant',
    'Puedo ayudarte a leer tus finanzas actuales. Preguntame por gasto del mes, presupuesto, deudas, sueldo neto o comparaciones entre meses.',
    'local',
    ['En que gaste mas este mes', 'Cuanto me queda libre', 'Comparame este mes con el pasado'],
  )
}

function buildReplyMessage(reply: FinancialChatReply): FinancialChatMessage {
  return createMessage('assistant', reply.answer, reply.analysisSource, reply.followUps)
}

export function useFinancialChat() {
  const { selectors, state } = useFinanceStore()
  const initialMessages = useMemo(() => [buildWelcomeMessage()], [])
  const [chatState, setChatState] = useState<FinancialChatState>({
    status: 'idle',
    messages: initialMessages,
  })

  const snapshot = useMemo<FinancialChatSnapshot>(() => {
    const previousMonthKey = format(subMonths(parse(selectors.currentMonthKey, 'yyyy-MM', new Date()), 1), 'yyyy-MM')
    const previousMonthSummary = calculateMonthlySummary(state.transactions, previousMonthKey)

    return {
      currency: state.currency,
      currentMonthKey: selectors.currentMonthKey,
      currentMonthSummary: selectors.currentMonthSummary,
      previousMonthSummary,
      totals: selectors.totals,
      budgetStatus: selectors.budgetStatus,
      debtSummary: selectors.debtSummary,
      salarySummary: selectors.salarySummary
        ? {
            netMonthlyEstimate: selectors.salarySummary.netMonthlyEstimate,
            netPerPeriod: selectors.salarySummary.netPerPeriod,
          }
        : null,
      financialOutlook: {
        committedMoney: selectors.financialOutlook.committedMoney,
        estimatedAvailableBalance: selectors.financialOutlook.estimatedAvailableBalance,
        estimatedNetSalary: selectors.financialOutlook.estimatedNetSalary,
      },
      topExpenseCategories: selectors.currentMonthExpenseSummary.slice(0, 3).map((category) => ({
        label: category.label,
        value: category.value,
        percentage: category.percentage,
      })),
    }
  }, [
    selectors.budgetStatus,
    selectors.currentMonthExpenseSummary,
    selectors.currentMonthKey,
    selectors.currentMonthSummary,
    selectors.debtSummary,
    selectors.financialOutlook,
    selectors.salarySummary,
    selectors.totals,
    state.currency,
    state.transactions,
  ])

  const actions = {
    reset: () => {
      setChatState({
        status: 'idle',
        messages: [buildWelcomeMessage()],
      })
    },
    sendMessage: async (question: string) => {
      const trimmedQuestion = question.trim()

      if (!trimmedQuestion) {
        return
      }

      const userMessage = createMessage('user', trimmedQuestion)
      const processingMessages = [...chatState.messages, userMessage]

      setChatState({
        status: 'processing',
        messages: processingMessages,
      })

      try {
        const reply = await answerFinancialChat(trimmedQuestion, snapshot)

        setChatState({
          status: 'ready',
          messages: [...processingMessages, buildReplyMessage(reply)],
        })
      } catch {
        setChatState({
          status: 'error',
          messages: [
            ...processingMessages,
            createMessage(
              'assistant',
              'No pude procesar tu consulta ahora mismo. Puedes intentarlo otra vez en unos segundos.',
              'local',
            ),
          ],
          message: 'No se pudo procesar la consulta.',
        })
      }
    },
  }

  return {
    state: chatState,
    actions,
    selectors: {
      suggestedQuestions:
        chatState.messages[chatState.messages.length - 1]?.followUps ?? [
          'En que gaste mas este mes',
          'Cuanto me queda libre',
          'Comparame este mes con el pasado',
        ],
    },
  }
}
