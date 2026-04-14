import { useMemo } from 'react'

import { AI_MODULES } from '@/features/ai/constants/aiModules'
import { getAiClientConfig } from '@/lib/ai'

export function useAiAvailability() {
  const config = getAiClientConfig()

  return useMemo(
    () => ({
      enabled: config.enabled,
      apiBaseUrl: config.apiBaseUrl,
      modules: AI_MODULES,
      requestTimeoutMs: config.requestTimeoutMs,
    }),
    [config.apiBaseUrl, config.enabled, config.requestTimeoutMs],
  )
}

