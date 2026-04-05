import { LockKeyhole } from 'lucide-react'
import { Navigate } from 'react-router-dom'

import { AppShell } from '@/app/layouts/AppShell'
import { FinanceProvider } from '@/app/providers/FinanceProvider'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { FINANCE_STORAGE_KEY } from '@/utils/constants'

export function ProtectedAppLayout() {
  const { isConfigured, status, user } = useAuth()

  if (!isConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-bg p-6">
        <Card className="max-w-lg text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft text-danger">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-text-primary">No pudimos habilitar el acceso</h1>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            La conexion de datos aun no esta lista. Completa `VITE_SUPABASE_URL` y
            `VITE_SUPABASE_PUBLISHABLE_KEY` para activar el inicio de sesion y la sincronizacion.
          </p>
        </Card>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-bg p-6">
        <Card className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-text-muted">Acceso</p>
          <h1 className="mt-3 text-2xl font-bold text-text-primary">Preparando tu cuenta</h1>
          <p className="mt-3 text-sm text-text-secondary">Estamos validando tu sesion y cargando tu informacion.</p>
        </Card>
      </div>
    )
  }

  if (!user) {
    return <Navigate replace to="/auth" />
  }

  return (
    <FinanceProvider
      enableRemoteSync
      initialState={undefined}
      key={user.id}
      storageKey={`${FINANCE_STORAGE_KEY}:${user.id}`}
      userId={user.id}
    >
      <AppShell />
    </FinanceProvider>
  )
}
