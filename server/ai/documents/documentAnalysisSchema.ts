export const documentAnalysisSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['documentType', 'confidence', 'extracted'],
  properties: {
    documentType: {
      type: 'string',
      enum: ['payslip', 'receipt', 'transfer', 'unknown'],
    },
    confidence: {
      type: 'number',
      minimum: 0,
      maximum: 1,
    },
    summary: {
      type: 'string',
    },
    extracted: {
      type: 'object',
      additionalProperties: false,
      properties: {
        grossSalary: { type: 'number' },
        netSalary: { type: 'number' },
        date: { type: 'string' },
        period: { type: 'string' },
        company: { type: 'string' },
        employeeCode: { type: 'string' },
        employeeName: { type: 'string' },
        department: { type: 'string' },
        position: { type: 'string' },
        municipality: { type: 'string' },
        bankAccount: { type: 'string' },
        deductions: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'amount'],
            properties: {
              name: { type: 'string' },
              amount: { type: 'number' },
            },
          },
        },
      },
    },
    debugReasons: {
      type: 'array',
      items: { type: 'string' },
    },
  },
} as const
