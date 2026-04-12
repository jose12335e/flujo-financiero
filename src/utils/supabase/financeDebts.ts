import { getSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type { Debt, DebtPayment } from '@/types/finance'

type FinanceDebtRow = Database['public']['Tables']['finance_debts']['Row']
type FinanceDebtInsert = Database['public']['Tables']['finance_debts']['Insert']
type FinanceDebtPaymentRow = Database['public']['Tables']['finance_debt_payments']['Row']
type FinanceDebtPaymentInsert = Database['public']['Tables']['finance_debt_payments']['Insert']

export async function loadFinanceDebts(userId: string) {
  const client = getSupabaseClient()

  if (!client) {
    return []
  }

  const { data, error } = await client
    .from('finance_debts')
    .select('*')
    .eq('user_id', userId)
    .order('payment_day', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function loadFinanceDebtPayments(userId: string) {
  const client = getSupabaseClient()

  if (!client) {
    return []
  }

  const { data, error } = await client
    .from('finance_debt_payments')
    .select('*')
    .eq('user_id', userId)
    .order('payment_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function upsertFinanceDebts(debts: Debt[], userId: string) {
  const client = getSupabaseClient()

  if (!client || debts.length === 0) {
    return
  }

  const rows = debts.map((debt) => mapDebtToRow(debt, userId))
  const { error } = await client.from('finance_debts').upsert(rows, { onConflict: 'id' })

  if (error) {
    throw error
  }
}

export async function deleteFinanceDebts(debtIds: string[], userId: string) {
  const client = getSupabaseClient()

  if (!client || debtIds.length === 0) {
    return
  }

  const { error } = await client.from('finance_debts').delete().eq('user_id', userId).in('id', debtIds)

  if (error) {
    throw error
  }
}

export async function upsertFinanceDebtPayments(payments: DebtPayment[], userId: string) {
  const client = getSupabaseClient()

  if (!client || payments.length === 0) {
    return
  }

  const rows = payments.map((payment) => mapDebtPaymentToRow(payment, userId))
  const { error } = await client.from('finance_debt_payments').upsert(rows, { onConflict: 'id' })

  if (error) {
    throw error
  }
}

export async function deleteFinanceDebtPayments(paymentIds: string[], userId: string) {
  const client = getSupabaseClient()

  if (!client || paymentIds.length === 0) {
    return
  }

  const { error } = await client.from('finance_debt_payments').delete().eq('user_id', userId).in('id', paymentIds)

  if (error) {
    throw error
  }
}

export function mapDebtRowToDebt(debt: FinanceDebtRow): Debt {
  return {
    id: debt.id,
    name: debt.name,
    type: debt.type,
    originalAmount: debt.original_amount,
    pendingBalance: debt.pending_balance,
    monthlyPayment: debt.monthly_payment,
    interestRate: debt.interest_rate,
    paymentDay: debt.payment_day,
    startDate: debt.start_date,
    endDate: debt.end_date,
    status: debt.status,
    priority: debt.priority,
    notes: debt.notes,
    createdAt: debt.created_at,
    updatedAt: debt.updated_at,
  }
}

export function mapDebtPaymentRowToDebtPayment(payment: FinanceDebtPaymentRow): DebtPayment {
  return {
    id: payment.id,
    debtId: payment.debt_id,
    transactionId: payment.transaction_id,
    amount: payment.amount,
    paymentDate: payment.payment_date,
    principalAmount: payment.principal_amount,
    interestAmount: payment.interest_amount,
    notes: payment.notes,
    createdAt: payment.created_at,
    updatedAt: payment.updated_at,
  }
}

function mapDebtToRow(debt: Debt, userId: string): FinanceDebtInsert {
  return {
    id: debt.id,
    user_id: userId,
    name: debt.name,
    type: debt.type,
    original_amount: debt.originalAmount,
    pending_balance: debt.pendingBalance,
    monthly_payment: debt.monthlyPayment,
    interest_rate: debt.interestRate,
    payment_day: debt.paymentDay,
    start_date: debt.startDate,
    end_date: debt.endDate,
    status: debt.status,
    priority: debt.priority,
    notes: debt.notes,
    created_at: debt.createdAt,
    updated_at: debt.updatedAt,
  }
}

function mapDebtPaymentToRow(payment: DebtPayment, userId: string): FinanceDebtPaymentInsert {
  return {
    id: payment.id,
    user_id: userId,
    debt_id: payment.debtId,
    transaction_id: payment.transactionId,
    amount: payment.amount,
    payment_date: payment.paymentDate,
    principal_amount: payment.principalAmount,
    interest_amount: payment.interestAmount,
    notes: payment.notes,
    created_at: payment.createdAt,
    updated_at: payment.updatedAt,
  }
}
