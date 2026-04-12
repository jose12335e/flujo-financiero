import type { FinanceState, FinanceSyncState, RemoteFinanceSnapshot } from '@/types/finance'

import { createInitialSyncState } from '@/utils/supabase/financeSyncState'
import {
  deleteFinanceDebtPayments,
  deleteFinanceDebts,
  loadFinanceDebtPayments,
  loadFinanceDebts,
  mapDebtPaymentRowToDebtPayment,
  mapDebtRowToDebt,
  upsertFinanceDebtPayments,
  upsertFinanceDebts,
} from '@/utils/supabase/financeDebts'
import { applyFinanceSettings, loadFinanceSettings, upsertFinanceSettings } from '@/utils/supabase/financeSettings'
import { resolveSupabaseSyncErrorMessage } from '@/utils/supabase/financeErrors'
import { areRemoteSnapshotsEqual, createRemoteSnapshot } from '@/utils/supabase/financeSnapshot'
import {
  deleteFinanceRecurringRules,
  loadFinanceRecurringRules,
  mapRecurringRuleRowToRule,
  processDueRecurringRulesForCurrentUser,
  upsertFinanceRecurringRules,
} from '@/utils/supabase/financeRecurringRules'
import {
  deleteFinanceSalaryDeductions,
  loadFinanceSalaryDeductions,
  loadFinanceSalaryProfile,
  mapSalaryDeductionRowToDeduction,
  mapSalaryProfileRowToProfile,
  upsertFinanceSalaryDeductions,
  upsertFinanceSalaryProfile,
} from '@/utils/supabase/financeSalary'
import {
  deleteFinanceTransactions,
  loadFinanceTransactions,
  mapTransactionRowToTransaction,
  upsertFinanceTransactions,
} from '@/utils/supabase/financeTransactions'

export {
  areRemoteSnapshotsEqual,
  createInitialSyncState,
  createRemoteSnapshot,
  processDueRecurringRulesForCurrentUser,
  resolveSupabaseSyncErrorMessage,
}

export async function loadFinanceStateFromSupabase(localState: FinanceState, userId: string) {
  const [settings, transactions, recurringRules, debts, debtPayments, salaryProfile, salaryDeductions] = await Promise.all([
    loadFinanceSettings(userId),
    loadFinanceTransactions(userId),
    loadFinanceRecurringRules(userId),
    loadFinanceDebts(userId),
    loadFinanceDebtPayments(userId),
    loadFinanceSalaryProfile(userId),
    loadFinanceSalaryDeductions(userId),
  ])

  const hasRemoteData =
    Boolean(settings) ||
    transactions.length > 0 ||
    recurringRules.length > 0 ||
    debts.length > 0 ||
    debtPayments.length > 0 ||
    Boolean(salaryProfile) ||
    salaryDeductions.length > 0

  if (!hasRemoteData) {
    return localState
  }

  return {
    ...applyFinanceSettings(localState, settings),
    transactions: transactions.map(mapTransactionRowToTransaction),
    recurringRules: recurringRules.map(mapRecurringRuleRowToRule),
    debts: debts.map(mapDebtRowToDebt),
    debtPayments: debtPayments.map(mapDebtPaymentRowToDebtPayment),
    salaryProfile: salaryProfile ? mapSalaryProfileRowToProfile(salaryProfile) : null,
    salaryDeductions: salaryDeductions.map(mapSalaryDeductionRowToDeduction),
  }
}

export async function syncFinanceStateToSupabase(
  previousSnapshot: RemoteFinanceSnapshot | null,
  nextSnapshot: RemoteFinanceSnapshot,
  userId: string,
) {
  const previousTransactionsMap = new Map(previousSnapshot?.transactions.map((transaction) => [transaction.id, transaction]) ?? [])
  const nextTransactionsMap = new Map(nextSnapshot.transactions.map((transaction) => [transaction.id, transaction]))
  const previousRulesMap = new Map(previousSnapshot?.recurringRules.map((rule) => [rule.id, rule]) ?? [])
  const nextRulesMap = new Map(nextSnapshot.recurringRules.map((rule) => [rule.id, rule]))
  const previousDebtsMap = new Map(previousSnapshot?.debts.map((debt) => [debt.id, debt]) ?? [])
  const nextDebtsMap = new Map(nextSnapshot.debts.map((debt) => [debt.id, debt]))
  const previousDebtPaymentsMap = new Map(previousSnapshot?.debtPayments.map((payment) => [payment.id, payment]) ?? [])
  const nextDebtPaymentsMap = new Map(nextSnapshot.debtPayments.map((payment) => [payment.id, payment]))
  const previousSalaryDeductionsMap = new Map(previousSnapshot?.salaryDeductions.map((deduction) => [deduction.id, deduction]) ?? [])
  const nextSalaryDeductionsMap = new Map(nextSnapshot.salaryDeductions.map((deduction) => [deduction.id, deduction]))

  const transactionsToUpsert = nextSnapshot.transactions.filter((transaction) => {
    const previousTransaction = previousTransactionsMap.get(transaction.id)
    return !previousTransaction || previousTransaction.updatedAt !== transaction.updatedAt
  })
  const transactionIdsToDelete = [...previousTransactionsMap.keys()].filter((transactionId) => !nextTransactionsMap.has(transactionId))

  const rulesToUpsert = nextSnapshot.recurringRules.filter((rule) => {
    const previousRule = previousRulesMap.get(rule.id)
    return !previousRule || previousRule.updatedAt !== rule.updatedAt
  })
  const ruleIdsToDelete = [...previousRulesMap.keys()].filter((ruleId) => !nextRulesMap.has(ruleId))
  const debtsToUpsert = nextSnapshot.debts.filter((debt) => {
    const previousDebt = previousDebtsMap.get(debt.id)
    return !previousDebt || previousDebt.updatedAt !== debt.updatedAt
  })
  const debtIdsToDelete = [...previousDebtsMap.keys()].filter((debtId) => !nextDebtsMap.has(debtId))
  const debtPaymentsToUpsert = nextSnapshot.debtPayments.filter((payment) => {
    const previousPayment = previousDebtPaymentsMap.get(payment.id)
    return !previousPayment || previousPayment.updatedAt !== payment.updatedAt
  })
  const debtPaymentIdsToDelete = [...previousDebtPaymentsMap.keys()].filter((paymentId) => !nextDebtPaymentsMap.has(paymentId))
  const salaryDeductionsToUpsert = nextSnapshot.salaryDeductions.filter((deduction) => {
    const previousDeduction = previousSalaryDeductionsMap.get(deduction.id)
    return !previousDeduction || previousDeduction.updatedAt !== deduction.updatedAt
  })
  const salaryDeductionIdsToDelete = [...previousSalaryDeductionsMap.keys()].filter((deductionId) => !nextSalaryDeductionsMap.has(deductionId))

  const shouldSyncSettings =
    !previousSnapshot ||
    previousSnapshot.currency !== nextSnapshot.currency ||
    previousSnapshot.theme !== nextSnapshot.theme ||
    previousSnapshot.monthlyBudget.limit !== nextSnapshot.monthlyBudget.limit ||
    previousSnapshot.monthlyBudget.warningThreshold !== nextSnapshot.monthlyBudget.warningThreshold

  await Promise.all([
    upsertFinanceTransactions(transactionsToUpsert, userId),
    deleteFinanceTransactions(transactionIdsToDelete, userId),
    upsertFinanceRecurringRules(rulesToUpsert, userId),
    deleteFinanceRecurringRules(ruleIdsToDelete, userId),
    upsertFinanceDebts(debtsToUpsert, userId),
    deleteFinanceDebts(debtIdsToDelete, userId),
    upsertFinanceDebtPayments(debtPaymentsToUpsert, userId),
    deleteFinanceDebtPayments(debtPaymentIdsToDelete, userId),
    upsertFinanceSalaryProfile(nextSnapshot.salaryProfile, userId),
    upsertFinanceSalaryDeductions(salaryDeductionsToUpsert, userId),
    deleteFinanceSalaryDeductions(salaryDeductionIdsToDelete, userId),
    shouldSyncSettings ? upsertFinanceSettings(nextSnapshot, userId) : Promise.resolve(),
  ])
}

export type { FinanceSyncState }
