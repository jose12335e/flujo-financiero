import { NavLink } from 'react-router-dom'

import { navigationItems } from '@/components/navigation/navigation'
import { cn } from '@/utils/cn'

export function MobileNav() {
  return (
    <nav className="fixed inset-x-4 bottom-4 z-40 overflow-x-auto rounded-[1.8rem] border border-outline bg-panel p-2 shadow-card lg:hidden">
      <div className="flex min-w-max gap-1">
        {navigationItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                cn(
                  'flex min-w-[78px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-[11px] font-semibold transition-colors',
                  isActive ? 'bg-brand text-white' : 'text-text-secondary hover:bg-panel-muted',
                )
              }
              to={item.to}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
