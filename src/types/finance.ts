export type TransactionType = 'income' | 'expense'
export type TransactionSource = 'manual' | 'recurring'
export type RecurringFrequency = 'once' | 'daily' | 'weekly' | 'monthly'
export type ThemeMode = 'light' | 'dark'
export type FilterType = TransactionType | 'all'
export type PersistenceMode = 'supabase' | 'local'
export type SyncPhase = 'loading' | 'ready' | 'saving' | 'error'

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
  monthlyBudget: MonthlyBudget
  theme: ThemeMode
  currency: string
}
