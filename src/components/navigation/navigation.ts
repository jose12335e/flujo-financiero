import type { LucideIcon } from 'lucide-react'
import { AlarmClock, ChartColumn, Gauge, PlusCircle, ReceiptText, Settings2 } from 'lucide-react'

export interface NavigationItem {
  to: string
  label: string
  description: string
  icon: LucideIcon
}

export const navigationItems: NavigationItem[] = [
  {
    to: '/',
    label: 'Dashboard',
    description: 'Balance, presupuesto y actividad reciente.',
    icon: Gauge,
  },
  {
    to: '/registrar',
    label: 'Registrar',
    description: 'Crea o actualiza movimientos desde un solo flujo.',
    icon: PlusCircle,
  },
  {
    to: '/programados',
    label: 'Programados',
    description: 'Configura ingresos y gastos automaticos.',
    icon: AlarmClock,
  },
  {
    to: '/historial',
    label: 'Historial',
    description: 'Consulta, filtra y gestiona todos tus movimientos.',
    icon: ReceiptText,
  },
  {
    to: '/reportes',
    label: 'Reportes',
    description: 'Analiza tendencias con graficos y cortes mensuales.',
    icon: ChartColumn,
  },
  {
    to: '/configuracion',
    label: 'Configuracion',
    description: 'Administra tema, moneda y presupuesto.',
    icon: Settings2,
  },
]

export function getActiveNavigationItem(pathname: string) {
  return (
    navigationItems.find((item) =>
      item.to === '/'
        ? pathname === '/'
        : pathname === item.to || pathname.startsWith(`${item.to}/`),
    ) ?? navigationItems[0]
  )
}
