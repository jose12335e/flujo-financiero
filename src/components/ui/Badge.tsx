import type { HTMLAttributes, PropsWithChildren } from 'react'

import { cn } from '@/utils/cn'

type BadgeVariant = 'brand' | 'success' | 'danger' | 'neutral' | 'warning'

interface BadgeProps extends PropsWithChildren<HTMLAttributes<HTMLSpanElement>> {
  variant?: BadgeVariant
}

export function Badge({ children, className, variant = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        {
          brand: 'bg-brand-soft text-brand',
          success: 'bg-success-soft text-success',
          danger: 'bg-danger-soft text-danger',
          neutral: 'bg-panel-muted text-text-secondary',
          warning: 'bg-warning-soft text-warning',
        }[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
