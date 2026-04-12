import { useFinanceDispatchContext, useFinanceStateContext, useFinanceSyncContext } from '@/app/providers/FinanceProvider'
import { buildUpcomingPayments, calculateFinancialOutlook } from '@/utils/dashboard'
import { calculateDebtSummary, createDebtPaymentMutation, getUpcomingDebtPayments, sortDebts } from '@/utils/debts'
import { calculateSalarySummary, createSalaryPaymentTransaction } from '@/utils/salary'
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
import type {
  Debt,
  DebtPayment,
  DebtPaymentFormValues,
  Filters,
  MonthlyBudget,
  RecurringRule,
  SalaryDeduction,
  SalaryPaymentFormValues,
  SalaryProfile,
  ThemeMode,
  Transaction,
} from '@/types/finance'

export function useFinanceStore() {
  const state = useFinanceStateContext()
  const dispatch = useFinanceDispatchContext()
  const { refreshRemoteData, retrySync, syncState } = useFinanceSyncContext()
  const currentMonthKey = getCurrentMonthKey()
  const sortedTransactions = sortTransactionsByDate(state.transactions)
  const filteredTransactions = filterTransactions(sortedTransactions, state.filters, state.categories)
  const debtSummary = calculateDebtSummary(state.debts)
  const upcomingDebtPayments = getUpcomingDebtPayments(state.debts)
  const salarySummary = calculateSalarySummary(state.salaryProfile, state.salaryDeductions)
  const currentMonthSummary = calculateMonthlySummary(state.transactions, currentMonthKey)

  const actions = {
    addTransaction: (transaction: Transaction) => dispatch({ type: 'ADD_TRANSACTION', payload: transaction }),
    updateTransaction: (transaction: Transaction) => dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction }),
    deleteTransaction: (transactionId: string) => dispatch({ type: 'DELETE_TRANSACTION', payload: transactionId }),
    addRecurringRule: (rule: RecurringRule) => dispatch({ type: 'ADD_RECURRING_RULE', payload: rule }),
    updateRecurringRule: (rule: RecurringRule) => dispatch({ type: 'UPDATE_RECURRING_RULE', payload: rule }),
    deleteRecurringRule: (ruleId: string) => dispatch({ type: 'DELETE_RECURRING_RULE', payload: ruleId }),
    addDebt: (debt: Debt) => dispatch({ type: 'ADD_DEBT', payload: debt }),
    updateDebt: (debt: Debt) => dispatch({ type: 'UPDATE_DEBT', payload: debt }),
    deleteDebt: (debtId: string) => dispatch({ type: 'DELETE_DEBT', payload: debtId }),
    addDebtPayment: (payment: DebtPayment) => dispatch({ type: 'ADD_DEBT_PAYMENT', payload: payment }),
    updateDebtPayment: (payment: DebtPayment) => dispatch({ type: 'UPDATE_DEBT_PAYMENT', payload: payment }),
    deleteDebtPayment: (paymentId: string) => dispatch({ type: 'DELETE_DEBT_PAYMENT', payload: paymentId }),
    recordDebtPayment: (debtId: string, values: DebtPaymentFormValues) => {
      const debt = state.debts.find((item) => item.id === debtId)

      if (!debt) {
        return
      }

      const mutation = createDebtPaymentMutation(debt, values, new Date().toISOString())
      dispatch({ type: 'UPDATE_DEBT', payload: mutation.updatedDebt })
      dispatch({ type: 'ADD_TRANSACTION', payload: mutation.transaction })
      dispatch({ type: 'ADD_DEBT_PAYMENT', payload: mutation.debtPayment })
    },
    setSalaryProfile: (profile: SalaryProfile | null) => dispatch({ type: 'SET_SALARY_PROFILE', payload: profile }),
    addSalaryDeduction: (deduction: SalaryDeduction) => dispatch({ type: 'ADD_SALARY_DEDUCTION', payload: deduction }),
    updateSalaryDeduction: (deduction: SalaryDeduction) => dispatch({ type: 'UPDATE_SALARY_DEDUCTION', payload: deduction }),
    deleteSalaryDeduction: (deductionId: string) => dispatch({ type: 'DELETE_SALARY_DEDUCTION', payload: deductionId }),
    recordSalaryPayment: (values: SalaryPaymentFormValues) => {
      if (!state.salaryProfile) {
        return
      }

      const transaction = createSalaryPaymentTransaction(state.salaryProfile, state.salaryDeductions, values, new Date().toISOString())
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction })
    },
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
      currentMonthSummary,
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
      debts: sortDebts(state.debts),
      debtPayments: [...state.debtPayments].sort((left, right) => {
        const paymentDateDelta = new Date(right.paymentDate).getTime() - new Date(left.paymentDate).getTime()

        if (paymentDateDelta !== 0) {
          return paymentDateDelta
        }

        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      }),
      debtSummary,
      upcomingDebtPayments,
      salaryProfile: state.salaryProfile,
      salaryDeductions: [...state.salaryDeductions].sort((left, right) => {
        if (left.isActive !== right.isActive) {
          return Number(right.isActive) - Number(left.isActive)
        }

        if (left.isMandatory !== right.isMandatory) {
          return Number(right.isMandatory) - Number(left.isMandatory)
        }

        return left.name.localeCompare(right.name)
      }),
      salarySummary,
      financialOutlook: calculateFinancialOutlook({
        currentMonthIncome: currentMonthSummary.income,
        currentBalance: calculateTotals(state.transactions).balance,
        recurringRules: state.recurringRules,
        debtSummary,
        salarySummary,
      }),
      upcomingPayments: buildUpcomingPayments(upcomingDebtPayments, getUpcomingRecurringRules(state.recurringRules)),
    },
    helpers: {
      getTransactionById: (transactionId: string) =>
        state.transactions.find((transaction) => transaction.id === transactionId),
      getRecurringRuleById: (ruleId: string) => state.recurringRules.find((rule) => rule.id === ruleId),
      getDebtById: (debtId: string) => state.debts.find((debt) => debt.id === debtId),
    },
  }
}
