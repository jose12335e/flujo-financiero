export const financialForecastSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['projectedBalance', 'explanation', 'riskLevel'],
  properties: {
    projectedBalance: {
      type: 'number',
    },
    explanation: {
      type: 'string',
      minLength: 1,
    },
    riskLevel: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
    },
  },
} as const
