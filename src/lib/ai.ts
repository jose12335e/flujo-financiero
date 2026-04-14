import { AI_DEFAULT_REQUEST_TIMEOUT_MS } from '@/features/ai/constants/aiModules'
import type { AiClientConfig } from '@/features/ai/types/ai'

const aiApiBaseUrl = import.meta.env.VITE_AI_API_BASE_URL?.trim() ?? ''
const aiRequestTimeout = Number(import.meta.env.VITE_AI_REQUEST_TIMEOUT_MS ?? AI_DEFAULT_REQUEST_TIMEOUT_MS)

export function getAiClientConfig(): AiClientConfig {
  const resolvedApiBaseUrl = aiApiBaseUrl

  return {
    apiBaseUrl: resolvedApiBaseUrl,
    enabled: Boolean(resolvedApiBaseUrl) || import.meta.env.DEV,
    requestTimeoutMs: Number.isFinite(aiRequestTimeout) && aiRequestTimeout > 0 ? aiRequestTimeout : AI_DEFAULT_REQUEST_TIMEOUT_MS,
  }
}
