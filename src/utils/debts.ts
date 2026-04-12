import { addMonths, format, isBefore, setDate, startOfDay } from 'date-fns'

import type { Debt, DebtPayment, DebtPaymentFormValues, DebtSummary, Transaction, UpcomingDebtPayment } from '@/types/finance'

export const DEBT_PAYMENT_CATEGORY_ID = 'debt-payment'

export function calculateDebtSummary(debts: Debt[]): DebtSummary {
  const activeDebts = debts.filter((debt) => debt.status === 'active')

  return activeDebts.reduce<DebtSummary>(
    (summary, debt) => {
      summary.totalOriginal += debt.originalAmount
      summary.totalPending += debt.pendingBalance
      summary.monthlyCommitted += debt.monthlyPayment
      summary.activeCount += 1
      return summary
    },
    {
      totalOriginal: 0,
      totalPending: 0,
      monthlyCommitted: 0,
      activeCount: 0,
    },
  )
}

export function sortDebts(debts: Debt[]) {
  const priorityWeight = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  } as const

  return [...debts].sort((left, right) => {
    const statusDelta = Number(left.status !== 'active') - Number(right.status !== 'active')

    if (statusDelta !== 0) {
      return statusDelta
    }

    const priorityDelta = priorityWeight[left.priority] - priorityWeight[right.priority]

    if (priorityDelta !== 0) {
      return priorityDelta
    }

    if (left.paymentDay !== right.paymentDay) {
      return left.paymentDay - right.paymentDay
    }

    return left.name.localeCompare(right.name)
  })
}

export function getUpcomingDebtPayments(debts: Debt[], referenceDate = new Date(), limit = 4): UpcomingDebtPayment[] {
  return sortDebts(debts)
    .filter((debt) => debt.status === 'active' && debt.pendingBalance > 0)
    .map((debt) => {
      const dueDate = getNextDebtDueDate(debt, referenceDate)

      return {
        debtId: debt.id,
        debtName: debt.name,
        amount: Math.min(debt.monthlyPayment, debt.pendingBalance),
        dueDate,
        paymentDay: debt.paymentDay,
        priority: debt.priority,
        status: debt.status,
      }
    })
    .sort((left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime())
    .slice(0, limit)
}

export function getNextDebtDueDate(debt: Debt, referenceDate = new Date()) {
  const safeDay = Math.max(1, Math.min(debt.paymentDay, 28))
  const cycleStart = startOfDay(referenceDate)
  let dueDate = setDate(cycleStart, safeDay)

  if (isBefore(dueDate, cycleStart)) {
    dueDate = setDate(addMonths(cycleStart, 1), safeDay)
  }

  return format(dueDate, 'yyyy-MM-dd')
}

export function createDebtPaymentMutation(
  debt: Debt,
  values: DebtPaymentFormValues,
  timestamp: string,
): {
  updatedDebt: Debt
  transaction: Transaction
  debtPayment: DebtPayment
} {
  const normalizedAmount = Math.min(Math.max(values.amount, 0), debt.pendingBalance)
  const nextPendingBalance = Math.max(0, Number((debt.pendingBalance - normalizedAmount).toFixed(2)))
  const updatedDebt: Debt = {
    ...debt,
    pendingBalance: nextPendingBalance,
    status: nextPendingBalance === 0 ? 'paid' : debt.status,
    updatedAt: timestamp,
  }

  const transactionId = crypto.randomUUID()
  const debtPaymentId = crypto.randomUUID()

  return {
    updatedDebt,
    transaction: {
      id: transactionId,
      type: 'expense',
      amount: normalizedAmount,
      categoryId: DEBT_PAYMENT_CATEGORY_ID,
      description: values.notes.trim() || `Pago aplicado a ${debt.name}`,
      date: values.paymentDate,
      createdAt: timestamp,
      updatedAt: timestamp,
      source: 'debt_payment',
      recurringRuleId: null,
      scheduledFor: null,
      debtId: debt.id,
    },
    debtPayment: {
      id: debtPaymentId,
      debtId: debt.id,
      transactionId,
      amount: normalizedAmount,
      paymentDate: values.paymentDate,
      principalAmount: normalizedAmount,
      interestAmount: null,
      notes: values.notes.trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  }
}
