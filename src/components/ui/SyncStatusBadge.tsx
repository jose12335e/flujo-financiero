import { CloudAlert, CloudCheck, DatabaseZap, LoaderCircle, RefreshCw } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import type { FinanceSyncState } from '@/types/finance'

interface SyncStatusBadgeProps {
  syncState: FinanceSyncState
  showMessage?: boolean
}

export function SyncStatusBadge({ showMessage = true, syncState }: SyncStatusBadgeProps) {
  const Icon =
    syncState.mode === 'local'
      ? syncState.phase === 'error'
        ? CloudAlert
        : DatabaseZap
      : syncState.phase === 'loading'
        ? LoaderCircle
        : syncState.phase === 'saving'
          ? RefreshCw
          : syncState.phase === 'error'
            ? CloudAlert
            : CloudCheck

  const variant =
    syncState.phase === 'error'
      ? 'danger'
      : syncState.mode === 'local'
        ? 'neutral'
        : syncState.phase === 'saving' || syncState.phase === 'loading'
          ? 'warning'
          : 'success'

  return (
    <div className="flex items-center gap-3">
      <Badge className="gap-2 px-3 py-2 text-xs" variant={variant}>
        <Icon className={`h-3.5 w-3.5 ${syncState.phase === 'loading' || syncState.phase === 'saving' ? 'animate-spin' : ''}`} />
        {syncState.mode === 'supabase' ? 'Cuenta' : 'Local'}
      </Badge>
      {showMessage ? <p className="hidden text-sm text-text-secondary xl:block">{syncState.message}</p> : null}
    </div>
  )
}
