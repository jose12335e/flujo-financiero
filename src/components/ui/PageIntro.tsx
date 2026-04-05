import type { PropsWithChildren, ReactNode } from 'react'

import { cn } from '@/utils/cn'

interface PageIntroProps extends PropsWithChildren {
  eyebrow?: string
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function PageIntro({ action, className, description, eyebrow, title, children }: PageIntroProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[2rem] border border-outline bg-[linear-gradient(135deg,rgba(23,110,255,0.16),rgba(16,185,129,0.1),transparent)] p-7 shadow-card',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.25),transparent_70%)] lg:block" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">{eyebrow}</p>
          ) : null}
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-text-secondary sm:text-base">{description}</p>
          {children ? <div className="mt-5">{children}</div> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </section>
  )
}
