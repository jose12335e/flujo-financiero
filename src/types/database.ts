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
          source: 'manual' | 'recurring'
          recurring_rule_id: string | null
          scheduled_for: string | null
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
          source?: 'manual' | 'recurring'
          recurring_rule_id?: string | null
          scheduled_for?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['finance_transactions']['Insert']>
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
