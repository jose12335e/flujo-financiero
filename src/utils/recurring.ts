import { endOfDay, format, parseISO } from 'date-fns'

import { UPCOMING_RECURRING_LIMIT } from '@/utils/constants'
import type { RecurringFrequency, RecurringRule, RecurringRuleFormValues } from '@/types/finance'

export function detectBrowserTimeZone() {
  if (typeof Intl === 'undefined' || typeof Intl.DateTimeFormat !== 'function') {
    return 'UTC'
  }

  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export function createDefaultRunTime() {
  return '09:00'
}

export function combineLocalDateAndTime(date: string, time: string) {
  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)

  return new Date(year, (month ?? 1) - 1, day ?? 1, hours ?? 0, minutes ?? 0, 0, 0)
}

function addMonthsClamped(date: Date, months: number) {
  const targetMonthIndex = date.getMonth() + months
  const targetYear = date.getFullYear() + Math.floor(targetMonthIndex / 12)
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12
  const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate()

  return new Date(
    targetYear,
    targetMonth,
    Math.min(date.getDate(), lastDayOfTargetMonth),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  )
}

function addByFrequency(date: Date, frequency: RecurringFrequency, intervalValue: number) {
  const next = new Date(date)

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + intervalValue)
      return next
    case 'weekly':
      next.setDate(next.getDate() + intervalValue * 7)
      return next
    case 'monthly':
      return addMonthsClamped(next, intervalValue)
    case 'once':
    default:
      return null
  }
}

function getEndBoundary(endDate: string | null) {
  return endDate ? endOfDay(parseISO(endDate)) : null
}

export function calculateNextRunAt(input: Pick<RecurringRuleFormValues, 'endDate' | 'frequency' | 'intervalValue' | 'isActive' | 'runTime' | 'startDate'>, referenceDate = new Date()) {
  if (!input.isActive) {
    return null
  }

  const intervalValue = Math.max(1, input.intervalValue || 1)
  const endBoundary = getEndBoundary(input.endDate || null)
  let candidate = combineLocalDateAndTime(input.startDate, input.runTime)

  if (endBoundary && candidate > endBoundary) {
    return null
  }

  if (input.frequency === 'once') {
    return candidate < referenceDate ? null : candidate.toISOString()
  }

  let attempts = 0

  while (candidate < referenceDate && attempts < 500) {
    const nextCandidate = addByFrequency(candidate, input.frequency, intervalValue)

    if (!nextCandidate) {
      return null
    }

    candidate = nextCandidate
    attempts += 1
  }

  if (endBoundary && candidate > endBoundary) {
    return null
  }

  return candidate.toISOString()
}

export function buildRecurringRuleSummary(rule: Pick<RecurringRule, 'frequency' | 'intervalValue' | 'startDate'>) {
  const intervalValue = Math.max(1, rule.intervalValue)

  switch (rule.frequency) {
    case 'once':
      return `Una sola vez, desde ${format(parseISO(rule.startDate), 'dd MMM yyyy')}`
    case 'daily':
      return intervalValue === 1 ? 'Todos los dias' : `Cada ${intervalValue} dias`
    case 'weekly':
      return intervalValue === 1 ? 'Cada semana' : `Cada ${intervalValue} semanas`
    case 'monthly':
      return intervalValue === 1 ? 'Cada mes' : `Cada ${intervalValue} meses`
    default:
      return 'Frecuencia no definida'
  }
}

export function getUpcomingRecurringRules(rules: RecurringRule[], limit = UPCOMING_RECURRING_LIMIT) {
  return [...rules]
    .filter((rule) => rule.isActive && Boolean(rule.nextRunAt))
    .sort((left, right) => {
      const leftTime = left.nextRunAt ? parseISO(left.nextRunAt).getTime() : Number.POSITIVE_INFINITY
      const rightTime = right.nextRunAt ? parseISO(right.nextRunAt).getTime() : Number.POSITIVE_INFINITY

      return leftTime - rightTime
    })
    .slice(0, limit)
}

export function countActiveFixedExpenseRules(rules: RecurringRule[]) {
  return rules.filter((rule) => rule.isActive && rule.isFixed && rule.type === 'expense').length
}

export function countActiveAutomaticRules(rules: RecurringRule[]) {
  return rules.filter((rule) => rule.isActive).length
}
