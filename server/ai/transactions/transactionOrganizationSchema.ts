export const transactionOrganizationSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['suggestions'],
  properties: {
    summary: {
      type: 'string',
    },
    suggestions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['kind', 'transactionId', 'title', 'description', 'confidence'],
        properties: {
          kind: {
            type: 'string',
            enum: ['category', 'fixed-expense', 'duplicate', 'description'],
          },
          transactionId: {
            type: 'string',
          },
          relatedTransactionIds: {
            type: 'array',
            items: { type: 'string' },
          },
          title: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          confidence: {
            type: 'number',
            minimum: 0,
            maximum: 1,
          },
          suggestedCategoryId: {
            type: 'string',
          },
          reasoning: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
  },
} as const
