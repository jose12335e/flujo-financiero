import type { AiEndpointContext, AiModuleKey, AiRequestMeta } from '@/features/ai/types/ai'

export function createAiRequestMeta(module: AiModuleKey, context: AiEndpointContext = {}): AiRequestMeta {
  return {
    requestId: crypto.randomUUID(),
    module,
    locale: context.locale ?? navigator.language,
    timezone: context.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    userId: context.userId,
  }
}

