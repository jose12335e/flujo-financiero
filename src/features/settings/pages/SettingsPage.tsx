import { useState } from 'react'
import { AlertTriangle, DatabaseZap, MoonStar, Paintbrush2, ServerCog, SunMedium } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageIntro } from '@/components/ui/PageIntro'
import { SyncStatusBadge } from '@/components/ui/SyncStatusBadge'
import { currencyOptions } from '@/data/currencies'
import { useFinanceStore } from '@/hooks/useFinanceStore'
import { useTheme } from '@/hooks/useTheme'
import { getCurrentMonthKey } from '@/utils/finance'

const fieldClasses =
  'min-h-12 w-full rounded-2xl border border-outline bg-app-bg px-4 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand'

export function SettingsPage() {
  const { actions, meta, state } = useFinanceStore()
  const { theme, setTheme } = useTheme()
  const [feedback, setFeedback] = useState('')
  const isConfigured = meta.syncState.isConfigured
  const isSyncedAccount = meta.syncState.mode === 'supabase' && meta.syncState.phase === 'ready'

  const handleSaveCurrency = (formData: FormData) => {
    const selectedCurrency = formData.get('currency')?.toString() ?? state.currency
    actions.setCurrency(selectedCurrency)
    setFeedback(
      meta.syncState.mode === 'supabase'
        ? 'Preferencias actualizadas correctamente.'
        : 'Preferencias actualizadas en este equipo.',
    )
  }

  const handleSaveBudget = (formData: FormData) => {
    const parsedLimit = Number(formData.get('budgetLimit') ?? state.monthlyBudget.limit)
    const parsedThreshold = Number(formData.get('warningThreshold') ?? Math.round(state.monthlyBudget.warningThreshold * 100))

    if (
      Number.isNaN(parsedLimit) ||
      parsedLimit < 0 ||
      Number.isNaN(parsedThreshold) ||
      parsedThreshold < 0 ||
      parsedThreshold > 100
    ) {
      setFeedback('Revisa el limite y el porcentaje de alerta antes de guardar.')
      return
    }

    actions.setMonthlyBudget({
      monthKey: getCurrentMonthKey(),
      limit: parsedLimit,
      warningThreshold: parsedThreshold / 100,
    })
    setFeedback(
      meta.syncState.mode === 'supabase'
        ? 'Presupuesto actualizado correctamente.'
        : 'Presupuesto actualizado en este equipo.',
    )
  }

  const handleReset = () => {
    const confirmed = window.confirm(
      'Se eliminaran tus movimientos y filtros guardados. Esta accion no se puede deshacer. Deseas continuar?',
    )

    if (confirmed) {
      actions.resetFinanceData()
      setFeedback(
        meta.syncState.mode === 'supabase'
          ? 'Se restablecio la informacion financiera de esta cuenta.'
          : 'Se restablecio la informacion financiera guardada en este equipo.',
      )
    }
  }

  const handleThemeChange = (nextTheme: 'light' | 'dark') => {
    setTheme(nextTheme)
    setFeedback(meta.syncState.mode === 'supabase' ? 'Tema actualizado correctamente.' : 'Tema actualizado en este equipo.')
  }

  return (
    <div className="space-y-8">
      <PageIntro
        description="Administra la experiencia de tu cuenta, el presupuesto mensual y el estado de sincronizacion."
        eyebrow="Preferencias"
        title="Preferencias de la cuenta"
      />

      {feedback ? (
        <div className="rounded-[1.6rem] border border-outline bg-panel p-4 text-sm text-text-secondary shadow-card">
          {feedback}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <ServerCog className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">Estado de sincronizacion</h2>
              <p className="text-sm text-text-secondary">
                Comprueba si tu cuenta esta guardando y recuperando informacion correctamente.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <SyncStatusBadge showMessage={false} syncState={meta.syncState} />
            <p className="text-sm leading-6 text-text-secondary">{meta.syncState.message}</p>

            <div className="rounded-[1.5rem] border border-outline bg-panel-muted p-4">
              <p className="text-sm font-semibold text-text-primary">
                {!isConfigured ? 'Configuracion pendiente' : isSyncedAccount ? 'Cuenta con respaldo activo' : 'Revision recomendada'}
              </p>
              <div className="mt-3 space-y-2 text-sm text-text-secondary">
                {!isConfigured ? (
                  <>
                    <p>1. Crea un archivo `.env` a partir de `.env.example`.</p>
                    <p>2. Completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.</p>
                    <p>3. Ejecuta el SQL de `supabase/schema.sql` en tu proyecto.</p>
                    <p>4. En Supabase Auth, deja activo Email y agrega `http://127.0.0.1:5173` como Site URL.</p>
                  </>
                ) : isSyncedAccount ? (
                  <>
                    <p>Tus movimientos, presupuesto y preferencias quedan asociados a tu cuenta.</p>
                    <p>Puedes volver a iniciar sesion y recuperar la misma informacion sin depender de un solo navegador.</p>
                  </>
                ) : (
                  <>
                    <p>La app sigue disponible y tus cambios permanecen guardados en este equipo.</p>
                    <p>Conviene revisar la conexion para mantener tu historial actualizado tambien en la cuenta.</p>
                  </>
                )}
              </div>
            </div>

            {isConfigured ? (
              <div className="flex justify-end">
                <Button onClick={actions.retrySync} variant="secondary">
                  Actualizar estado
                </Button>
              </div>
            ) : null}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <Paintbrush2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">Apariencia y moneda</h2>
              <p className="text-sm text-text-secondary">Define el tema visual y la moneda de referencia de la cuenta.</p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-text-primary">Tema</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  className={`rounded-[1.5rem] border p-4 text-left transition ${
                    theme === 'light'
                      ? 'border-brand bg-brand-soft text-brand'
                      : 'border-outline bg-panel-muted text-text-secondary'
                  }`}
                  onClick={() => handleThemeChange('light')}
                  type="button"
                >
                  <SunMedium className="h-5 w-5" />
                  <p className="mt-3 font-semibold">Modo claro</p>
                  <p className="mt-1 text-sm">Una interfaz luminosa y limpia para el trabajo diario.</p>
                </button>
                <button
                  className={`rounded-[1.5rem] border p-4 text-left transition ${
                    theme === 'dark'
                      ? 'border-brand bg-brand-soft text-brand'
                      : 'border-outline bg-panel-muted text-text-secondary'
                  }`}
                  onClick={() => handleThemeChange('dark')}
                  type="button"
                >
                  <MoonStar className="h-5 w-5" />
                  <p className="mt-3 font-semibold">Modo oscuro</p>
                  <p className="mt-1 text-sm">Mas contraste y descanso visual en entornos de poca luz.</p>
                </button>
              </div>
            </div>

            <form
              key={`currency-${state.currency}`}
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault()
                handleSaveCurrency(new FormData(event.currentTarget))
              }}
            >
              <label className="space-y-2">
                <span className="text-sm font-semibold text-text-primary">Moneda</span>
                <select className={fieldClasses} defaultValue={state.currency} name="currency">
                  {currencyOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex justify-end">
                <Button type="submit">Guardar preferencias</Button>
              </div>
            </form>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warning-soft text-warning">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">Presupuesto mensual</h2>
              <p className="text-sm text-text-secondary">Define el limite del mes y el umbral de alerta anticipada.</p>
            </div>
          </div>

          <form
            key={`budget-${state.monthlyBudget.limit}-${state.monthlyBudget.warningThreshold}`}
            className="mt-6 space-y-6"
            onSubmit={(event) => {
              event.preventDefault()
              handleSaveBudget(new FormData(event.currentTarget))
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-text-primary">Limite mensual</span>
                <input
                  className={fieldClasses}
                  defaultValue={state.monthlyBudget.limit}
                  min="0"
                  name="budgetLimit"
                  step="0.01"
                  type="number"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-text-primary">Alerta previa (%)</span>
                <input
                  className={fieldClasses}
                  defaultValue={Math.round(state.monthlyBudget.warningThreshold * 100)}
                  max="100"
                  min="1"
                  name="warningThreshold"
                  type="number"
                />
              </label>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Guardar presupuesto</Button>
            </div>
          </form>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-danger-soft text-danger">
              <DatabaseZap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">Restablecer informacion</h2>
              <p className="text-sm text-text-secondary">
                Elimina los datos financieros guardados y vuelve a empezar desde cero.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-outline bg-panel-muted p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-text-secondary">
              Esta accion elimina ingresos, gastos y filtros guardados. Si la sincronizacion esta activa, el cambio
              tambien se reflejara en tu cuenta.
            </p>
            <Button onClick={handleReset} variant="danger">
              Restablecer datos
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
