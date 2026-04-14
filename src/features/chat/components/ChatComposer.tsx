import { Sparkles } from 'lucide-react'
import { useState } from 'react'

import { buttonStyles } from '@/components/ui/buttonStyles'
import { Card } from '@/components/ui/Card'

interface ChatComposerProps {
  isProcessing: boolean
  onReset: () => void
  onSend: (question: string) => Promise<void> | void
  suggestedQuestions: string[]
}

export function ChatComposer({
  isProcessing,
  onReset,
  onSend,
  suggestedQuestions,
}: ChatComposerProps) {
  const [question, setQuestion] = useState('')

  const handleSend = async () => {
    const trimmedQuestion = question.trim()

    if (!trimmedQuestion || isProcessing) {
      return
    }

    await onSend(trimmedQuestion)
    setQuestion('')
  }

  return (
    <Card className="flex h-full flex-col gap-5 p-4 sm:p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">Nueva consulta</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-text-primary">Pregunta en lenguaje natural</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Puedes preguntar por tu presupuesto, tus deudas, el sueldo neto estimado o comparar este mes con el anterior.
        </p>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-text-primary">Tu pregunta</span>
        <textarea
          className="min-h-32 w-full rounded-[1.4rem] border border-outline bg-app-bg px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-brand/40"
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ejemplo: En que gaste mas este mes y cuanto me queda libre?"
          value={question}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {suggestedQuestions.map((suggestion) => (
          <button
            key={suggestion}
            className="rounded-full border border-outline bg-panel-muted px-3 py-2 text-xs font-medium text-text-secondary transition hover:border-brand/40 hover:text-text-primary"
            onClick={() => setQuestion(suggestion)}
            type="button"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className={`${buttonStyles({ size: 'lg' })} w-full sm:flex-1`}
          disabled={isProcessing || !question.trim()}
          onClick={handleSend}
          type="button"
        >
          <Sparkles className="h-4 w-4" />
          {isProcessing ? 'Consultando...' : 'Preguntar'}
        </button>

        <button
          className="w-full rounded-[1.1rem] border border-outline px-4 py-3 text-sm font-semibold text-text-secondary transition hover:border-brand/40 hover:text-text-primary sm:w-auto"
          onClick={onReset}
          type="button"
        >
          Reiniciar
        </button>
      </div>
    </Card>
  )
}
