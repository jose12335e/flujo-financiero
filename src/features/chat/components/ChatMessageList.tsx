import { Bot, LoaderCircle, User } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { FinancialChatMessage, FinancialChatState } from '@/features/chat/types/financialChat'

interface ChatMessageListProps {
  state: FinancialChatState
  onQuestionClick: (question: string) => void
}

function getSourceLabel(source: FinancialChatMessage['source']) {
  if (source === 'hybrid') {
    return 'IA + datos'
  }

  if (source === 'ai') {
    return 'IA'
  }

  return 'Datos actuales'
}

export function ChatMessageList({ onQuestionClick, state }: ChatMessageListProps) {
  return (
    <Card className="flex h-full flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">Conversacion</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-text-primary">Preguntas sobre tus datos</h2>
        </div>

        {state.status === 'processing' ? (
          <Badge variant="neutral">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            Respondiendo
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {state.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-[1.5rem] border px-4 py-3 shadow-card ${
                message.role === 'user'
                  ? 'border-brand/20 bg-brand text-white'
                  : 'border-outline bg-panel-muted text-text-primary'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
                {message.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                <span>{message.role === 'user' ? 'Tu' : 'Asistente'}</span>
                {message.role === 'assistant' && message.source ? (
                  <Badge variant="neutral">{getSourceLabel(message.source)}</Badge>
                ) : null}
              </div>

              <p className="mt-2 text-sm leading-6">{message.content}</p>

              {message.role === 'assistant' && message.followUps?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.followUps.map((question) => (
                    <button
                      key={question}
                      className="rounded-full border border-outline bg-app-bg px-3 py-2 text-xs font-medium text-text-secondary transition hover:border-brand/40 hover:text-text-primary"
                      onClick={() => onQuestionClick(question)}
                      type="button"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {state.status === 'error' ? (
        <div className="rounded-[1.4rem] border border-danger/25 bg-danger-soft p-4 text-sm text-danger">
          {state.message}
        </div>
      ) : null}
    </Card>
  )
}
