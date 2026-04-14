import { getAiClientConfig } from '@/lib/ai'
import { normalizeAiError } from '@/features/ai/helpers/normalizeAiError'
import type { AiBackendResponse, AiModuleKey } from '@/features/ai/types/ai'
import type { AiRequestForModule, AiResponseForModule } from '@/features/ai/contracts/aiContracts'

export class AiClientConfigurationError extends Error {}

function createAbortTimeout(timeoutMs: number) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  return {
    controller,
    cleanup: () => window.clearTimeout(timeoutId),
  }
}

export async function postAiRequest<TKey extends AiModuleKey>(
  module: TKey,
  endpoint: string,
  body: AiRequestForModule<TKey>,
): Promise<AiBackendResponse<AiResponseForModule<TKey>>> {
  const config = getAiClientConfig()

  if (!config.enabled) {
    throw new AiClientConfigurationError('La base de IA no esta configurada en este entorno.')
  }

  const { cleanup, controller } = createAbortTimeout(config.requestTimeoutMs)

  try {
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-Module': module,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!response.ok) {
      return {
        ok: false,
        error: {
          code: 'AI_PROVIDER_ERROR',
          message: 'No pudimos obtener una respuesta valida del servicio de IA.',
          recoverable: true,
        },
      }
    }

    const payload = (await response.json()) as AiBackendResponse<AiResponseForModule<TKey>>
    return payload
  } catch (error) {
    return {
      ok: false,
      error: normalizeAiError(error, 'La conexion con el servicio de IA no esta disponible en este momento.'),
    }
  } finally {
    cleanup()
  }
}

