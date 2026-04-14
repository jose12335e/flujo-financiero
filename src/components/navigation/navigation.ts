import type { LucideIcon } from 'lucide-react'
import { AlarmClock, BadgeDollarSign, Bot, ChartColumn, CreditCard, FileUp, FolderTree, Gauge, LineChart, MessageSquareText, PlusCircle, ReceiptText, Settings2 } from 'lucide-react'

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
    to: '/registrar-inteligente',
    label: 'Registro IA',
    description: 'Convierte texto libre en un borrador revisable antes de guardar.',
    icon: Bot,
  },
  {
    to: '/clasificacion-ia',
    label: 'Clasificacion IA',
    description: 'Detecta reclasificaciones, duplicados y gastos repetidos.',
    icon: FolderTree,
  },
  {
    to: '/programados',
    label: 'Programados',
    description: 'Configura ingresos y gastos automaticos.',
    icon: AlarmClock,
  },
  {
    to: '/deudas',
    label: 'Deudas',
    description: 'Sigue saldos pendientes y registra pagos reales.',
    icon: CreditCard,
  },
  {
    to: '/salario',
    label: 'Salario',
    description: 'Calcula sueldo neto y administra descuentos.',
    icon: BadgeDollarSign,
  },
  {
    to: '/documentos',
    label: 'Documentos',
    description: 'Importa PDF e imagenes para extraer y revisar informacion.',
    icon: FileUp,
  },
  {
    to: '/asistente-ia',
    label: 'Chat IA',
    description: 'Pregunta por tus datos financieros y recibe respuestas guiadas.',
    icon: MessageSquareText,
  },
  {
    to: '/proyecciones-ia',
    label: 'Proyecciones IA',
    description: 'Simula escenarios de cierre, ahorro y deuda sin alterar tus datos.',
    icon: LineChart,
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
