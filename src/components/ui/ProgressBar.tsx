import { cn } from '@/utils/cn'

interface ProgressBarProps {
  value: number
  tone?: 'brand' | 'success' | 'warning' | 'danger'
}

export function ProgressBar({ tone = 'brand', value }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(value, 1))

  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-panel-muted">
      <div
        className={cn('h-full rounded-full transition-all duration-300', {
          brand: 'bg-brand',
          success: 'bg-success',
          warning: 'bg-warning',
          danger: 'bg-danger',
        }[tone])}
        style={{ width: `${safeValue * 100}%` }}
      />
    </div>
  )
}
