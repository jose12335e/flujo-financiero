import { Calculator } from 'lucide-react'

import { EmptyState } from '@/components/ui/EmptyState'
import { PageIntro } from '@/components/ui/PageIntro'
import { ForecastResultCard } from '@/features/forecasting/components/ForecastResultCard'
import { ForecastScenarioForm } from '@/features/forecasting/components/ForecastScenarioForm'
import { useFinancialForecast } from '@/features/forecasting/hooks/useFinancialForecast'
import { useFinanceStore } from '@/hooks/useFinanceStore'

export function FinancialForecastPage() {
  const { state: financeState } = useFinanceStore()
  const { actions, scenario, selectors, state } = useFinancialForecast()

  return (
    <div className="space-y-8">
      <PageIntro
        description="Simula escenarios sin cambiar tus datos reales. Ajusta ingresos, gastos, ahorro o pagos de deuda y revisa como cambiaria tu cierre estimado."
        eyebrow="Proyecciones financieras IA"
        title="Simulaciones y escenarios"
      >
        <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
          <span className="rounded-full border border-outline bg-panel px-3 py-2">Sin cambios automaticos</span>
          <span className="rounded-full border border-outline bg-panel px-3 py-2">Escenario base + simulacion</span>
          <span className="rounded-full border border-outline bg-panel px-3 py-2">IA opcional con fallback local</span>
        </div>
      </PageIntro>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <ForecastScenarioForm
          onApplyPreset={actions.applyPreset}
          onReset={actions.resetScenario}
          onUpdate={actions.updateScenario}
          presets={selectors.scenarioPresets}
          scenario={scenario}
        />

        <ForecastResultCard currency={financeState.currency} state={state} />
      </div>

      <EmptyState
        description="Usa esta vista para responder preguntas como: que pasa si recibo un bono, si adelanto deuda o si separo ahorro este mes. Tus movimientos reales no se modifican."
        icon={Calculator}
        title="Simulacion segura"
      />
    </div>
  )
}
