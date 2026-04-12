export interface Database {
  public: {
    Tables: {
      finance_settings: {
        Row: {
          user_id: string
          currency: string
          theme: 'light' | 'dark'
          monthly_budget_limit: number
          monthly_budget_warning_threshold: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          currency: string
          theme: 'light' | 'dark'
          monthly_budget_limit: number
          monthly_budget_warning_threshold: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['finance_settings']['Insert']>
        Relationships: []
      }
      finance_transactions: {
        Row: {
          id: string
          user_id: string
          type: 'income' | 'expense'
          amount: number
          category_id: string
          description: string
          date: string
          source: 'manual' | 'recurring' | 'debt_payment' | 'salary_payment'
          recurring_rule_id: string | null
          scheduled_for: string | null
          debt_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          type: 'income' | 'expense'
          amount: number
          category_id: string
          description: string
          date: string
          source?: 'manual' | 'recurring' | 'debt_payment' | 'salary_payment'
          recurring_rule_id?: string | null
          scheduled_for?: string | null
          debt_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['finance_transactions']['Insert']>
        Relationships: []
      }
      finance_salary_profiles: {
        Row: {
          id: string
          user_id: string
          gross_salary: number
          pay_frequency: 'monthly' | 'biweekly' | 'weekly'
          bonuses: number
          overtime_pay: number
          other_income: number
          notes: string
          allow_transaction_generation: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          gross_salary: number
          pay_frequency: 'monthly' | 'biweekly' | 'weekly'
          bonuses?: number
          overtime_pay?: number
          other_income?: number
          notes?: string
          allow_transaction_generation?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['finance_salary_profiles']['Insert']>
        Relationships: []
      }
      finance_salary_deductions: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'fixed' | 'percentage'
          value: number
          is_active: boolean
          is_mandatory: boolean
          frequency: 'per_period' | 'monthly'
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          name: string
          type: 'fixed' | 'percentage'
          value: number
          is_active?: boolean
          is_mandatory?: boolean
          frequency: 'per_period' | 'monthly'
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['finance_salary_deductions']['Insert']>
        Relationships: []
      }
      finance_debts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'loan' | 'credit_card' | 'mortgage' | 'vehicle' | 'service' | 'personal' | 'other'
          original_amount: number
          pending_balance: number
          monthly_payment: number
          interest_rate: number | null
          payment_day: number
          start_date: string
          end_date: string | null
          status: 'active' | 'paid' | 'paused' | 'defaulted'
          priority: 'low' | 'medium' | 'high' | 'critical'
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          name: string
          type: 'loan' | 'credit_card' | 'mortgage' | 'vehicle' | 'service' | 'personal' | 'other'
          original_amount: number
          pending_balance: number
          monthly_payment: number
          interest_rate?: number | null
          payment_day: number
          start_date: string
          end_date?: string | null
          status: 'active' | 'paid' | 'paused' | 'defaulted'
          priority: 'low' | 'medium' | 'high' | 'critical'
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['finance_debts']['Insert']>
        Relationships: []
      }
      finance_debt_payments: {
        Row: {
          id: string
          user_id: string
          debt_id: string
          transaction_id: string | null
          amount: number
          payment_date: string
          principal_amount: number | null
          interest_amount: number | null
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          debt_id: string
          transaction_id?: string | null
          amount: number
          payment_date: string
          principal_amount?: number | null
          interest_amount?: number | null
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['finance_debt_payments']['Insert']>
        Relationships: []
      }
      finance_recurring_rules: {
        Row: {
          id: string
          user_id: string
          type: 'income' | 'expense'
          amount: number
          category_id: string
          description: string
          frequency: 'once' | 'daily' | 'weekly' | 'monthly'
          interval_value: number
          start_date: string
          run_time: string
          end_date: string | null
          timezone: string
          is_fixed: boolean
          is_active: boolean
          next_run_at: string | null
          last_run_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          type: 'income' | 'expense'
          amount: number
          category_id: string
          description: string
          frequency: 'once' | 'daily' | 'weekly' | 'monthly'
          interval_value?: number
          start_date: string
          run_time: string
          end_date?: string | null
          timezone: string
          is_fixed?: boolean
          is_active?: boolean
          next_run_at?: string | null
          last_run_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['finance_recurring_rules']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      process_due_recurring_rules_for_current_user: {
        Args: Record<string, never>
        Returns: number
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
