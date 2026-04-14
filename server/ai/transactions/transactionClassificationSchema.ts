export const transactionClassificationSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['confidence'],
  properties: {
    type: {
      type: 'string',
      enum: ['income', 'expense'],
    },
    amount: {
      type: 'number',
    },
    categoryId: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    date: {
      type: 'string',
    },
    confidence: {
      type: 'number',
      minimum: 0,
      maximum: 1,
    },
    reasoning: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
} as const
