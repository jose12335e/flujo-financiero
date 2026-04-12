import type { LucideIcon } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

interface StatCardProps {
  title: string
  value: string
  caption: string
  icon: LucideIcon
  tone?: 'brand' | 'success' | 'danger' | 'neutral'
}

export function StatCard({ caption, icon: Icon, tone = 'neutral', title, value }: StatCardProps) {
  return (
    <Card
      className={cn('relative overflow-hidden', {
        brand: 'bg-[linear-gradient(145deg,rgba(23,110,255,0.18),transparent_75%)]',
        success: 'bg-[linear-gradient(145deg,rgba(16,185,129,0.15),transparent_75%)]',
        danger: 'bg-[linear-gradient(145deg,rgba(239,68,68,0.15),transparent_75%)]',
        neutral: '',
      }[tone])}
    >
      <div className="relative min-h-[8.4rem] pr-12 sm:min-h-[10.5rem] sm:pr-16">
        <div
          className={cn('absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-xl sm:h-10 sm:w-10', {
            brand: 'bg-brand-soft text-brand',
            success: 'bg-success-soft text-success',
            danger: 'bg-danger-soft text-danger',
            neutral: 'bg-panel-muted text-text-secondary',
          }[tone])}
        >
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>

        <div className="max-w-full">
          <p className="text-[0.82rem] font-medium text-text-secondary sm:text-sm">{title}</p>
          <p className="mt-2 max-w-full text-[clamp(1.2rem,4.5vw,2.25rem)] leading-none font-bold tracking-tight text-text-primary sm:mt-2.5">
            {value}
          </p>
          <p className="mt-2 max-w-[22ch] text-[0.82rem] leading-5 text-text-muted sm:mt-3 sm:text-[0.95rem] sm:leading-6">{caption}</p>
        </div>
      </div>
    </Card>
  )
}
