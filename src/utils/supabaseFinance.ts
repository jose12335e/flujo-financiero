import { getSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type { FinanceState, FinanceSyncState, RecurringRule, RemoteFinanceSnapshot, Transaction } from '@/types/finance'
import { createDefaultBudget, getCurrentMonthKey } from '@/utils/finance'

type FinanceSettingsRow = Database['public']['Tables']['finance_settings']['Row']
type FinanceSettingsInsert = Database['public']['Tables']['finance_settings']['Insert']
type FinanceTransactionRow = Database['public']['Tables']['finance_transactions']['Row']
type FinanceTransactionInsert = Database['public']['Tables']['finance_transactions']['Insert']
type FinanceRecurringRuleRow = Database['public']['Tables']['finance_recurring_rules']['Row']
type FinanceRecurringRuleInsert = Database['public']['Tables']['finance_recurring_rules']['Insert']

export function createInitialSyncState(isConfigured: boolean, isAuthenticated: boolean): FinanceSyncState {
  if (!isConfigured) {
    return {
      mode: 'local',
      phase: 'ready',
      isConfigured: false,
      isAuthenticated: false,
      message: 'La sincronizacion de cuenta aun no esta disponible. La app sigue funcionando en este equipo.',
    }
  }

  if (!isAuthenticated) {
    return {
      mode: 'local',
      phase: 'ready',
      isConfigured: true,
      isAuthenticated: false,
      message: 'Inicia sesion para cargar tu informacion guardada.',
    }
  }

  return {
    mode: 'supabase',
    phase: 'loading',
    isConfigured: true,
    isAuthenticated: true,
    message: 'Conectando con tu cuenta...',
  }
}

export function createRemoteSnapshot(state: FinanceState): RemoteFinanceSnapshot {
  return {
    transactions: state.transactions.map((transaction) => ({ ...transaction })),
    recurringRules: state.recurringRules.map((rule) => ({ ...rule })),
    monthlyBudget: {
      ...state.monthlyBudget,
      monthKey: getCurrentMonthKey(),
    },
    theme: state.theme,
    currency: state.currency,
  }
}

export function areRemoteSnapshotsEqual(left: RemoteFinanceSnapshot | null, right: RemoteFinanceSnapshot) {
  if (!left) {
    return false
  }

  return JSON.stringify(left) === JSON.stringify(right)
}

export async function loadFinanceStateFromSupabase(localState: FinanceState, userId: string) {
  const client = getSupabaseClient()

  if (!client) {
    return localState
  }

  const [{ data: settings, error: settingsError }, { data: transactions, error: transactionsError }, { data: recurringRules, error: recurringRulesError }] = await Promise.all([
    client.from('finance_settings').select('*').eq('user_id', userId).maybeSingle(),
    client
      .from('finance_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false }),
    client
      .from('finance_recurring_rules')
      .select('*')
      .eq('user_id', userId)
      .order('is_active', { ascending: false })
      .order('next_run_at', { ascending: true }),
  ])

  if (settingsError) {
    throw settingsError
  }

  if (transactionsError) {
    throw transactionsError
  }

  if (recurringRulesError) {
    throw recurringRulesError
  }

  const hasRemoteData =
    Boolean(settings) || (transactions?.length ?? 0) > 0 || (recurringRules?.length ?? 0) > 0

  if (!hasRemoteData) {
    return localState
  }

  return mergeRemoteStateWithLocal(localState, settings, transactions ?? [], recurringRules ?? [])
}

export async function syncFinanceStateToSupabase(
  previousSnapshot: RemoteFinanceSnapshot | null,
  nextSnapshot: RemoteFinanceSnapshot,
  userId: string,
) {
  const client = getSupabaseClient()

  if (!client) {
    return
  }

  const previousTransactionsMap = new Map(previousSnapshot?.transactions.map((transaction) => [transaction.id, transaction]) ?? [])
  const nextTransactionsMap = new Map(nextSnapshot.transactions.map((transaction) => [transaction.id, transaction]))
  const previousRulesMap = new Map(previousSnapshot?.recurringRules.map((rule) => [rule.id, rule]) ?? [])
  const nextRulesMap = new Map(nextSnapshot.recurringRules.map((rule) => [rule.id, rule]))

  const transactionsToUpsert = nextSnapshot.transactions.filter((transaction) => {
    const previousTransaction = previousTransactionsMap.get(transaction.id)
    return !previousTransaction || previousTransaction.updatedAt !== transaction.updatedAt
  })

  const transactionIdsToDelete = [...previousTransactionsMap.keys()].filter((transactionId) => !nextTransactionsMap.has(transactionId))

  if (transactionsToUpsert.length > 0) {
    const rows = transactionsToUpsert.map((transaction) => mapTransactionToRow(transaction, userId))
    const { error } = await client.from('finance_transactions').upsert(rows, { onConflict: 'id' })

    if (error) {
      throw error
    }
  }

  if (transactionIdsToDelete.length > 0) {
    const { error } = await client
      .from('finance_transactions')
      .delete()
      .eq('user_id', userId)
      .in('id', transactionIdsToDelete)

    if (error) {
      throw error
    }
  }

  const rulesToUpsert = nextSnapshot.recurringRules.filter((rule) => {
    const previousRule = previousRulesMap.get(rule.id)
    return !previousRule || previousRule.updatedAt !== rule.updatedAt
  })

  const ruleIdsToDelete = [...previousRulesMap.keys()].filter((ruleId) => !nextRulesMap.has(ruleId))

  if (rulesToUpsert.length > 0) {
    const rows = rulesToUpsert.map((rule) => mapRecurringRuleToRow(rule, userId))
    const { error } = await client.from('finance_recurring_rules').upsert(rows, { onConflict: 'id' })

    if (error) {
      throw error
    }
  }

  if (ruleIdsToDelete.length > 0) {
    const { error } = await client
      .from('finance_recurring_rules')
      .delete()
      .eq('user_id', userId)
      .in('id', ruleIdsToDelete)

    if (error) {
      throw error
    }
  }

  const shouldSyncSettings =
    !previousSnapshot ||
    previousSnapshot.currency !== nextSnapshot.currency ||
    previousSnapshot.theme !== nextSnapshot.theme ||
    previousSnapshot.monthlyBudget.limit !== nextSnapshot.monthlyBudget.limit ||
    previousSnapshot.monthlyBudget.warningThreshold !== nextSnapshot.monthlyBudget.warningThreshold

  if (shouldSyncSettings) {
    const settingsRow = mapSettingsToRow(nextSnapshot, userId)
    const { error } = await client.from('finance_settings').upsert(settingsRow, { onConflict: 'user_id' })

    if (error) {
      throw error
    }
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

export function resolveSupabaseSyncErrorMessage(error: unknown, phase: 'load' | 'save') {
  const fallbackMessage =
    phase === 'load'
      ? 'No pudimos conectar con tu cuenta. La app sigue disponible en este equipo.'
      : 'Hubo un problema al sincronizar. Tus cambios siguen guardados en este equipo.'

  if (!(error instanceof Error)) {
    return fallbackMessage
  }

  const normalizedMessage = error.message.toLowerCase()

  if (
    normalizedMessage.includes('finance_settings') ||
    normalizedMessage.includes('finance_transactions') ||
    normalizedMessage.includes('finance_recurring_rules') ||
    normalizedMessage.includes('relation') && normalizedMessage.includes('does not exist') ||
    normalizedMessage.includes('could not find the table')
  ) {
    return 'La conexion esta lista, pero faltan tablas de finanzas. Ejecuta `supabase/schema.sql` en el SQL Editor.'
  }

  if (normalizedMessage.includes('row-level security') || normalizedMessage.includes('permission denied')) {
    return 'La base rechazo el acceso. Revisa las politicas RLS y confirma que el esquema de finanzas este instalado.'
  }

  return fallbackMessage
}

function mergeRemoteStateWithLocal(
  localState: FinanceState,
  settings: FinanceSettingsRow | null,
  transactions: FinanceTransactionRow[],
  recurringRules: FinanceRecurringRuleRow[],
): FinanceState {
  return {
    ...localState,
    transactions: transactions.map(mapTransactionRowToTransaction),
    recurringRules: recurringRules.map(mapRecurringRuleRowToRule),
    monthlyBudget: {
      ...createDefaultBudget(),
      limit: settings?.monthly_budget_limit ?? localState.monthlyBudget.limit,
      warningThreshold: settings?.monthly_budget_warning_threshold ?? localState.monthlyBudget.warningThreshold,
    },
    theme: settings?.theme ?? localState.theme,
    currency: settings?.currency ?? localState.currency,
  }
}

function mapTransactionRowToTransaction(transaction: FinanceTransactionRow): Transaction {
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
    created_at: transaction.createdAt,
    updated_at: transaction.updatedAt,
  }
}

function mapRecurringRuleRowToRule(rule: FinanceRecurringRuleRow): RecurringRule {
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

function mapSettingsToRow(snapshot: RemoteFinanceSnapshot, userId: string): FinanceSettingsInsert {
  return {
    user_id: userId,
    currency: snapshot.currency,
    theme: snapshot.theme,
    monthly_budget_limit: snapshot.monthlyBudget.limit,
    monthly_budget_warning_threshold: snapshot.monthlyBudget.warningThreshold,
    updated_at: new Date().toISOString(),
  }
}
