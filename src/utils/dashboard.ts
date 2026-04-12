import type { DebtSummary, RecurringRule, SalarySummary, UpcomingDebtPayment } from '@/types/finance'

export interface UpcomingPaymentItem {
  id: string
  title: string
  amount: number
  dueDate: string
  source: 'debt' | 'recurring'
  subtitle: string
}

export interface FinancialOutlook {
  monthlyIncome: number
  committedMoney: number
  pendingDebt: number
  estimatedNetSalary: number | null
  estimatedAvailableBalance: number
}

export function calculateFinancialOutlook(input: {
  currentMonthIncome: number
  currentBalance: number
  recurringRules: RecurringRule[]
  debtSummary: DebtSummary
  salarySummary: SalarySummary | null
}): FinancialOutlook {
  const fixedRecurringExpenses = input.recurringRules
    .filter((rule) => rule.isActive && rule.isFixed && rule.type === 'expense')
    .reduce((sum, rule) => sum + rule.amount, 0)

  const committedMoney = fixedRecurringExpenses + input.debtSummary.monthlyCommitted
  const estimatedNetSalary = input.salarySummary?.netMonthlyEstimate ?? null
  const estimatedAvailableBalance = input.currentBalance + (estimatedNetSalary ?? 0) - committedMoney

  return {
    monthlyIncome: input.currentMonthIncome,
    committedMoney,
    pendingDebt: input.debtSummary.totalPending,
    estimatedNetSalary,
    estimatedAvailableBalance,
  }
}

export function buildUpcomingPayments(
  upcomingDebtPayments: UpcomingDebtPayment[],
  recurringRules: RecurringRule[],
  limit = 5,
): UpcomingPaymentItem[] {
  const debtItems: UpcomingPaymentItem[] = upcomingDebtPayments.map((payment) => ({
    id: `debt-${payment.debtId}`,
    title: payment.debtName,
    amount: payment.amount,
    dueDate: payment.dueDate,
    source: 'debt',
    subtitle: `Pago de deuda · dia ${payment.paymentDay}`,
  }))

  const recurringItems: UpcomingPaymentItem[] = recurringRules
    .filter((rule) => rule.type === 'expense' && rule.nextRunAt)
    .map((rule) => ({
      id: `recurring-${rule.id}`,
      title: rule.description,
      amount: rule.amount,
      dueDate: rule.nextRunAt ?? '',
      source: 'recurring',
      subtitle: rule.isFixed ? 'Gasto fijo programado' : 'Gasto programado',
    }))

  return [...debtItems, ...recurringItems]
    .sort((left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime())
    .slice(0, limit)
}
