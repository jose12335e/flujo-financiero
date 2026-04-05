import { format, parse, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatDisplayDate(date: string) {
  return format(parseISO(date), "dd MMM yyyy", { locale: es })
}

export function formatDisplayDateTime(dateTime: string) {
  return format(parseISO(dateTime), "dd MMM yyyy 'a las' HH:mm", { locale: es })
}

export function formatMonthLabel(monthKey: string) {
  const parsedMonth = parse(monthKey, 'yyyy-MM', new Date())
  return format(parsedMonth, 'MMMM yyyy', { locale: es })
}

export function formatPercentage(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(value)
}
