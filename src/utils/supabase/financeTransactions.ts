import { getSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type { Transaction } from '@/types/finance'

type FinanceTransactionRow = Database['public']['Tables']['finance_transactions']['Row']
type FinanceTransactionInsert = Database['public']['Tables']['finance_transactions']['Insert']

export async function loadFinanceTransactions(userId: string) {
  const client = getSupabaseClient()

  if (!client) {
    return []
  }

  const { data, error } = await client
    .from('finance_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function upsertFinanceTransactions(transactions: Transaction[], userId: string) {
  const client = getSupabaseClient()

  if (!client || transactions.length === 0) {
    return
  }

  const rows = transactions.map((transaction) => mapTransactionToRow(transaction, userId))
  const { error } = await client.from('finance_transactions').upsert(rows, { onConflict: 'id' })

  if (error) {
    throw error
  }
}

export async function deleteFinanceTransactions(transactionIds: string[], userId: string) {
  const client = getSupabaseClient()

  if (!client || transactionIds.length === 0) {
    return
  }

  const { error } = await client.from('finance_transactions').delete().eq('user_id', userId).in('id', transactionIds)

  if (error) {
    throw error
  }
}

export function mapTransactionRowToTransaction(transaction: FinanceTransactionRow): Transaction {
  return {
    id: transaction.id,
    type: transaction.type,
    amount: transaction.amount,
    categoryId: transaction.category_id,
    description: transaction.description,
    date: transaction.date,
    createdAt: transaction.created_at,
    updatedAt: transaction.updated_at,
    source: transaction.source,
    recurringRuleId: transaction.recurring_rule_id,
    scheduledFor: transaction.scheduled_for,
    debtId: transaction.debt_id,
  }
}

function mapTransactionToRow(transaction: Transaction, userId: string): FinanceTransactionInsert {
  return {
    id: transaction.id,
    user_id: userId,
    type: transaction.type,
    amount: transaction.amount,
    category_id: transaction.categoryId,
    description: transaction.description,
    date: transaction.date,
    source: transaction.source ?? 'manual',
    recurring_rule_id: transaction.recurringRuleId ?? null,
    scheduled_for: transaction.scheduledFor ?? null,
    debt_id: transaction.debtId ?? null,
    created_at: transaction.createdAt,
    updated_at: transaction.updatedAt,
  }
}
