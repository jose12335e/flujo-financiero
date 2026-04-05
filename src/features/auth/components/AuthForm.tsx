import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'

type AuthMode = 'login' | 'register'

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo valido.'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres.'),
})

const registerSchema = loginSchema
  .extend({
    confirmPassword: z.string().min(6, 'Confirma la contrasena.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contrasenas no coinciden.',
    path: ['confirmPassword'],
  })

type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>
type AuthFormValues = {
  confirmPassword: string
  email: string
  password: string
}

interface AuthFormProps {
  errorMessage: string
  infoMessage: string
  isSubmitting: boolean
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  onSubmitLogin: (values: LoginValues) => Promise<void>
  onSubmitRegister: (values: RegisterValues) => Promise<void>
}

const fieldClasses =
  'min-h-12 w-full rounded-2xl border border-outline bg-app-bg px-4 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand'

export function AuthForm({
  errorMessage,
  infoMessage,
  isSubmitting,
  mode,
  onModeChange,
  onSubmitLogin,
  onSubmitRegister,
}: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isRegister = mode === 'register'

  const form = useForm<AuthFormValues>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    form.reset()
    form.clearErrors()
  }, [form, mode])

  const handleSubmit = form.handleSubmit(async (values) => {
    form.clearErrors()

    if (isRegister) {
      const result = registerSchema.safeParse(values)

      if (!result.success) {
        for (const issue of result.error.issues) {
          const field = issue.path[0]

          if (field === 'email' || field === 'password' || field === 'confirmPassword') {
            form.setError(field, { message: issue.message, type: 'manual' })
          }
        }

        return
      }

      await onSubmitRegister(result.data)
      return
    }

    const result = loginSchema.safeParse(values)

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0]

        if (field === 'email' || field === 'password' || field === 'confirmPassword') {
          form.setError(field, { message: issue.message, type: 'manual' })
        }
      }

      return
    }

    await onSubmitLogin(result.data)
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 rounded-[1.5rem] bg-panel-muted p-1">
        <button
          className={`rounded-[1.2rem] px-4 py-3 text-sm font-semibold transition ${
            mode === 'login' ? 'bg-panel text-text-primary shadow-sm' : 'text-text-secondary'
          }`}
          onClick={() => onModeChange('login')}
          type="button"
        >
          Iniciar sesion
        </button>
        <button
          className={`rounded-[1.2rem] px-4 py-3 text-sm font-semibold transition ${
            mode === 'register' ? 'bg-panel text-text-primary shadow-sm' : 'text-text-secondary'
          }`}
          onClick={() => onModeChange('register')}
          type="button"
        >
          Crear cuenta
        </button>
      </div>

      {infoMessage ? (
        <div className="rounded-[1.4rem] border border-success bg-success-soft p-4 text-sm text-success">
          {infoMessage}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-[1.4rem] border border-danger bg-danger-soft p-4 text-sm text-danger">
          {errorMessage}
        </div>
      ) : null}

      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <label className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Mail className="h-4 w-4 text-text-muted" />
            Correo electronico
          </span>
          <input
            autoComplete="email"
            autoFocus
            className={fieldClasses}
            placeholder="nombre@empresa.com"
            type="email"
            {...form.register('email')}
          />
          <FieldError message={form.formState.errors.email?.message} />
        </label>

        <label className="space-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Lock className="h-4 w-4 text-text-muted" />
            Contrasena
          </span>
          <div className="relative">
            <input
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className={`${fieldClasses} pr-12`}
              placeholder="Ingresa tu contrasena"
              type={showPassword ? 'text' : 'password'}
              {...form.register('password')}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-text-muted hover:bg-panel-muted"
              onClick={() => setShowPassword((value) => !value)}
              type="button"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FieldError message={form.formState.errors.password?.message} />
        </label>

        {isRegister ? (
          <label className="space-y-2">
            <span className="text-sm font-semibold text-text-primary">Confirmar contrasena</span>
            <input
              autoComplete="new-password"
              className={fieldClasses}
              placeholder="Confirma tu contrasena"
              type={showPassword ? 'text' : 'password'}
              {...form.register('confirmPassword')}
            />
            <FieldError message={form.formState.errors.confirmPassword?.message} />
          </label>
        ) : null}

        <Button disabled={isSubmitting} fullWidth size="lg" type="submit">
          {isSubmitting
            ? mode === 'login'
              ? 'Entrando...'
              : 'Creando cuenta...'
            : mode === 'login'
              ? 'Entrar'
              : 'Crear cuenta'}
        </Button>
      </form>
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-sm text-danger">{message}</p>
}
