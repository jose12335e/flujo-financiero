import { getHealthPayload } from '../server/http/routeHandlers.js'

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
}

export default function handler(_request: unknown, response: { status: (code: number) => { json: (payload: unknown) => void } }) {
  response.status(200).json(getHealthPayload())
}
