import type { HTMLAttributes, PropsWithChildren } from 'react'

import { cn } from '@/utils/cn'

export function Card({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn('rounded-[2rem] border border-outline bg-panel p-6 shadow-card', className)} {...props}>
      {children}
    </div>
  )
}
