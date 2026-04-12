import { CloudAlert, CloudCheck, DatabaseZap, LoaderCircle, RefreshCw } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import type { FinanceSyncState } from '@/types/finance'

interface SyncStatusBadgeProps {
  syncState: FinanceSyncState
  showMessage?: boolean
  compact?: boolean
}

function getSyncStatusMeta(syncState: FinanceSyncState) {
  if (syncState.mode === 'local') {
    if (syncState.phase === 'error') {
      return {
        icon: CloudAlert,
        label: 'Revisar conexion',
        variant: 'danger' as const,
      }
    }

    return {
      icon: DatabaseZap,
      label: 'Modo local',
      variant: 'neutral' as const,
    }
  }

  if (syncState.phase === 'loading') {
    return {
      icon: LoaderCircle,
      label: 'Sincronizando',
      variant: 'warning' as const,
    }
  }

  if (syncState.phase === 'saving') {
    return {
      icon: RefreshCw,
      label: 'Guardando',
      variant: 'warning' as const,
    }
  }

  if (syncState.phase === 'error') {
    return {
      icon: CloudAlert,
      label: 'Revisar conexion',
      variant: 'danger' as const,
    }
  }

  return {
    icon: CloudCheck,
    label: 'Con respaldo',
    variant: 'success' as const,
  }
}

export function SyncStatusBadge({ showMessage = true, compact = false, syncState }: SyncStatusBadgeProps) {
  const statusMeta = getSyncStatusMeta(syncState)
  const Icon = statusMeta.icon
  const isBusy = syncState.phase === 'loading' || syncState.phase === 'saving'

  return (
    <div className={compact ? 'flex items-center gap-2' : 'flex items-center gap-3'}>
      <Badge className={compact ? 'gap-2 px-2.5 py-1.5 text-[0.7rem]' : 'gap-2 px-3 py-2 text-xs'} variant={statusMeta.variant}>
        <Icon className={`h-3.5 w-3.5 ${isBusy ? 'animate-spin' : ''}`} />
        {statusMeta.label}
      </Badge>
      {showMessage ? (
        <p className={`${compact ? 'text-xs' : 'hidden text-sm lg:block'} text-text-secondary`}>
          {syncState.message}
        </p>
      ) : null}
    </div>
  )
}
