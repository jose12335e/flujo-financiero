import { z } from 'zod'

import type { FinanceState } from '@/types/finance'
import {
  createInitialFinanceState,
  createDefaultBudget,
  createInitialFilters,
  detectDefaultCurrency,
  getCurrentMonthKey,
} from '@/utils/finance'

const transactionSchema = z.object({
  id: z.string(),
  type: z.enum(['income', 'expense']),
  amount: z.number().nonnegative(),
  categoryId: z.string(),
  description: z.string(),
  date: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  source: z.enum(['manual', 'recurring', 'debt_payment', 'salary_payment']).optional(),
  recurringRuleId: z.string().nullable().optional(),
  scheduledFor: z.string().nullable().optional(),
  debtId: z.string().nullable().optional(),
})

const recurringRuleSchema = z.object({
  id: z.string(),
  type: z.enum(['income', 'expense']),
  amount: z.number().nonnegative(),
  categoryId: z.string(),
  description: z.string(),
  frequency: z.enum(['once', 'daily', 'weekly', 'monthly']),
  intervalValue: z.number().int().positive(),
  startDate: z.string(),
  runTime: z.string(),
  endDate: z.string().nullable(),
  timezone: z.string(),
  isFixed: z.boolean(),
  isActive: z.boolean(),
  nextRunAt: z.string().nullable(),
  lastRunAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const categorySchema = z.object({
  id: z.string(),
  type: z.enum(['income', 'expense']),
  label: z.string(),
  color: z.string(),
  icon: z.string(),
  isDefault: z.boolean(),
})

const debtSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['loan', 'credit_card', 'mortgage', 'vehicle', 'service', 'personal', 'other']),
  originalAmount: z.number().nonnegative(),
  pendingBalance: z.number().nonnegative(),
  monthlyPayment: z.number().nonnegative(),
  interestRate: z.number().nonnegative().nullable(),
  paymentDay: z.number().int().min(1).max(31),
  startDate: z.string(),
  endDate: z.string().nullable(),
  status: z.enum(['active', 'paid', 'paused', 'defaulted']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  notes: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const debtPaymentSchema = z.object({
  id: z.string(),
  debtId: z.string(),
  transactionId: z.string().nullable(),
  amount: z.number().nonnegative(),
  paymentDate: z.string(),
  principalAmount: z.number().nonnegative().nullable(),
  interestAmount: z.number().nonnegative().nullable(),
  notes: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const salaryProfileSchema = z.object({
  id: z.string(),
  grossSalary: z.number().nonnegative(),
  payFrequency: z.enum(['monthly', 'biweekly', 'weekly']),
  bonuses: z.number().nonnegative(),
  overtimePay: z.number().nonnegative(),
  otherIncome: z.number().nonnegative(),
  notes: z.string(),
  allowTransactionGeneration: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const salaryDeductionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['fixed', 'percentage']),
  value: z.number().nonnegative(),
  isActive: z.boolean(),
  isMandatory: z.boolean(),
  frequency: z.enum(['per_period', 'monthly']),
  notes: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const financeStateSchema = z.object({
  transactions: z.array(transactionSchema),
  recurringRules: z.array(recurringRuleSchema).optional(),
  debts: z.array(debtSchema).optional(),
  debtPayments: z.array(debtPaymentSchema).optional(),
  salaryProfile: salaryProfileSchema.nullable().optional(),
  salaryDeductions: z.array(salaryDeductionSchema).optional(),
  categories: z.array(categorySchema),
  filters: z
    .object({
      query: z.string(),
      type: z.enum(['all', 'income', 'expense']),
      categoryId: z.string(),
      dateFrom: z.string(),
      dateTo: z.string(),
    })
    .optional(),
  monthlyBudget: z.object({
    monthKey: z.string(),
    limit: z.number().nonnegative(),
    warningThreshold: z.number().min(0).max(1),
  }),
  theme: z.enum(['light', 'dark']),
  currency: z.string(),
})

export function serializeFinanceState(state: FinanceState) {
  return JSON.stringify(state)
}

export function deserializeFinanceState(raw: string | null): FinanceState {
  if (!raw) {
    return createInitialFinanceState()
  }

  try {
    const parsed = financeStateSchema.parse(JSON.parse(raw))
    const currentMonthKey = getCurrentMonthKey()

    return {
      transactions: parsed.transactions.map((transaction) => ({
        ...transaction,
        source: transaction.source ?? 'manual',
        recurringRuleId: transaction.recurringRuleId ?? null,
        scheduledFor: transaction.scheduledFor ?? null,
        debtId: transaction.debtId ?? null,
      })),
      recurringRules: parsed.recurringRules ?? [],
      debts: parsed.debts ?? [],
      debtPayments: parsed.debtPayments ?? [],
      salaryProfile: parsed.salaryProfile ?? null,
      salaryDeductions: parsed.salaryDeductions ?? [],
      categories: parsed.categories,
      filters: parsed.filters ?? createInitialFilters(),
      monthlyBudget: {
        ...createDefaultBudget(),
        ...parsed.monthlyBudget,
        monthKey: currentMonthKey,
      },
      theme: parsed.theme,
      currency: parsed.currency || detectDefaultCurrency(),
    }
  } catch {
    return createInitialFinanceState()
  }
}
