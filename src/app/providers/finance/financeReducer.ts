import type {
  Debt,
  DebtPayment,
  Filters,
  FinanceState,
  MonthlyBudget,
  RecurringRule,
  SalaryDeduction,
  SalaryProfile,
  ThemeMode,
  Transaction,
} from '@/types/finance'
import { createDefaultBudget, createInitialFinanceState, createInitialFilters } from '@/utils/finance'

export type FinanceAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_RECURRING_RULE'; payload: RecurringRule }
  | { type: 'UPDATE_RECURRING_RULE'; payload: RecurringRule }
  | { type: 'DELETE_RECURRING_RULE'; payload: string }
  | { type: 'ADD_DEBT'; payload: Debt }
  | { type: 'UPDATE_DEBT'; payload: Debt }
  | { type: 'DELETE_DEBT'; payload: string }
  | { type: 'ADD_DEBT_PAYMENT'; payload: DebtPayment }
  | { type: 'UPDATE_DEBT_PAYMENT'; payload: DebtPayment }
  | { type: 'DELETE_DEBT_PAYMENT'; payload: string }
  | { type: 'SET_SALARY_PROFILE'; payload: SalaryProfile | null }
  | { type: 'ADD_SALARY_DEDUCTION'; payload: SalaryDeduction }
  | { type: 'UPDATE_SALARY_DEDUCTION'; payload: SalaryDeduction }
  | { type: 'DELETE_SALARY_DEDUCTION'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<Filters> }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_THEME'; payload: ThemeMode }
  | { type: 'SET_CURRENCY'; payload: string }
  | { type: 'SET_MONTHLY_BUDGET'; payload: MonthlyBudget }
  | { type: 'HYDRATE_STATE'; payload: FinanceState }
  | { type: 'RESET_FINANCE_DATA' }

export function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case 'HYDRATE_STATE':
      return action.payload
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
      }
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.payload.id ? action.payload : transaction,
        ),
      }
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((transaction) => transaction.id !== action.payload),
        debtPayments: state.debtPayments.map((payment) =>
          payment.transactionId === action.payload ? { ...payment, transactionId: null } : payment,
        ),
      }
    case 'ADD_RECURRING_RULE':
      return {
        ...state,
        recurringRules: [...state.recurringRules, action.payload],
      }
    case 'UPDATE_RECURRING_RULE':
      return {
        ...state,
        recurringRules: state.recurringRules.map((rule) => (rule.id === action.payload.id ? action.payload : rule)),
      }
    case 'DELETE_RECURRING_RULE':
      return {
        ...state,
        recurringRules: state.recurringRules.filter((rule) => rule.id !== action.payload),
      }
    case 'ADD_DEBT':
      return {
        ...state,
        debts: [...state.debts, action.payload],
      }
    case 'UPDATE_DEBT':
      return {
        ...state,
        debts: state.debts.map((debt) => (debt.id === action.payload.id ? action.payload : debt)),
      }
    case 'DELETE_DEBT':
      return {
        ...state,
        debts: state.debts.filter((debt) => debt.id !== action.payload),
        debtPayments: state.debtPayments.filter((payment) => payment.debtId !== action.payload),
        transactions: state.transactions.map((transaction) =>
          transaction.debtId === action.payload ? { ...transaction, debtId: null } : transaction,
        ),
      }
    case 'ADD_DEBT_PAYMENT':
      return {
        ...state,
        debtPayments: [...state.debtPayments, action.payload],
      }
    case 'UPDATE_DEBT_PAYMENT':
      return {
        ...state,
        debtPayments: state.debtPayments.map((payment) => (payment.id === action.payload.id ? action.payload : payment)),
      }
    case 'DELETE_DEBT_PAYMENT':
      return {
        ...state,
        debtPayments: state.debtPayments.filter((payment) => payment.id !== action.payload),
      }
    case 'SET_SALARY_PROFILE':
      return {
        ...state,
        salaryProfile: action.payload,
      }
    case 'ADD_SALARY_DEDUCTION':
      return {
        ...state,
        salaryDeductions: [...state.salaryDeductions, action.payload],
      }
    case 'UPDATE_SALARY_DEDUCTION':
      return {
        ...state,
        salaryDeductions: state.salaryDeductions.map((deduction) =>
          deduction.id === action.payload.id ? action.payload : deduction,
        ),
      }
    case 'DELETE_SALARY_DEDUCTION':
      return {
        ...state,
        salaryDeductions: state.salaryDeductions.filter((deduction) => deduction.id !== action.payload),
      }
    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      }
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: createInitialFilters(),
      }
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      }
    case 'SET_CURRENCY':
      return {
        ...state,
        currency: action.payload,
      }
    case 'SET_MONTHLY_BUDGET':
      return {
        ...state,
        monthlyBudget: action.payload,
      }
    case 'RESET_FINANCE_DATA':
      return {
        ...createInitialFinanceState(),
        theme: state.theme,
        currency: state.currency,
        monthlyBudget: {
          ...createDefaultBudget(),
          limit: state.monthlyBudget.limit,
          warningThreshold: state.monthlyBudget.warningThreshold,
        },
      }
    default:
      return state
  }
}
