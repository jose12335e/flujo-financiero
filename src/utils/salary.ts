import type {
  SalaryDeduction,
  SalaryDeductionFrequency,
  SalaryPaymentFormValues,
  SalaryProfile,
  SalarySummary,
  Transaction,
} from '@/types/finance'

const PERIODS_PER_MONTH = {
  monthly: 1,
  biweekly: 26 / 12,
  weekly: 52 / 12,
} as const

export function getSalaryPeriodsPerMonth(payFrequency: SalaryProfile['payFrequency']) {
  return PERIODS_PER_MONTH[payFrequency]
}

export function calculateSalarySummary(profile: SalaryProfile | null, deductions: SalaryDeduction[]): SalarySummary | null {
  if (!profile) {
    return null
  }

  const periodsPerMonth = getSalaryPeriodsPerMonth(profile.payFrequency)
  const grossPerPeriod = profile.grossSalary + profile.bonuses + profile.overtimePay + profile.otherIncome
  const grossMonthlyEstimate = grossPerPeriod * periodsPerMonth
  const activeDeductions = deductions.filter((deduction) => deduction.isActive)

  const totalDeductionsPerPeriod = activeDeductions.reduce((sum, deduction) => {
    return sum + getDeductionAmountForPeriod(deduction, grossPerPeriod, grossMonthlyEstimate, periodsPerMonth)
  }, 0)

  const totalDeductionsMonthly = totalDeductionsPerPeriod * periodsPerMonth
  const netPerPeriod = Math.max(grossPerPeriod - totalDeductionsPerPeriod, 0)
  const netMonthlyEstimate = Math.max(grossMonthlyEstimate - totalDeductionsMonthly, 0)

  return {
    grossPerPeriod,
    grossMonthlyEstimate,
    totalDeductionsPerPeriod,
    totalDeductionsMonthly,
    netPerPeriod,
    netMonthlyEstimate,
    activeDeductionsCount: activeDeductions.length,
  }
}

export function getSalaryDeductionAmount(
  deduction: SalaryDeduction,
  grossPerPeriod: number,
  grossMonthlyEstimate: number,
  periodsPerMonth: number,
) {
  return getDeductionAmountForPeriod(deduction, grossPerPeriod, grossMonthlyEstimate, periodsPerMonth)
}

export function createSalaryPaymentTransaction(
  profile: SalaryProfile,
  deductions: SalaryDeduction[],
  values: SalaryPaymentFormValues,
  timestamp: string,
): Transaction {
  const summary = calculateSalarySummary(profile, deductions)
  const netAmount = summary?.netPerPeriod ?? 0

  return {
    id: crypto.randomUUID(),
    type: 'income',
    amount: netAmount,
    categoryId: 'salary',
    description: values.description.trim() || 'Pago de sueldo neto',
    date: values.paymentDate,
    createdAt: timestamp,
    updatedAt: timestamp,
    source: 'salary_payment',
    recurringRuleId: null,
    scheduledFor: null,
    debtId: null,
  }
}

function getDeductionAmountForPeriod(
  deduction: SalaryDeduction,
  grossPerPeriod: number,
  grossMonthlyEstimate: number,
  periodsPerMonth: number,
) {
  const baseAmount =
    deduction.type === 'percentage'
      ? (deduction.frequency === 'monthly' ? grossMonthlyEstimate : grossPerPeriod) * (deduction.value / 100)
      : deduction.value

  return normalizeFrequency(baseAmount, deduction.frequency, periodsPerMonth)
}

function normalizeFrequency(amount: number, frequency: SalaryDeductionFrequency, periodsPerMonth: number) {
  if (frequency === 'monthly') {
    return amount / periodsPerMonth
  }

  return amount
}
