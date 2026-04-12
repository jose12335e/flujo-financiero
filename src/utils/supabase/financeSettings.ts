import { getSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type { FinanceState, RemoteFinanceSnapshot } from '@/types/finance'
import { createDefaultBudget } from '@/utils/finance'

type FinanceSettingsRow = Database['public']['Tables']['finance_settings']['Row']
type FinanceSettingsInsert = Database['public']['Tables']['finance_settings']['Insert']

export async function loadFinanceSettings(userId: string) {
  const client = getSupabaseClient()

  if (!client) {
    return null
  }

  const { data, error } = await client.from('finance_settings').select('*').eq('user_id', userId).maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function upsertFinanceSettings(snapshot: RemoteFinanceSnapshot, userId: string) {
  const client = getSupabaseClient()

  if (!client) {
    return
  }

  const settingsRow: FinanceSettingsInsert = {
    user_id: userId,
    currency: snapshot.currency,
    theme: snapshot.theme,
    monthly_budget_limit: snapshot.monthlyBudget.limit,
    monthly_budget_warning_threshold: snapshot.monthlyBudget.warningThreshold,
    updated_at: new Date().toISOString(),
  }

  const { error } = await client.from('finance_settings').upsert(settingsRow, { onConflict: 'user_id' })

  if (error) {
    throw error
  }
}

export function applyFinanceSettings(localState: FinanceState, settings: FinanceSettingsRow | null): FinanceState {
  return {
    ...localState,
    monthlyBudget: {
      ...createDefaultBudget(),
      limit: settings?.monthly_budget_limit ?? localState.monthlyBudget.limit,
      warningThreshold: settings?.monthly_budget_warning_threshold ?? localState.monthlyBudget.warningThreshold,
    },
    theme: settings?.theme ?? localState.theme,
    currency: settings?.currency ?? localState.currency,
  }
}
