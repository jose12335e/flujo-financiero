export type TransactionType = 'income' | 'expense'
export type TransactionSource = 'manual' | 'recurring' | 'debt_payment' | 'salary_payment'
export type RecurringFrequency = 'once' | 'daily' | 'weekly' | 'monthly'
export type ThemeMode = 'light' | 'dark'
export type FilterType = TransactionType | 'all'
export type PersistenceMode = 'supabase' | 'local'
export type SyncPhase = 'loading' | 'ready' | 'saving' | 'error'
export type DebtType = 'loan' | 'credit_card' | 'mortgage' | 'vehicle' | 'service' | 'personal' | 'other'
export type DebtStatus = 'active' | 'paid' | 'paused' | 'defaulted'
export type DebtPriority = 'low' | 'medium' | 'high' | 'critical'
export type SalaryPayFrequency = 'monthly' | 'biweekly' | 'weekly'
export type SalaryDeductionType = 'fixed' | 'percentage'
export type SalaryDeductionFrequency = 'per_period' | 'monthly'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  categoryId: string
  description: string
  date: string
  createdAt: string
  updatedAt: string
  source?: TransactionSource
  recurringRuleId?: string | null
  scheduledFor?: string | null
  debtId?: string | null
}

export interface Category {
  id: string
  type: TransactionType
  label: string
  color: string
  icon: string
  isDefault: boolean
}

export interface MonthlyBudget {
  monthKey: string
  limit: number
  warningThreshold: number
}

export interface RecurringRule {
  id: string
  type: TransactionType
  amount: number
  categoryId: string
  description: string
  frequency: RecurringFrequency
  intervalValue: number
  startDate: string
  runTime: string
  endDate: string | null
  timezone: string
  isFixed: boolean
  isActive: boolean
  nextRunAt: string | null
  lastRunAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Debt {
  id: string
  name: string
  type: DebtType
  originalAmount: number
  pendingBalance: number
  monthlyPayment: number
  interestRate: number | null
  paymentDay: number
  startDate: string
  endDate: string | null
  status: DebtStatus
  priority: DebtPriority
  notes: string
  createdAt: string
  updatedAt: string
}

export interface DebtPayment {
  id: string
  debtId: string
  transactionId: string | null
  amount: number
  paymentDate: string
  principalAmount: number | null
  interestAmount: number | null
  notes: string
  createdAt: string
  updatedAt: string
}

export interface SalaryProfile {
  id: string
  grossSalary: number
  payFrequency: SalaryPayFrequency
  bonuses: number
  overtimePay: number
  otherIncome: number
  notes: string
  allowTransactionGeneration: boolean
  createdAt: string
  updatedAt: string
}

export interface SalaryDeduction {
  id: string
  name: string
  type: SalaryDeductionType
  value: number
  isActive: boolean
  isMandatory: boolean
  frequency: SalaryDeductionFrequency
  notes: string
  createdAt: string
  updatedAt: string
}

export interface DebtSummary {
  totalOriginal: number
  totalPending: number
  monthlyCommitted: number
  activeCount: number
}

export interface UpcomingDebtPayment {
  debtId: string
  debtName: string
  amount: number
  dueDate: string
  paymentDay: number
  priority: DebtPriority
  status: DebtStatus
}

export interface SalarySummary {
  grossPerPeriod: number
  grossMonthlyEstimate: number
  totalDeductionsPerPeriod: number
  totalDeductionsMonthly: number
  netPerPeriod: number
  netMonthlyEstimate: number
  activeDeductionsCount: number
}

export interface Filters {
  query: string
  type: FilterType
  categoryId: string | 'all'
  dateFrom: string
  dateTo: string
}

export interface FinanceState {
  transactions: Transaction[]
  recurringRules: RecurringRule[]
  debts: Debt[]
  debtPayments: DebtPayment[]
  salaryProfile: SalaryProfile | null
  salaryDeductions: SalaryDeduction[]
  categories: Category[]
  filters: Filters
  monthlyBudget: MonthlyBudget
  theme: ThemeMode
  currency: string
}

export interface TotalsSummary {
  income: number
  expenses: number
  balance: number
}

export interface MonthlySummary {
  monthKey: string
  income: number
  expenses: number
  balance: number
  transactionsCount: number
}

export interface CategorySummary {
  categoryId: string
  label: string
  color: string
  icon: string
  value: number
  percentage: number
}

export interface BudgetStatus {
  monthKey: string
  limit: number
  spent: number
  remaining: number
  progress: number
  warningThreshold: number
  isNearLimit: boolean
  isOverLimit: boolean
}

export interface MonthlySeriesPoint {
  monthKey: string
  label: string
  income: number
  expenses: number
  balance: number
}

export interface TransactionFormValues {
  type: TransactionType
  amount: number
  categoryId: string
  description: string
  date: string
}

export interface RecurringRuleFormValues {
  type: TransactionType
  amount: number
  categoryId: string
  description: string
  frequency: RecurringFrequency
  intervalValue: number
  startDate: string
  runTime: string
  endDate: string
  isFixed: boolean
  isActive: boolean
  timezone: string
}

export interface DebtFormValues {
  name: string
  type: DebtType
  originalAmount: number
  pendingBalance: number
  monthlyPayment: number
  interestRate: number | null
  paymentDay: number
  startDate: string
  endDate: string
  status: DebtStatus
  priority: DebtPriority
  notes: string
}

export interface DebtPaymentFormValues {
  amount: number
  paymentDate: string
  notes: string
}

export interface SalaryProfileFormValues {
  grossSalary: number
  payFrequency: SalaryPayFrequency
  bonuses: number
  overtimePay: number
  otherIncome: number
  notes: string
  allowTransactionGeneration: boolean
}

export interface SalaryDeductionFormValues {
  name: string
  type: SalaryDeductionType
  value: number
  isActive: boolean
  isMandatory: boolean
  frequency: SalaryDeductionFrequency
  notes: string
}

export interface SalaryPaymentFormValues {
  paymentDate: string
  description: string
}

export interface FinanceSyncState {
  mode: PersistenceMode
  phase: SyncPhase
  isConfigured: boolean
  isAuthenticated: boolean
  message: string
}

export interface RemoteFinanceSnapshot {
  transactions: Transaction[]
  recurringRules: RecurringRule[]
  debts: Debt[]
  debtPayments: DebtPayment[]
  salaryProfile: SalaryProfile | null
  salaryDeductions: SalaryDeduction[]
  monthlyBudget: MonthlyBudget
  theme: ThemeMode
  currency: string
}
