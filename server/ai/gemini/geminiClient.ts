const DEFAULT_GEMINI_MODEL = process.env.AI_GEMINI_MODEL || 'gemini-2.5-flash'

export interface GeminiGenerateJsonParams {
  prompt: string
  schema?: unknown
}

export async function generateGeminiJson<TResponse>(params: GeminiGenerateJsonParams): Promise<TResponse> {
  const apiKey = process.env.AI_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('AI_GEMINI_API_KEY is not configured for the AI backend.')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(DEFAULT_GEMINI_MODEL)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: params.prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          ...(params.schema ? { responseJsonSchema: params.schema } : {}),
        },
      }),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`)
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string
        }>
      }
    }>
  }

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim()

  if (!text) {
    throw new Error(`Gemini returned an empty structured response for model ${DEFAULT_GEMINI_MODEL}.`)
  }

  try {
    return JSON.parse(text) as TResponse
  } catch {
    throw new Error(`Gemini returned invalid JSON for model ${DEFAULT_GEMINI_MODEL}.`)
  }
}
