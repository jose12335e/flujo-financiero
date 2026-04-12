/* eslint-disable react-refresh/only-export-components */
import { type Dispatch, type PropsWithChildren, createContext, useContext, useEffect, useReducer, useRef, useState } from 'react'

import { financeReducer, type FinanceAction } from '@/app/providers/finance/financeReducer'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useLocalStorageState } from '@/hooks/useLocalStorageState'
import type {
  FinanceState,
  FinanceSyncState,
  RemoteFinanceSnapshot,
} from '@/types/finance'
import { FINANCE_STORAGE_KEY } from '@/utils/constants'
import { createInitialFinanceState } from '@/utils/finance'
import { deserializeFinanceState, serializeFinanceState } from '@/utils/storage'
import {
  areRemoteSnapshotsEqual,
  createInitialSyncState,
  createRemoteSnapshot,
  loadFinanceStateFromSupabase,
  resolveSupabaseSyncErrorMessage,
  syncFinanceStateToSupabase,
} from '@/utils/supabaseFinance'

const FinanceStateContext = createContext<FinanceState | null>(null)
const FinanceDispatchContext = createContext<Dispatch<FinanceAction> | null>(null)
const FinanceSyncContext = createContext<{
  syncState: FinanceSyncState
  retrySync: () => void
  refreshRemoteData: () => void
} | null>(null)

interface FinanceProviderProps extends PropsWithChildren {
  enableRemoteSync?: boolean
  initialState?: FinanceState
  storageKey?: string
  userId?: string
}

export function FinanceProvider({
  children,
  enableRemoteSync,
  initialState,
  storageKey = FINANCE_STORAGE_KEY,
  userId,
}: FinanceProviderProps) {
  const remoteSyncEnabled = enableRemoteSync ?? Boolean(isSupabaseConfigured && userId)
  const [persistedState, setPersistedState] = useLocalStorageState<FinanceState>(
    storageKey,
    initialState ?? createInitialFinanceState(),
    {
      parse: initialState ? undefined : deserializeFinanceState,
      serialize: serializeFinanceState,
    },
  )

  const [state, dispatch] = useReducer(financeReducer, persistedState)
  const [syncState, setSyncState] = useState<FinanceSyncState>(() =>
    createInitialSyncState(remoteSyncEnabled, Boolean(userId)),
  )
  const [syncAttemptKey, setSyncAttemptKey] = useState(0)
  const [forcedSyncKey, setForcedSyncKey] = useState(0)
  const [refreshAttemptKey, setRefreshAttemptKey] = useState(0)
  const latestStateRef = useRef(state)
  const remoteReadyRef = useRef(!remoteSyncEnabled)
  const lastSyncedSnapshotRef = useRef<RemoteFinanceSnapshot | null>(
    remoteSyncEnabled ? createRemoteSnapshot(persistedState) : null,
  )
  const syncQueueRef = useRef(Promise.resolve())
  const remoteSnapshot = createRemoteSnapshot(state)
  const providedSyncState = remoteSyncEnabled
    ? syncState
    : createInitialSyncState(isSupabaseConfigured, Boolean(userId))

  useEffect(() => {
    latestStateRef.current = state
  }, [state])

  useEffect(() => {
    setPersistedState(state)
  }, [setPersistedState, state])

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme
    document.documentElement.style.colorScheme = state.theme
  }, [state.theme])

  useEffect(() => {
    if (!remoteSyncEnabled || !userId) {
      remoteReadyRef.current = false
      return
    }

    let isActive = true
    const activeUserId = userId

    async function bootstrapSupabaseState() {
      setSyncState({
        mode: 'supabase',
        phase: 'loading',
        isConfigured: true,
        isAuthenticated: true,
        message: 'Sincronizando tu cuenta...',
      })

      try {
        const remoteState = await loadFinanceStateFromSupabase(latestStateRef.current, activeUserId)
        const loadedFromRemote = remoteState !== latestStateRef.current

        if (!isActive) {
          return
        }

        remoteReadyRef.current = true
        lastSyncedSnapshotRef.current = loadedFromRemote ? createRemoteSnapshot(remoteState) : createRemoteSnapshot(latestStateRef.current)

        if (loadedFromRemote) {
          dispatch({ type: 'HYDRATE_STATE', payload: remoteState })
        }

        setSyncState({
          mode: 'supabase',
          phase: 'ready',
          isConfigured: true,
          isAuthenticated: true,
          message: 'Cuenta sincronizada y al dia.',
        })
      } catch (error) {
        if (!isActive) {
          return
        }

        remoteReadyRef.current = false
        lastSyncedSnapshotRef.current = createRemoteSnapshot(latestStateRef.current)
        setSyncState({
          mode: 'local',
          phase: 'error',
          isConfigured: true,
          isAuthenticated: true,
          message: resolveSupabaseSyncErrorMessage(error, 'load'),
        })
      }
    }

    void bootstrapSupabaseState()

    return () => {
      isActive = false
    }
  }, [refreshAttemptKey, remoteSyncEnabled, syncAttemptKey, userId])

  useEffect(() => {
    if (!remoteSyncEnabled || !remoteReadyRef.current || !userId) {
      return
    }

    if (areRemoteSnapshotsEqual(lastSyncedSnapshotRef.current, remoteSnapshot)) {
      return
    }

    syncQueueRef.current = syncQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        setSyncState((currentState) => ({
          ...currentState,
          mode: 'supabase',
          phase: 'saving',
          message: 'Guardando cambios en tu cuenta...',
        }))

        await syncFinanceStateToSupabase(lastSyncedSnapshotRef.current, remoteSnapshot, userId)
        lastSyncedSnapshotRef.current = remoteSnapshot

        setSyncState({
          mode: 'supabase',
          phase: 'ready',
          isConfigured: true,
          isAuthenticated: true,
          message: 'Cuenta sincronizada y al dia.',
        })
      })
      .catch((error) => {
        setSyncState({
          mode: 'supabase',
          phase: 'error',
          isConfigured: true,
          isAuthenticated: true,
          message: resolveSupabaseSyncErrorMessage(error, 'save'),
        })
      })
  }, [forcedSyncKey, remoteSnapshot, remoteSyncEnabled, userId])

  useEffect(() => {
    if (!remoteSyncEnabled || !userId) {
      return
    }

    let isActive = true
    const intervalId = window.setInterval(async () => {
      if (!isActive || !remoteReadyRef.current) {
        return
      }

      const latestSnapshot = createRemoteSnapshot(latestStateRef.current)

      if (!areRemoteSnapshotsEqual(lastSyncedSnapshotRef.current, latestSnapshot)) {
        return
      }

      try {
        const remoteState = await loadFinanceStateFromSupabase(latestStateRef.current, userId)

        if (!isActive) {
          return
        }

        if (remoteState !== latestStateRef.current) {
          dispatch({ type: 'HYDRATE_STATE', payload: remoteState })
          lastSyncedSnapshotRef.current = createRemoteSnapshot(remoteState)
          return
        }

        lastSyncedSnapshotRef.current = latestSnapshot
      } catch {
        // Silent background refresh failure; the visible sync state is updated by explicit sync flows.
      }
    }, 60_000)

    return () => {
      isActive = false
      window.clearInterval(intervalId)
    }
  }, [remoteSyncEnabled, userId])

  const retrySync = () => {
    if (!remoteSyncEnabled) {
      return
    }

    if (!remoteReadyRef.current) {
      setSyncAttemptKey((value) => value + 1)
      return
    }

    lastSyncedSnapshotRef.current = null
    setForcedSyncKey((value) => value + 1)
  }

  const refreshRemoteData = () => {
    if (!remoteSyncEnabled) {
      return
    }

    setRefreshAttemptKey((value) => value + 1)
  }

  return (
    <FinanceStateContext.Provider value={state}>
      <FinanceDispatchContext.Provider value={dispatch}>
        <FinanceSyncContext.Provider value={{ syncState: providedSyncState, retrySync, refreshRemoteData }}>
          {children}
        </FinanceSyncContext.Provider>
      </FinanceDispatchContext.Provider>
    </FinanceStateContext.Provider>
  )
}

export function useFinanceStateContext() {
  const context = useContext(FinanceStateContext)

  if (!context) {
    throw new Error('useFinanceStateContext must be used within FinanceProvider')
  }

  return context
}

export function useFinanceDispatchContext() {
  const context = useContext(FinanceDispatchContext)

  if (!context) {
    throw new Error('useFinanceDispatchContext must be used within FinanceProvider')
  }

  return context
}

export function useFinanceSyncContext() {
  const context = useContext(FinanceSyncContext)

  if (!context) {
    throw new Error('useFinanceSyncContext must be used within FinanceProvider')
  }

  return context
}
