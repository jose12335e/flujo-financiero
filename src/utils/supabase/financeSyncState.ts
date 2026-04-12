import type { FinanceSyncState } from '@/types/finance'

export function createInitialSyncState(isConfigured: boolean, isAuthenticated: boolean): FinanceSyncState {
  if (!isConfigured) {
    return {
      mode: 'local',
      phase: 'ready',
      isConfigured: false,
      isAuthenticated: false,
      message: 'Modo local activo. La sincronizacion con tu cuenta no esta disponible en este equipo.',
    }
  }

  if (!isAuthenticated) {
    return {
      mode: 'local',
      phase: 'ready',
      isConfigured: true,
      isAuthenticated: false,
      message: 'Inicia sesion para recuperar y sincronizar tu informacion guardada.',
    }
  }

  return {
    mode: 'supabase',
    phase: 'loading',
    isConfigured: true,
    isAuthenticated: true,
    message: 'Conectando con tu cuenta...',
  }
}
