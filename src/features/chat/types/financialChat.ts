export type FinancialChatSource = 'local' | 'ai' | 'hybrid'

export interface FinancialChatReply {
  answer: string
  followUps: string[]
  analysisSource: FinancialChatSource
}

export interface FinancialChatSnapshot {
  currency: string
  currentMonthKey: string
  currentMonthSummary: {
    income: number
    expenses: number
    balance: number
    transactionsCount: number
  }
  previousMonthSummary: {
    income: number
    expenses: number
    balance: number
    transactionsCount: number
  }
  totals: {
    income: number
    expenses: number
    balance: number
  }
  budgetStatus: {
    limit: number
    spent: number
    remaining: number
    isNearLimit: boolean
    isOverLimit: boolean
  }
  debtSummary: {
    totalPending: number
    monthlyCommitted: number
    activeCount: number
  }
  salarySummary: {
    netMonthlyEstimate: number
    netPerPeriod: number
  } | null
  financialOutlook: {
    committedMoney: number
    estimatedAvailableBalance: number
    estimatedNetSalary: number | null
  }
  topExpenseCategories: Array<{
    label: string
    value: number
    percentage: number
  }>
}

export interface FinancialChatMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  source?: FinancialChatSource
  followUps?: string[]
}

export type FinancialChatState =
  | { status: 'idle'; messages: FinancialChatMessage[] }
  | { status: 'processing'; messages: FinancialChatMessage[] }
  | { status: 'ready'; messages: FinancialChatMessage[] }
  | { status: 'error'; messages: FinancialChatMessage[]; message: string }
