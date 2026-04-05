import { Landmark, PlusCircle } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { navigationItems } from '@/components/navigation/navigation'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { cn } from '@/utils/cn'

export function SidebarNav() {
  return (
    <aside className="hidden w-[290px] shrink-0 flex-col border-r border-outline bg-panel px-6 py-6 lg:flex">
      <div className="rounded-[2rem] border border-outline bg-[linear-gradient(145deg,rgba(23,110,255,0.15),rgba(16,185,129,0.08),transparent)] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white shadow-glow">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-text-primary">Flujo Personal</p>
            <p className="text-sm text-text-secondary">Un solo lugar para ingresos, gastos y reportes.</p>
          </div>
        </div>
        <NavLink className={cn(buttonStyles({ size: 'lg' }), 'mt-5 w-full')} to="/registrar">
          <PlusCircle className="h-4 w-4" />
          Nuevo movimiento
        </NavLink>
      </div>

      <nav className="mt-6 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-[1.4rem] border border-transparent px-4 py-3 transition-all duration-200',
                  isActive
                    ? 'border-outline bg-panel-muted text-text-primary shadow-sm'
                    : 'text-text-secondary hover:border-outline hover:bg-panel-muted hover:text-text-primary',
                )
              }
              to={item.to}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-app-bg text-brand transition-colors group-hover:bg-brand-soft">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{item.label}</p>
                <p className="text-xs text-text-muted">{item.description}</p>
              </div>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto rounded-[1.8rem] border border-outline bg-panel-muted p-4">
        <p className="text-sm font-semibold text-text-primary">Vision completa de tu actividad</p>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Registra movimientos, controla tu presupuesto y revisa su impacto desde un mismo panel.
        </p>
      </div>
    </aside>
  )
}
