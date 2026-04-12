import { NavLink } from 'react-router-dom'

import { navigationItems } from '@/components/navigation/navigation'
import { cn } from '@/utils/cn'

export function MobileNav() {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 overflow-x-auto rounded-[1.6rem] border border-outline bg-panel/96 p-2 shadow-card backdrop-blur-xl lg:hidden [padding-bottom:calc(0.5rem+env(safe-area-inset-bottom))]">
      <div className="flex min-w-max snap-x gap-1">
        {navigationItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                cn(
                  'flex min-w-[74px] snap-start flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 text-[10px] font-semibold transition-colors',
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
