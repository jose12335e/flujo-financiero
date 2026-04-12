import { getCurrentMonthKey } from '@/utils/finance'
import type { FinanceState, RemoteFinanceSnapshot } from '@/types/finance'

export function createRemoteSnapshot(state: FinanceState): RemoteFinanceSnapshot {
  return {
    transactions: state.transactions.map((transaction) => ({ ...transaction })),
    recurringRules: state.recurringRules.map((rule) => ({ ...rule })),
    debts: state.debts.map((debt) => ({ ...debt })),
    debtPayments: state.debtPayments.map((payment) => ({ ...payment })),
    salaryProfile: state.salaryProfile ? { ...state.salaryProfile } : null,
    salaryDeductions: state.salaryDeductions.map((deduction) => ({ ...deduction })),
    monthlyBudget: {
      ...state.monthlyBudget,
      monthKey: getCurrentMonthKey(),
    },
    theme: state.theme,
    currency: state.currency,
  }
}

export function areRemoteSnapshotsEqual(left: RemoteFinanceSnapshot | null, right: RemoteFinanceSnapshot) {
  if (!left) {
    return false
  }

  return JSON.stringify(left) === JSON.stringify(right)
}
