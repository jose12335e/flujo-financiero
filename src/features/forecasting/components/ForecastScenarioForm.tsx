import { Card } from '@/components/ui/Card'
import type { ForecastScenario, ForecastScenarioPreset } from '@/features/forecasting/types/financialForecast'

interface ForecastScenarioFormProps {
  onApplyPreset: (presetId: string) => void
  onReset: () => void
  onUpdate: (key: keyof ForecastScenario, value: number) => void
  presets: ForecastScenarioPreset[]
  scenario: ForecastScenario
}

function NumericField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-text-primary">{label}</span>
      <input
        className="w-full rounded-[1.1rem] border border-outline bg-app-bg px-4 py-3 text-sm text-text-primary outline-none transition focus:border-brand/40"
        min="0"
        onChange={(event) => onChange(Number(event.target.value))}
        step="0.01"
        type="number"
        value={value}
      />
    </label>
  )
}

export function ForecastScenarioForm({
  onApplyPreset,
  onReset,
  onUpdate,
  presets,
  scenario,
}: ForecastScenarioFormProps) {
  return (
    <Card className="h-full p-4 sm:p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">Escenario</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-text-primary">Simula cambios puntuales</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Ajusta ingresos, gastos, ahorro o abonos a deuda para ver como cambiaria tu cierre estimado.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            className="rounded-full border border-outline bg-panel-muted px-3 py-2 text-xs font-medium text-text-secondary transition hover:border-brand/40 hover:text-text-primary"
            onClick={() => onApplyPreset(preset.id)}
            type="button"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <NumericField
          label="Ingreso extra"
          onChange={(value) => onUpdate('extraIncome', value)}
          value={scenario.extraIncome}
        />
        <NumericField
          label="Gasto extra"
          onChange={(value) => onUpdate('extraExpense', value)}
          value={scenario.extraExpense}
        />
        <NumericField
          label="Abono extra a deuda"
          onChange={(value) => onUpdate('extraDebtPayment', value)}
          value={scenario.extraDebtPayment}
        />
        <NumericField
          label="Ahorro a separar"
          onChange={(value) => onUpdate('savingsGoal', value)}
          value={scenario.savingsGoal}
        />
      </div>

      <div className="mt-5">
        <button
          className="rounded-[1.1rem] border border-outline px-4 py-3 text-sm font-semibold text-text-secondary transition hover:border-brand/40 hover:text-text-primary"
          onClick={onReset}
          type="button"
        >
          Reiniciar escenario
        </button>
      </div>
    </Card>
  )
}
