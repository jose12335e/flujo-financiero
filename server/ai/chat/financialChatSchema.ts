export const financialChatSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['answer', 'followUps'],
  properties: {
    answer: {
      type: 'string',
      minLength: 1,
    },
    followUps: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
} as const
