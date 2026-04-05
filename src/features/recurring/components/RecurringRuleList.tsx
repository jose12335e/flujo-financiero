import { Clock3, Pencil, Play, Power, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Category, RecurringRule } from '@/types/finance'
import { formatCurrency, formatDisplayDateTime } from '@/utils/format'
import { buildRecurringRuleSummary } from '@/utils/recurring'
import { getCategoryById } from '@/utils/finance'

interface RecurringRuleListProps {
  categories: Category[]
  currency: string
  onDelete: (ruleId: string) => void
  onEdit: (ruleId: string) => void
  onProcessNow: () => void
  onToggleActive: (ruleId: string) => void
  rules: RecurringRule[]
}

export function RecurringRuleList({
  categories,
  currency,
  onDelete,
  onEdit,
  onProcessNow,
  onToggleActive,
  rules,
}: RecurringRuleListProps) {
  if (rules.length === 0) {
    return (
      <EmptyState
        description="Todavia no hay reglas programadas. Crea una automatizacion para generar ingresos o gastos sin hacerlo manualmente."
        icon={Clock3}
        title="Sin automatizaciones activas"
      />
    )
  }

  return (
    <Card className="h-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">Reglas activas</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">Automatizaciones configuradas</h2>
        </div>
        <Button onClick={onProcessNow} variant="secondary">
          <Play className="h-4 w-4" />
          Procesar pendientes
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {rules.map((rule) => {
          const category = getCategoryById(categories, rule.categoryId)

          return (
            <div key={rule.id} className="rounded-[1.5rem] border border-outline bg-panel-muted p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={rule.type === 'income' ? 'success' : 'danger'}>
                      {rule.type === 'income' ? 'Ingreso' : 'Gasto'}
                    </Badge>
                    <Badge variant={rule.isActive ? 'brand' : 'neutral'}>
                      {rule.isActive ? 'Activa' : 'Pausada'}
                    </Badge>
                    {rule.isFixed ? <Badge variant="warning">Fijo</Badge> : null}
                  </div>

                  <div>
                    <p className="text-lg font-semibold text-text-primary">{rule.description}</p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {category?.label ?? 'Categoria'} · {buildRecurringRuleSummary(rule)}
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <Meta label="Monto" value={formatCurrency(rule.amount, currency)} />
                    <Meta label="Proxima ejecucion" value={rule.nextRunAt ? formatDisplayDateTime(rule.nextRunAt) : 'Sin fecha'} />
                    <Meta label="Ultima ejecucion" value={rule.lastRunAt ? formatDisplayDateTime(rule.lastRunAt) : 'Aun no ejecutado'} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => onEdit(rule.id)} variant="secondary">
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button onClick={() => onToggleActive(rule.id)} variant="secondary">
                    <Power className="h-4 w-4" />
                    {rule.isActive ? 'Pausar' : 'Activar'}
                  </Button>
                  <Button onClick={() => onDelete(rule.id)} variant="ghost">
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] bg-app-bg p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-text-primary">{value}</p>
    </div>
  )
}
