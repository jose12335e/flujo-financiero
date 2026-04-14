import { BrainCircuit, LoaderCircle } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageIntro } from '@/components/ui/PageIntro'
import { useTransactionOrganization } from '@/features/transaction-organization/hooks/useTransactionOrganization'
import { TransactionOrganizationSuggestionList } from '@/features/transaction-organization/components/TransactionOrganizationSuggestionList'

export function TransactionOrganizationPage() {
  const { actions, categories, selectors, state } = useTransactionOrganization()

  return (
    <div className="space-y-8">
      <PageIntro
        description="Revisa movimientos existentes para encontrar mejores categorias, posibles gastos fijos, duplicados o descripciones poco utiles."
        eyebrow="Clasificacion automatica"
        title="Organizar movimientos con ayuda de IA"
      >
        <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
          <span className="rounded-full border border-outline bg-panel px-3 py-2">Sin cambios automaticos</span>
          <span className="rounded-full border border-outline bg-panel px-3 py-2">Analisis local + IA opcional</span>
          <span className="rounded-full border border-outline bg-panel px-3 py-2">Abre cada movimiento para corregirlo manualmente</span>
        </div>
      </PageIntro>

      {selectors.sortedTransactions.length === 0 ? (
        <EmptyState
          description="Cuando registres movimientos, aqui podras revisar oportunidades de clasificacion y organizacion."
          icon={BrainCircuit}
          title="Todavia no hay movimientos para analizar"
        />
      ) : null}

      {selectors.sortedTransactions.length > 0 ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-[1.6rem] border border-outline bg-panel p-5 shadow-card">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">Revision</p>
              <h2 className="mt-2 text-2xl font-bold text-text-primary">Buscar sugerencias de organizacion</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Se analizaran {selectors.sortedTransactions.length} movimiento
                {selectors.sortedTransactions.length === 1 ? '' : 's'} sin modificar tus datos.
              </p>
            </div>
            <div className="flex gap-3">
              {state.status !== 'idle' ? (
                <Button onClick={actions.reset} variant="ghost">
                  Limpiar resultado
                </Button>
              ) : null}
              <Button disabled={state.status === 'processing'} onClick={actions.analyze}>
                {state.status === 'processing' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                {state.status === 'processing' ? 'Analizando...' : 'Analizar movimientos'}
              </Button>
            </div>
          </div>

          {state.status === 'idle' ? (
            <EmptyState
              description="Genera una revision para detectar reclasificaciones posibles, patrones repetidos y movimientos que merecen una mirada manual."
              icon={BrainCircuit}
              title="Analisis pendiente"
            />
          ) : null}

          {state.status === 'error' ? (
            <div className="rounded-[1.5rem] border border-danger/25 bg-danger-soft p-5 text-sm text-danger">{state.message}</div>
          ) : null}

          {state.status === 'ready' ? (
            <TransactionOrganizationSuggestionList categories={categories} result={state.result} />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
