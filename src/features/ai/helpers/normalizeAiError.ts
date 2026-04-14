import type { AiErrorPayload } from '@/features/ai/types/ai'

export function normalizeAiError(error: unknown, fallbackMessage = 'No pudimos completar la solicitud de IA.') {
  if (error instanceof Error) {
    return {
      code: 'AI_UNKNOWN_ERROR',
      message: error.message || fallbackMessage,
      recoverable: true,
    } satisfies AiErrorPayload
  }

  return {
    code: 'AI_UNKNOWN_ERROR',
    message: fallbackMessage,
    recoverable: true,
  } satisfies AiErrorPayload
}

