export const financialInsightsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'insights'],
  properties: {
    summary: {
      type: 'string',
    },
    insights: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    riskFlags: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
} as const
