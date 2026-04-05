import { useFinanceDispatchContext, useFinanceStateContext, useFinanceSyncContext } from '@/app/providers/FinanceProvider'
import {
  calculateBudgetStatus,
  calculateCategorySummary,
  calculateMonthlySeries,
  calculateMonthlySummary,
  calculateTotals,
  filterTransactions,
  getAvailableMonthKeys,
  getCurrentMonthKey,
  getRecentTransactions,
  sortTransactionsByDate,
} from '@/utils/finance'
import { countActiveAutomaticRules, countActiveFixedExpenseRules, getUpcomingRecurringRules } from '@/utils/recurring'
import type { Filters, MonthlyBudget, RecurringRule, ThemeMode, Transaction } from '@/types/finance'

export function useFinanceStore() {
  const state = useFinanceStateContext()
  const dispatch = useFinanceDispatchContext()
  const { refreshRemoteData, retrySync, syncState } = useFinanceSyncContext()
  const currentMonthKey = getCurrentMonthKey()
  const sortedTransactions = sortTransactionsByDate(state.transactions)
  const filteredTransactions = filterTransactions(sortedTransactions, state.filters, state.categories)

  const actions = {
    addTransaction: (transaction: Transaction) => dispatch({ type: 'ADD_TRANSACTION', payload: transaction }),
    updateTransaction: (transaction: Transaction) => dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction }),
    deleteTransaction: (transactionId: string) => dispatch({ type: 'DELETE_TRANSACTION', payload: transactionId }),
    addRecurringRule: (rule: RecurringRule) => dispatch({ type: 'ADD_RECURRING_RULE', payload: rule }),
    updateRecurringRule: (rule: RecurringRule) => dispatch({ type: 'UPDATE_RECURRING_RULE', payload: rule }),
    deleteRecurringRule: (ruleId: string) => dispatch({ type: 'DELETE_RECURRING_RULE', payload: ruleId }),
    setFilters: (filters: Partial<Filters>) => dispatch({ type: 'SET_FILTERS', payload: filters }),
    resetFilters: () => dispatch({ type: 'RESET_FILTERS' }),
    setTheme: (theme: ThemeMode) => dispatch({ type: 'SET_THEME', payload: theme }),
    setCurrency: (currency: string) => dispatch({ type: 'SET_CURRENCY', payload: currency }),
    setMonthlyBudget: (budget: MonthlyBudget) => dispatch({ type: 'SET_MONTHLY_BUDGET', payload: budget }),
    resetFinanceData: () => dispatch({ type: 'RESET_FINANCE_DATA' }),
    retrySync,
    refreshRemoteData,
  }

  return {
    state,
    actions,
    meta: {
      syncState,
    },
    selectors: {
      currentMonthKey,
      sortedTransactions,
      filteredTransactions,
      totals: calculateTotals(state.transactions),
      currentMonthSummary: calculateMonthlySummary(state.transactions, currentMonthKey),
      currentMonthExpenseSummary: calculateCategorySummary(state.transactions, state.categories, {
        monthKey: currentMonthKey,
        type: 'expense',
      }),
      budgetStatus: calculateBudgetStatus(state.transactions, state.monthlyBudget, currentMonthKey),
      recentTransactions: getRecentTransactions(state.transactions),
      monthlySeries: calculateMonthlySeries(state.transactions),
      availableMonthKeys: getAvailableMonthKeys(state.transactions),
      upcomingRecurringRules: getUpcomingRecurringRules(state.recurringRules),
      activeAutomaticRulesCount: countActiveAutomaticRules(state.recurringRules),
      activeFixedExpenseRulesCount: countActiveFixedExpenseRules(state.recurringRules),
    },
    helpers: {
      getTransactionById: (transactionId: string) =>
        state.transactions.find((transaction) => transaction.id === transactionId),
      getRecurringRuleById: (ruleId: string) => state.recurringRules.find((rule) => rule.id === ruleId),
    },
  }
}
