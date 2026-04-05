import type { LucideIcon } from 'lucide-react'
import { ChartNoAxesColumn, Landmark, ShieldCheck, WalletCards } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import { Card } from '@/components/ui/Card'
import { AuthForm } from '@/features/auth/components/AuthForm'
import { useAuth } from '@/hooks/useAuth'

type AuthMode = 'login' | 'register'

export function AuthPage() {
  const navigate = useNavigate()
  const { isConfigured, signInWithPassword, signUp, status, user } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (status === 'ready' && user) {
    return <Navigate replace to="/" />
  }

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    setIsSubmitting(true)
    setErrorMessage('')
    setInfoMessage('')

    try {
      await signInWithPassword(email, password)
      navigate('/', { replace: true })
    } catch (error) {
      setErrorMessage(resolveAuthError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async ({
    email,
    password,
  }: {
    confirmPassword: string
    email: string
    password: string
  }) => {
    setIsSubmitting(true)
    setErrorMessage('')
    setInfoMessage('')

    try {
      const result = await signUp(email, password)

      if (result.requiresEmailConfirmation) {
        setInfoMessage('Cuenta creada. Revisa tu correo y confirma la direccion antes de iniciar sesion.')
        setMode('login')
      } else {
        navigate('/', { replace: true })
      }
    } catch (error) {
      setErrorMessage(resolveAuthError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-app-bg px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="relative overflow-hidden rounded-[2.4rem] border border-outline bg-[linear-gradient(145deg,rgba(23,110,255,0.16),rgba(16,185,129,0.1),transparent)] p-8 shadow-card sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-glow">
              <Landmark className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight text-text-primary">Flujo Personal</p>
              <p className="text-sm text-text-secondary">Tu espacio personal para ordenar ingresos, gastos y presupuesto.</p>
            </div>
          </div>

          <div className="mt-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Acceso privado</p>
            <h1 className="mt-3 max-w-4xl text-[clamp(3rem,5vw,5.4rem)] font-bold tracking-[-0.04em] text-text-primary">
              Tu informacion financiera se organiza en una cuenta personal y protegida.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-text-secondary">
              Inicia sesion con tu correo para revisar movimientos, presupuesto y reportes sin mezclar informacion entre
              usuarios.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <Feature
              description="Accede con correo y contrasena desde tu espacio financiero."
              icon={ShieldCheck}
              title="Cuenta segura"
            />
            <Feature
              description="Cada cuenta consulta y actualiza solo su propia informacion."
              icon={WalletCards}
              title="Datos por usuario"
            />
            <Feature
              description="Tus cambios se guardan para que no dependan de un solo navegador."
              icon={ChartNoAxesColumn}
              title="Respaldo continuo"
            />
          </div>
        </section>

        <Card className="flex flex-col justify-between p-8 sm:p-10 lg:p-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Bienvenido</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-text-primary">Accede a tu cuenta</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
              {isConfigured
                ? 'Inicia sesion para continuar o crea tu cuenta en unos segundos.'
                : 'Primero hay que completar la conexion de datos para habilitar el acceso.'}
            </p>

            <div className="mt-8">
              <AuthForm
                errorMessage={errorMessage}
                infoMessage={infoMessage}
                isSubmitting={isSubmitting || status === 'loading'}
                mode={mode}
                onModeChange={setMode}
                onSubmitLogin={handleLogin}
                onSubmitRegister={handleRegister}
              />
            </div>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-outline bg-panel-muted p-5">
            <p className="text-sm font-semibold text-text-primary">Privacidad por cuenta</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Cada sesion carga unicamente los movimientos, preferencias y reportes asociados a tu usuario.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

function Feature({ description, icon: Icon, title }: { description: string; icon: LucideIcon; title: string }) {
  return (
    <div className="rounded-[1.6rem] border border-outline bg-panel/80 p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 font-semibold text-text-primary">{title}</p>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
    </div>
  )
}

function resolveAuthError(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'No fue posible completar el acceso. Intenta nuevamente.'
}
