import { getSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type { SalaryDeduction, SalaryProfile } from '@/types/finance'

type FinanceSalaryProfileRow = Database['public']['Tables']['finance_salary_profiles']['Row']
type FinanceSalaryProfileInsert = Database['public']['Tables']['finance_salary_profiles']['Insert']
type FinanceSalaryDeductionRow = Database['public']['Tables']['finance_salary_deductions']['Row']
type FinanceSalaryDeductionInsert = Database['public']['Tables']['finance_salary_deductions']['Insert']

export async function loadFinanceSalaryProfile(userId: string) {
  const client = getSupabaseClient()

  if (!client) {
    return null
  }

  const { data, error } = await client.from('finance_salary_profiles').select('*').eq('user_id', userId).maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function loadFinanceSalaryDeductions(userId: string) {
  const client = getSupabaseClient()

  if (!client) {
    return []
  }

  const { data, error } = await client
    .from('finance_salary_deductions')
    .select('*')
    .eq('user_id', userId)
    .order('is_active', { ascending: false })
    .order('is_mandatory', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function upsertFinanceSalaryProfile(profile: SalaryProfile | null, userId: string) {
  const client = getSupabaseClient()

  if (!client) {
    return
  }

  if (!profile) {
    const { error } = await client.from('finance_salary_profiles').delete().eq('user_id', userId)

    if (error) {
      throw error
    }

    return
  }

  const row: FinanceSalaryProfileInsert = {
    id: profile.id,
    user_id: userId,
    gross_salary: profile.grossSalary,
    pay_frequency: profile.payFrequency,
    bonuses: profile.bonuses,
    overtime_pay: profile.overtimePay,
    other_income: profile.otherIncome,
    notes: profile.notes,
    allow_transaction_generation: profile.allowTransactionGeneration,
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
  }

  const { error } = await client.from('finance_salary_profiles').upsert(row, { onConflict: 'id' })

  if (error) {
    throw error
  }
}

export async function upsertFinanceSalaryDeductions(deductions: SalaryDeduction[], userId: string) {
  const client = getSupabaseClient()

  if (!client || deductions.length === 0) {
    return
  }

  const rows = deductions.map((deduction) => mapSalaryDeductionToRow(deduction, userId))
  const { error } = await client.from('finance_salary_deductions').upsert(rows, { onConflict: 'id' })

  if (error) {
    throw error
  }
}

export async function deleteFinanceSalaryDeductions(deductionIds: string[], userId: string) {
  const client = getSupabaseClient()

  if (!client || deductionIds.length === 0) {
    return
  }

  const { error } = await client.from('finance_salary_deductions').delete().eq('user_id', userId).in('id', deductionIds)

  if (error) {
    throw error
  }
}

export function mapSalaryProfileRowToProfile(profile: FinanceSalaryProfileRow): SalaryProfile {
  return {
    id: profile.id,
    grossSalary: profile.gross_salary,
    payFrequency: profile.pay_frequency,
    bonuses: profile.bonuses,
    overtimePay: profile.overtime_pay,
    otherIncome: profile.other_income,
    notes: profile.notes,
    allowTransactionGeneration: profile.allow_transaction_generation,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  }
}

export function mapSalaryDeductionRowToDeduction(deduction: FinanceSalaryDeductionRow): SalaryDeduction {
  return {
    id: deduction.id,
    name: deduction.name,
    type: deduction.type,
    value: deduction.value,
    isActive: deduction.is_active,
    isMandatory: deduction.is_mandatory,
    frequency: deduction.frequency,
    notes: deduction.notes,
    createdAt: deduction.created_at,
    updatedAt: deduction.updated_at,
  }
}

function mapSalaryDeductionToRow(deduction: SalaryDeduction, userId: string): FinanceSalaryDeductionInsert {
  return {
    id: deduction.id,
    user_id: userId,
    name: deduction.name,
    type: deduction.type,
    value: deduction.value,
    is_active: deduction.isActive,
    is_mandatory: deduction.isMandatory,
    frequency: deduction.frequency,
    notes: deduction.notes,
    created_at: deduction.createdAt,
    updated_at: deduction.updatedAt,
  }
}
