import type { Category } from '@/types/finance'

export const defaultCategories: Category[] = [
  { id: 'salary', type: 'income', label: 'Salario', color: '#0f9f75', icon: 'Wallet', isDefault: true },
  { id: 'freelance', type: 'income', label: 'Freelance', color: '#1988ff', icon: 'BriefcaseBusiness', isDefault: true },
  { id: 'investment', type: 'income', label: 'Inversiones', color: '#4db6ac', icon: 'TrendingUp', isDefault: true },
  { id: 'gift', type: 'income', label: 'Regalos', color: '#f59e0b', icon: 'Gift', isDefault: true },
  { id: 'other-income', type: 'income', label: 'Otros ingresos', color: '#7c8aa0', icon: 'Sparkles', isDefault: true },
  { id: 'housing', type: 'expense', label: 'Vivienda', color: '#ef4444', icon: 'House', isDefault: true },
  { id: 'food', type: 'expense', label: 'Comida', color: '#f97316', icon: 'UtensilsCrossed', isDefault: true },
  { id: 'transport', type: 'expense', label: 'Transporte', color: '#1d4ed8', icon: 'Car', isDefault: true },
  { id: 'health', type: 'expense', label: 'Salud', color: '#dc2626', icon: 'HeartPulse', isDefault: true },
  { id: 'education', type: 'expense', label: 'Educación', color: '#8b5cf6', icon: 'GraduationCap', isDefault: true },
  { id: 'entertainment', type: 'expense', label: 'Ocio', color: '#ec4899', icon: 'Popcorn', isDefault: true },
  { id: 'services', type: 'expense', label: 'Servicios', color: '#64748b', icon: 'Wifi', isDefault: true },
  { id: 'shopping', type: 'expense', label: 'Compras', color: '#14b8a6', icon: 'ShoppingBag', isDefault: true },
  { id: 'debt-payment', type: 'expense', label: 'Pago de deuda', color: '#8b5cf6', icon: 'CreditCard', isDefault: true },
  { id: 'other-expense', type: 'expense', label: 'Otros gastos', color: '#7c8aa0', icon: 'ReceiptText', isDefault: true },
]
