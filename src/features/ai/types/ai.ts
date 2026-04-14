export type AiModuleKey =
  | 'documents'
  | 'transaction-classifier'
  | 'transaction-organization'
  | 'insights'
  | 'recommendations'
  | 'chat'
  | 'forecasting'

export type AiRequestStatus = 'idle' | 'loading' | 'success' | 'error'

export type AiProviderName = 'gemini' | 'stub'

export type AiExecutionMode = 'disabled' | 'available'

export interface AiModuleDefinition {
  key: AiModuleKey
  label: string
  description: string
  route: string
}

export interface AiClientConfig {
  apiBaseUrl: string
  enabled: boolean
  requestTimeoutMs: number
}

export interface AiEndpointContext {
  locale?: string
  timezone?: string
  userId?: string
}

export interface AiRequestMeta {
  requestId: string
  module: AiModuleKey
  locale?: string
  timezone?: string
  userId?: string
}

export interface AiResponseMeta {
  requestId: string
  module: AiModuleKey
  provider: AiProviderName
  model: string
  durationMs?: number
}

export interface AiErrorPayload {
  code:
    | 'AI_NOT_CONFIGURED'
    | 'AI_NETWORK_ERROR'
    | 'AI_INVALID_REQUEST'
    | 'AI_RESPONSE_INVALID'
    | 'AI_PROVIDER_ERROR'
    | 'AI_UNKNOWN_ERROR'
  message: string
  recoverable: boolean
}

export interface AiSuccessResponse<TData> {
  ok: true
  data: TData
  meta: AiResponseMeta
}

export interface AiFailureResponse {
  ok: false
  error: AiErrorPayload
  meta?: Partial<AiResponseMeta>
}

export type AiBackendResponse<TData> = AiSuccessResponse<TData> | AiFailureResponse
