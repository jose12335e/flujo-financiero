import {
  endOfMonth,
  endOfDay,
  format,
  isAfter,
  isBefore,
  isValid,
  parse,
  parseISO,
  startOfDay,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'

import { defaultCategories } from '@/data/categories'
import { DEFAULT_MONTHLY_BUDGET_LIMIT, DEFAULT_WARNING_THRESHOLD, RECENT_TRANSACTIONS_LIMIT } from '@/utils/constants'
import { detectBrowserTimeZone } from '@/utils/recurring'
import type {
  BudgetStatus,
  Category,
  CategorySummary,
  Filters,
  FinanceState,
  MonthlyBudget,
  MonthlySeriesPoint,
  MonthlySummary,
  TotalsSummary,
  Transaction,
  TransactionType,
} from '@/types/finance'

const localeCurrencyMap: Array<[string, string]> = [
  ['bo', 'BOB'],
  ['mx', 'MXN'],
  ['ar', 'ARS'],
  ['co', 'COP'],
  ['pe', 'PEN'],
  ['cl', 'CLP'],
  ['es', 'EUR'],
  ['fr', 'EUR'],
  ['de', 'EUR'],
  ['gb', 'GBP'],
]

export function getCurrentMonthKey(referenceDate = new Date()) {
  return format(referenceDate, 'yyyy-MM')
}

export function detectDefaultCurrency() {
  if (typeof navigator === 'undefined') {
    return 'USD'
  }

  const locale = navigator.language.toLowerCase()
  const match = localeCurrencyMap.find(([token]) => locale.includes(token))
  return match?.[1] ?? 'USD'
}

export function createInitialFilters(): Filters {
  return {
    query: '',
    type: 'all',
    categoryId: 'all',
    dateFrom: '',
    dateTo: '',
  }
}

export function createDefaultBudget(referenceDate = new Date()): MonthlyBudget {
  return {
    monthKey: getCurrentMonthKey(referenceDate),
    limit: DEFAULT_MONTHLY_BUDGET_LIMIT,
    warningThreshold: DEFAULT_WARNING_THRESHOLD,
  }
}

export function createInitialFinanceState(referenceDate = new Date()): FinanceState {
  return {
    transactions: [],
    recurringRules: [],
    categories: defaultCategories,
    filters: createInitialFilters(),
    monthlyBudget: createDefaultBudget(referenceDate),
    theme: 'light',
    currency: detectDefaultCurrency(),
  }
}

export function getDefaultTimezone() {
  return detectBrowserTimeZone()
}

export function sortTransactionsByDate(transactions: Transaction[]) {
  return [...transactions].sort((left, right) => {
    const dateDifference = parseISO(right.date).getTime() - parseISO(left.date).getTime()

    if (dateDifference !== 0) {
      return dateDifference
    }

    return parseISO(right.createdAt).getTime() - parseISO(left.createdAt).getTime()
  })
}

export function calculateTotals(transactions: Transaction[]): TotalsSummary {
  return transactions.reduce<TotalsSummary>(
    (accumulator, transaction) => {
      if (transaction.type === 'income') {
        accumulator.income += transaction.amount
        accumulator.balance += transaction.amount
      } else {
        accumulator.expenses += transaction.amount
        accumulator.balance -= transaction.amount
      }

      return accumulator
    },
    {
      income: 0,
      expenses: 0,
      balance: 0,
    },
  )
}

export function filterTransactions(
  transactions: Transaction[],
  filters: Filters,
  categories: Category[],
) {
  const categoryLookup = new Map(categories.map((category) => [category.id, category]))
  const normalizedQuery = filters.query.trim().toLowerCase()

  return transactions.filter((transaction) => {
    if (filters.type !== 'all' && transaction.type !== filters.type) {
      return false
    }

    if (filters.categoryId !== 'all' && transaction.categoryId !== filters.categoryId) {
      return false
    }

    if (filters.dateFrom) {
      const transactionDate = parseISO(transaction.date)
      const minDate = startOfDay(parseISO(filters.dateFrom))

      if (isBefore(transactionDate, minDate)) {
        return false
      }
    }

    if (filters.dateTo) {
      const transactionDate = parseISO(transaction.date)
      const maxDate = endOfDay(parseISO(filters.dateTo))

      if (isAfter(transactionDate, maxDate)) {
        return false
      }
    }

    if (!normalizedQuery) {
      return true
    }

    const categoryLabel = categoryLookup.get(transaction.categoryId)?.label ?? ''
    const haystack = [transaction.description, categoryLabel, String(transaction.amount)].join(' ').toLowerCase()

    return haystack.includes(normalizedQuery)
  })
}

export function getTransactionsForMonth(transactions: Transaction[], monthKey: string) {
  const start = startOfMonth(parse(monthKey, 'yyyy-MM', new Date()))
  const end = endOfMonth(start)

  return transactions.filter((transaction) => {
    const transactionDate = parseISO(transaction.date)
    return !isBefore(transactionDate, start) && !isAfter(transactionDate, end)
  })
}

export function calculateMonthlySummary(transactions: Transaction[], monthKey: string): MonthlySummary {
  const monthTransactions = getTransactionsForMonth(transactions, monthKey)
  const totals = calculateTotals(monthTransactions)

  return {
    monthKey,
    income: totals.income,
    expenses: totals.expenses,
    balance: totals.balance,
    transactionsCount: monthTransactions.length,
  }
}

export function calculateBudgetStatus(
  transactions: Transaction[],
  monthlyBudget: MonthlyBudget,
  monthKey = getCurrentMonthKey(),
): BudgetStatus {
  const monthlySummary = calculateMonthlySummary(transactions, monthKey)
  const spent = monthlySummary.expenses
  const limit = Math.max(monthlyBudget.limit, 0)
  const remaining = limit - spent
  const progress = limit > 0 ? Math.min(spent / limit, 1.5) : 0
  const warningThreshold = monthlyBudget.warningThreshold

  return {
    monthKey,
    limit,
    spent,
    remaining,
    progress,
    warningThreshold,
    isNearLimit: limit > 0 && spent >= limit * warningThreshold && spent < limit,
    isOverLimit: limit > 0 && spent >= limit,
  }
}

interface CategorySummaryOptions {
  monthKey?: string
  type?: TransactionType
}

export function calculateCategorySummary(
  transactions: Transaction[],
  categories: Category[],
  options: CategorySummaryOptions = {},
): CategorySummary[] {
  const scopedTransactions = options.monthKey ? getTransactionsForMonth(transactions, options.monthKey) : transactions
  const filteredTransactions = options.type
    ? scopedTransactions.filter((transaction) => transaction.type === options.type)
    : scopedTransactions

  const total = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)

  return categories
    .filter((category) => !options.type || category.type === options.type)
    .map((category) => {
      const value = filteredTransactions
        .filter((transaction) => transaction.categoryId === category.id)
        .reduce((sum, transaction) => sum + transaction.amount, 0)

      return {
        categoryId: category.id,
        label: category.label,
        color: category.color,
        icon: category.icon,
        value,
        percentage: total > 0 ? value / total : 0,
      }
    })
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value)
}

export function getAvailableMonthKeys(transactions: Transaction[]) {
  const months = new Set(transactions.map((transaction) => format(parseISO(transaction.date), 'yyyy-MM')))
  months.add(getCurrentMonthKey())

  return [...months].sort((left, right) => right.localeCompare(left))
}

export function calculateMonthlySeries(
  transactions: Transaction[],
  totalMonths = 6,
): MonthlySeriesPoint[] {
  const months = Array.from({ length: totalMonths }, (_, index) => getCurrentMonthKey(subMonths(new Date(), totalMonths - index - 1)))

  return months.map((monthKey) => {
    const summary = calculateMonthlySummary(transactions, monthKey)

    return {
      monthKey,
      label: format(parse(monthKey, 'yyyy-MM', new Date()), 'MMM', { locale: es }),
      income: summary.income,
      expenses: summary.expenses,
      balance: summary.balance,
    }
  })
}

export function getRecentTransactions(transactions: Transaction[], limit = RECENT_TRANSACTIONS_LIMIT) {
  return sortTransactionsByDate(transactions).slice(0, limit)
}

export function getCategoryById(categories: Category[], categoryId: string) {
  return categories.find((category) => category.id === categoryId)
}

export function getCategoriesByType(categories: Category[], type: TransactionType) {
  return categories.filter((category) => category.type === type)
}

export function isMonthKeyValid(monthKey: string) {
  return isValid(parse(monthKey, 'yyyy-MM', new Date()))
}
