import { getSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type { RecurringRule } from '@/types/finance'

type FinanceRecurringRuleRow = Database['public']['Tables']['finance_recurring_rules']['Row']
type FinanceRecurringRuleInsert = Database['public']['Tables']['finance_recurring_rules']['Insert']

export async function loadFinanceRecurringRules(userId: string) {
  const client = getSupabaseClient()

  if (!client) {
    return []
  }

  const { data, error } = await client
    .from('finance_recurring_rules')
    .select('*')
    .eq('user_id', userId)
    .order('is_active', { ascending: false })
    .order('next_run_at', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function upsertFinanceRecurringRules(rules: RecurringRule[], userId: string) {
  const client = getSupabaseClient()

  if (!client || rules.length === 0) {
    return
  }

  const rows = rules.map((rule) => mapRecurringRuleToRow(rule, userId))
  const { error } = await client.from('finance_recurring_rules').upsert(rows, { onConflict: 'id' })

  if (error) {
    throw error
  }
}

export async function deleteFinanceRecurringRules(ruleIds: string[], userId: string) {
  const client = getSupabaseClient()

  if (!client || ruleIds.length === 0) {
    return
  }

  const { error } = await client.from('finance_recurring_rules').delete().eq('user_id', userId).in('id', ruleIds)

  if (error) {
    throw error
  }
}

export async function processDueRecurringRulesForCurrentUser() {
  const client = getSupabaseClient()

  if (!client) {
    return 0
  }

  const { data, error } = await client.rpc('process_due_recurring_rules_for_current_user')

  if (error) {
    throw error
  }

  return Number(data ?? 0)
}

export function mapRecurringRuleRowToRule(rule: FinanceRecurringRuleRow): RecurringRule {
  return {
    id: rule.id,
    type: rule.type,
    amount: rule.amount,
    categoryId: rule.category_id,
    description: rule.description,
    frequency: rule.frequency,
    intervalValue: rule.interval_value,
    startDate: rule.start_date,
    runTime: rule.run_time.slice(0, 5),
    endDate: rule.end_date,
    timezone: rule.timezone,
    isFixed: rule.is_fixed,
    isActive: rule.is_active,
    nextRunAt: rule.next_run_at,
    lastRunAt: rule.last_run_at,
    createdAt: rule.created_at,
    updatedAt: rule.updated_at,
  }
}

function mapRecurringRuleToRow(rule: RecurringRule, userId: string): FinanceRecurringRuleInsert {
  return {
    id: rule.id,
    user_id: userId,
    type: rule.type,
    amount: rule.amount,
    category_id: rule.categoryId,
    description: rule.description,
    frequency: rule.frequency,
    interval_value: rule.intervalValue,
    start_date: rule.startDate,
    run_time: rule.runTime,
    end_date: rule.endDate,
    timezone: rule.timezone,
    is_fixed: rule.isFixed,
    is_active: rule.isActive,
    next_run_at: rule.nextRunAt,
    last_run_at: rule.lastRunAt,
    created_at: rule.createdAt,
    updated_at: rule.updatedAt,
  }
}
