import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Ellipsis, LogOut, MoonStar, PlusCircle, SunMedium, UserCircle2 } from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

import { MobileNav } from '@/components/navigation/MobileNav'
import { SidebarNav } from '@/components/navigation/SidebarNav'
import { getActiveNavigationItem } from '@/components/navigation/navigation'
import { Button } from '@/components/ui/Button'
import { SyncStatusBadge } from '@/components/ui/SyncStatusBadge'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { useAuth } from '@/hooks/useAuth'
import { useFinanceStore } from '@/hooks/useFinanceStore'
import { useScrollVisibility } from '@/hooks/useScrollVisibility'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/utils/cn'

export function AppShell() {
  const location = useLocation()
  const activePage = getActiveNavigationItem(location.pathname)
  const { theme, toggleTheme } = useTheme()
  const { signOut, user } = useAuth()
  const { meta } = useFinanceStore()
  const isHeaderExpanded = useScrollVisibility()
  const [mobileOptionsPath, setMobileOptionsPath] = useState<string | null>(null)
  const isMobileOptionsOpen = mobileOptionsPath === location.pathname

  return (
    <div className="min-h-screen bg-app-bg text-text-primary">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(23,110,255,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_28%)]" />
      <div className="flex min-h-screen">
        <SidebarNav />

        <div className="flex min-h-screen flex-1 flex-col">
          <header
            className={cn(
              'sticky top-0 z-30 border-b bg-app-bg/88 backdrop-blur-xl transition-[border-color,box-shadow,background-color] duration-300',
              isHeaderExpanded
                ? 'border-outline shadow-[0_18px_40px_-36px_rgba(16,35,60,0.26)]'
                : 'border-outline/80 shadow-[0_12px_28px_-30px_rgba(16,35,60,0.18)]',
            )}
          >
            <div
              className={cn(
                'px-4 transition-[padding] duration-300 ease-out sm:px-6 lg:px-10',
                isHeaderExpanded ? 'py-2.5 sm:py-3' : 'py-2',
              )}
            >
              <div className="md:hidden">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'overflow-hidden text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-text-muted transition-[max-height,opacity,transform,margin] duration-300',
                          isHeaderExpanded ? 'max-h-5 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2',
                        )}
                      >
                        {format(new Date(), "dd 'de' MMMM", { locale: es })}
                      </p>

                      <div className="space-y-1">
                        <h1 className={cn('truncate font-bold tracking-tight text-text-primary', isHeaderExpanded ? 'text-[1.65rem]' : 'text-[1.25rem]')}>
                          {activePage.label}
                        </h1>
                        {user?.email ? (
                          <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{user.email}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="relative shrink-0">
                      <Button
                        aria-expanded={isMobileOptionsOpen}
                        aria-label="Abrir menu de cuenta"
                        onClick={() =>
                          setMobileOptionsPath((value) => (value === location.pathname ? null : location.pathname))
                        }
                        size="sm"
                        variant="secondary"
                      >
                        <Ellipsis className="h-4 w-4" />
                      </Button>

                      {isMobileOptionsOpen ? (
                        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-64 rounded-[1.4rem] border border-outline bg-panel p-3 shadow-card">
                          <div className="rounded-[1.1rem] bg-panel-muted p-3">
                            <div className="flex items-start gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                                <UserCircle2 className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-text-primary">Cuenta</p>
                                {user?.email ? <p className="truncate text-xs text-text-secondary">{user.email}</p> : null}
                              </div>
                            </div>
                            <div className="mt-3">
                              <SyncStatusBadge syncState={meta.syncState} />
                            </div>
                          </div>

                          <div className="mt-3 space-y-2">
                            <p className="px-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-text-muted">
                              Opciones
                            </p>
                            <Button
                              className="w-full justify-start"
                              onClick={() => {
                                toggleTheme()
                                setMobileOptionsPath(null)
                              }}
                              variant="secondary"
                            >
                              {theme === 'light' ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
                              {theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
                            </Button>
                            <Button
                              className="w-full justify-start"
                              onClick={() => {
                                setMobileOptionsPath(null)
                                void signOut()
                              }}
                              variant="ghost"
                            >
                              <LogOut className="h-4 w-4" />
                              Salir
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div
                    className={cn(
                      'overflow-hidden transition-[max-height,opacity,transform,margin] duration-300 ease-out',
                      isHeaderExpanded ? 'max-h-20 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2',
                    )}
                  >
                    <p className="text-sm leading-6 text-text-secondary">{activePage.description}</p>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex md:flex-col md:gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'overflow-hidden text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-text-muted transition-[max-height,opacity,transform,margin] duration-300',
                      isHeaderExpanded ? 'mb-1 max-h-6 opacity-100 translate-y-0' : 'mb-0 max-h-0 opacity-0 -translate-y-2',
                    )}
                  >
                    {format(new Date(), "dd 'de' MMMM", { locale: es })}
                  </p>

                  <div className="flex min-w-0 flex-col gap-1.5 lg:flex-row lg:items-center lg:gap-3">
                    <h1
                      className={cn(
                        'truncate font-bold tracking-tight text-text-primary transition-[font-size] duration-300',
                        isHeaderExpanded ? 'text-[1.75rem]' : 'text-[1.35rem]',
                      )}
                    >
                      {activePage.label}
                    </h1>
                    {user?.email ? <p className="truncate text-sm font-medium text-text-secondary">{user.email}</p> : null}
                  </div>

                  <div
                    className={cn(
                      'overflow-hidden transition-[max-height,opacity,transform,margin] duration-300 ease-out',
                      isHeaderExpanded ? 'mt-2 max-h-24 opacity-100 translate-y-0' : 'mt-0 max-h-0 opacity-0 -translate-y-2',
                    )}
                  >
                    <p className="text-sm leading-6 text-text-secondary">{activePage.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <SyncStatusBadge syncState={meta.syncState} />
                  <Button className="hidden xl:inline-flex" onClick={() => void signOut()} variant="ghost">
                    <LogOut className="h-4 w-4" />
                    Salir
                  </Button>
                  <Button onClick={toggleTheme} variant="secondary">
                    {theme === 'light' ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
                    {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
                  </Button>
                  <Link className={buttonStyles()} to="/registrar">
                    <PlusCircle className="h-4 w-4" />
                    Nuevo movimiento
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <main
            className={cn(
              'flex-1 px-4 pb-6 transition-[padding] duration-300 sm:px-6 lg:px-10 lg:pb-8',
              isHeaderExpanded ? 'pt-6 lg:pt-8' : 'pt-4 lg:pt-5',
            )}
          >
            <div className="mx-auto w-full max-w-7xl pb-24 lg:pb-10">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
