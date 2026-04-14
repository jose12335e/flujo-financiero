import { LoaderCircle, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { TransactionDraftState } from '@/features/transaction-drafts/types/transactionDraft'

interface TransactionTextInputCardProps {
  state: TransactionDraftState
  canAnalyze: boolean
  onAnalyze: () => void
  onInputChange: (value: string) => void
  onReset: () => void
}

export function TransactionTextInputCard({
  state,
  canAnalyze,
  onAnalyze,
  onInputChange,
  onReset,
}: TransactionTextInputCardProps) {
  const isProcessing = state.status === 'processing'
  const input = state.input

  return (
    <Card className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Registro inteligente</p>
          <h2 className="mt-2 text-2xl font-bold text-text-primary">Describe el movimiento en lenguaje natural</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Ejemplos: “Gasté 850 en comida ayer”, “Me pagaron 12000 extra” o “Pagué 3000 de la tarjeta”.
          </p>
        </div>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-text-primary">Texto libre</span>
        <textarea
          className="min-h-[180px] w-full rounded-[1.6rem] border border-outline bg-app-bg px-4 py-4 text-sm leading-6 text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand"
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="Escribe aqui lo que paso con tus propias palabras..."
          value={input}
        />
      </label>

      {state.status === 'error' ? (
        <div className="rounded-[1.4rem] border border-danger/25 bg-danger-soft p-4 text-sm text-danger">{state.message}</div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button onClick={onReset} variant="ghost">
          Limpiar
        </Button>
        <Button disabled={!canAnalyze} onClick={onAnalyze}>
          {isProcessing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          {isProcessing ? 'Analizando...' : 'Generar sugerencia'}
        </Button>
      </div>
    </Card>
  )
}
