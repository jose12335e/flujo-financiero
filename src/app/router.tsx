/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy, type ReactNode } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'

import { ProtectedAppLayout } from '@/app/layouts/ProtectedAppLayout'

const DashboardPage = lazy(async () => ({
  default: (await import('@/features/dashboard/pages/DashboardPage')).DashboardPage,
}))

const RegisterPage = lazy(async () => ({
  default: (await import('@/features/transactions/pages/RegisterPage')).RegisterPage,
}))

const ScheduledPage = lazy(async () => ({
  default: (await import('@/features/recurring/pages/ScheduledPage')).ScheduledPage,
}))

const HistoryPage = lazy(async () => ({
  default: (await import('@/features/transactions/pages/HistoryPage')).HistoryPage,
}))

const ReportsPage = lazy(async () => ({
  default: (await import('@/features/reports/pages/ReportsPage')).ReportsPage,
}))

const SettingsPage = lazy(async () => ({
  default: (await import('@/features/settings/pages/SettingsPage')).SettingsPage,
}))

const AuthPage = lazy(async () => ({
  default: (await import('@/features/auth/pages/AuthPage')).AuthPage,
}))

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="rounded-[1.8rem] border border-outline bg-panel px-6 py-5 text-sm text-text-secondary shadow-card">
        Cargando seccion...
      </div>
    </div>
  )
}

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="rounded-[2rem] border border-outline/70 bg-panel p-10 text-center shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">404</p>
        <h1 className="mt-3 text-3xl font-bold text-text-primary">Pagina no encontrada</h1>
        <p className="mt-3 text-sm text-text-secondary">
          La ruta que intentaste abrir no existe dentro de esta aplicacion.
        </p>
      </div>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: withSuspense(<AuthPage />),
  },
  {
    path: '/',
    element: <ProtectedAppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: withSuspense(<DashboardPage />) },
      { path: 'registrar', element: withSuspense(<RegisterPage />) },
      { path: 'registrar/:transactionId', element: withSuspense(<RegisterPage />) },
      { path: 'programados', element: withSuspense(<ScheduledPage />) },
      { path: 'historial', element: withSuspense(<HistoryPage />) },
      { path: 'reportes', element: withSuspense(<ReportsPage />) },
      { path: 'configuracion', element: withSuspense(<SettingsPage />) },
    ],
  },
  {
    path: '*',
    element: <Navigate replace to="/" />,
  },
])
