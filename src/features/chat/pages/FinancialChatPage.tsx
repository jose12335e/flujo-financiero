import { Bot } from 'lucide-react'

import { EmptyState } from '@/components/ui/EmptyState'
import { PageIntro } from '@/components/ui/PageIntro'
import { ChatComposer } from '@/features/chat/components/ChatComposer'
import { ChatMessageList } from '@/features/chat/components/ChatMessageList'
import { useFinancialChat } from '@/features/chat/hooks/useFinancialChat'

export function FinancialChatPage() {
  const { actions, selectors, state } = useFinancialChat()

  return (
    <div className="space-y-8">
      <PageIntro
        description="Haz preguntas en lenguaje natural sobre tus datos actuales. El asistente usa tus registros reales como base y no ejecuta ningun cambio financiero por si solo."
        eyebrow="Asistente financiero IA"
        title="Chat con tus finanzas"
      >
        <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
          <span className="rounded-full border border-outline bg-panel px-3 py-2">Sin cambios automaticos</span>
          <span className="rounded-full border border-outline bg-panel px-3 py-2">Respuestas con tus datos actuales</span>
          <span className="rounded-full border border-outline bg-panel px-3 py-2">IA opcional con fallback local</span>
        </div>
      </PageIntro>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <ChatMessageList onQuestionClick={actions.sendMessage} state={state} />

        <div className="space-y-6">
          <ChatComposer
            isProcessing={state.status === 'processing'}
            onReset={actions.reset}
            onSend={actions.sendMessage}
            suggestedQuestions={selectors.suggestedQuestions}
          />

          <EmptyState
            description="Prueba preguntas como: En que gaste mas este mes, cuanto me queda libre, comparame este mes con el pasado o cuanto debo actualmente."
            icon={Bot}
            title="Consultas sugeridas"
          />
        </div>
      </div>
    </div>
  )
}
