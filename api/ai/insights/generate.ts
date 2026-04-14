import { handleInsightsRequest, methodNotAllowed } from '../../../../server/http/routeHandlers.js'

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
}

export default async function handler(
  request: { method?: string; body?: unknown },
  response: { status: (code: number) => { json: (payload: unknown) => void } },
) {
  if (request.method !== 'POST') {
    const result = methodNotAllowed()
    response.status(result.status).json(result.body)
    return
  }

  const result = await handleInsightsRequest(request.body)
  response.status(result.status).json(result.body)
}
