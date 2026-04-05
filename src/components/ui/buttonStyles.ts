import { cn } from '@/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonStyleOptions {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
}: ButtonStyleOptions = {}) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-60',
    {
      primary: 'bg-brand px-4 text-white shadow-glow hover:-translate-y-0.5 hover:bg-brand-strong',
      secondary: 'border border-outline bg-panel text-text-primary hover:bg-panel-muted',
      ghost: 'text-text-secondary hover:bg-brand-soft hover:text-text-primary',
      danger: 'bg-danger px-4 text-white hover:bg-red-600',
    }[variant],
    {
      sm: 'min-h-10 px-3 text-sm',
      md: 'min-h-11 px-4 text-sm',
      lg: 'min-h-12 px-5 text-base',
    }[size],
    fullWidth && 'w-full',
  )
}
