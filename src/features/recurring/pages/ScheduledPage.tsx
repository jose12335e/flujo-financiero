import { useMemo, useState } from 'react'
import { AlarmClock, LoaderCircle, Sparkles, WalletCards } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageIntro } from '@/components/ui/PageIntro'
import { RecurringRuleForm } from '@/features/recurring/components/RecurringRuleForm'
import { RecurringRuleList } from '@/features/recurring/components/RecurringRuleList'
import { useFinanceStore } from '@/hooks/useFinanceStore'
import type { RecurringRule, RecurringRuleFormValues } from '@/types/finance'
import { formatCurrency, formatDisplayDateTime } from '@/utils/format'
import { calculateNextRunAt } from '@/utils/recurring'
import { processDueRecurringRulesForCurrentUser } from '@/utils/supabaseFinance'

export function ScheduledPage() {
  const { actions, helpers, selectors, state } = useFinanceStore()
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const editingRule = editingRuleId ? helpers.getRecurringRuleById(editingRuleId) : undefined

  const initialValues = useMemo<RecurringRuleFormValues | undefined>(() => {
    if (!editingRule) {
      return undefined
    }

    return {
      type: editingRule.type,
      amount: editingRule.amount,
      categoryId: editingRule.categoryId,
      description: editingRule.description,
      frequency: editingRule.frequency,
      intervalValue: editingRule.intervalValue,
      startDate: editingRule.startDate,
      runTime: editingRule.runTime,
      endDate: editingRule.endDate ?? '',
      isFixed: editingRule.isFixed,
      isActive: editingRule.isActive,
      timezone: editingRule.timezone,
    }
  }, [editingRule])

  const handleSubmit = (values: RecurringRuleFormValues) => {
    const timestamp = new Date().toISOString()
    const nextRunAt = calculateNextRunAt(values)

    const baseRule: RecurringRule = {
      id: editingRule?.id ?? crypto.randomUUID(),
      type: values.type,
      amount: values.amount,
      categoryId: values.categoryId,
      description: values.description.trim(),
      frequency: values.frequency,
      intervalValue: values.frequency === 'once' ? 1 : values.intervalValue,
      startDate: values.startDate,
      runTime: values.runTime,
      endDate: values.endDate || null,
      timezone: values.timezone,
      isFixed: values.isFixed,
      isActive: values.isActive,
      nextRunAt,
      lastRunAt: editingRule?.lastRunAt ?? null,
      createdAt: editingRule?.createdAt ?? timestamp,
      updatedAt: timestamp,
    }

    if (editingRule) {
      actions.updateRecurringRule(baseRule)
      setFeedback('Programacion actualizada correctamente.')
    } else {
      actions.addRecurringRule(baseRule)
      setFeedback('Programacion creada correctamente.')
    }

    setEditingRuleId(null)
  }

  const handleDelete = (ruleId: string) => {
    const shouldDelete = window.confirm('Se eliminara esta programacion. Las ejecuciones futuras dejaran de generarse. Deseas continuar?')

    if (!shouldDelete) {
      return
    }

    actions.deleteRecurringRule(ruleId)

    if (editingRuleId === ruleId) {
      setEditingRuleId(null)
    }

    setFeedback('Programacion eliminada.')
  }

  const handleToggleActive = (ruleId: string) => {
    const rule = helpers.getRecurringRuleById(ruleId)

    if (!rule) {
      return
    }

    const isActivating = !rule.isActive
    const timestamp = new Date().toISOString()

    actions.updateRecurringRule({
      ...rule,
      isActive: isActivating,
      nextRunAt: isActivating
        ? calculateNextRunAt(
            {
              frequency: rule.frequency,
              intervalValue: rule.intervalValue,
              startDate: rule.startDate,
              runTime: rule.runTime,
              endDate: rule.endDate ?? '',
              isActive: true,
            },
            new Date(),
          )
        : null,
      updatedAt: timestamp,
    })

    setFeedback(isActivating ? 'Programacion activada.' : 'Programacion pausada.')
  }

  const handleProcessNow = async () => {
    setIsProcessing(true)
    setFeedback('')

    try {
      const processedCount = await processDueRecurringRulesForCurrentUser()
      actions.refreshRemoteData()
      setFeedback(
        processedCount > 0
          ? `Se generaron ${processedCount} movimiento${processedCount === 1 ? '' : 's'} pendientes.`
          : 'No habia movimientos pendientes por ejecutar en este momento.',
      )
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'No fue posible procesar las automatizaciones ahora mismo.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-8">
      <PageIntro
        description="Programa ingresos y gastos para que se registren solos en la fecha y hora definidas."
        eyebrow="Automatizaciones"
        title="Gastos fijos y movimientos automaticos"
      >
        <div className="flex flex-wrap gap-3">
          <div className="rounded-full bg-panel px-4 py-2 text-sm text-text-secondary">
            Activas: <span className="font-semibold text-text-primary">{selectors.activeAutomaticRulesCount}</span>
          </div>
          <div className="rounded-full bg-panel px-4 py-2 text-sm text-text-secondary">
            Fijas: <span className="font-semibold text-text-primary">{selectors.activeFixedExpenseRulesCount}</span>
          </div>
        </div>
      </PageIntro>

      {feedback ? (
        <div className="rounded-[1.6rem] border border-outline bg-panel p-4 text-sm text-text-secondary shadow-card">
          {feedback}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <AlarmClock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                {editingRule ? 'Editar programacion' : 'Nueva programacion'}
              </h2>
              <p className="text-sm text-text-secondary">
                Define el tipo, monto, frecuencia, fecha y hora para automatizar un movimiento.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <RecurringRuleForm
              categories={state.categories}
              initialValues={initialValues}
              isEditing={Boolean(editingRule)}
              onCancel={editingRule ? () => setEditingRuleId(null) : undefined}
              onSubmit={handleSubmit}
            />
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success-soft text-success">
                <WalletCards className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">Proxima actividad automatica</h3>
                <p className="text-sm text-text-secondary">La cuenta te muestra lo siguiente que se registrara automaticamente.</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {selectors.upcomingRecurringRules.length === 0 ? (
                <p className="text-sm leading-6 text-text-secondary">
                  Todavia no hay ejecuciones futuras. En cuanto actives una programacion, apareceran aqui.
                </p>
              ) : (
                selectors.upcomingRecurringRules.slice(0, 3).map((rule) => (
                  <div key={rule.id} className="rounded-[1.4rem] bg-panel-muted p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-text-primary">{rule.description}</p>
                          {rule.isFixed ? <Badge variant="warning">Fijo</Badge> : null}
                        </div>
                        <p className="mt-1 text-sm text-text-secondary">
                          {rule.nextRunAt ? formatDisplayDateTime(rule.nextRunAt) : 'Sin fecha definida'}
                        </p>
                      </div>
                      <p className={rule.type === 'income' ? 'font-semibold text-success' : 'font-semibold text-danger'}>
                        {rule.type === 'income' ? '+' : '-'}
                        {formatCurrency(rule.amount, state.currency)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warning-soft text-warning">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">Ejecucion automatica</h3>
                <p className="text-sm text-text-secondary">
                  Las reglas activas pueden ejecutarse solas desde Supabase y tambien probarse manualmente.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-[1.5rem] border border-outline bg-panel-muted p-4">
              <p className="text-sm leading-6 text-text-secondary">
                Usa este control para forzar la revision de reglas vencidas y generar de inmediato los movimientos pendientes.
              </p>
              <Button className="w-full sm:w-auto" disabled={isProcessing} onClick={() => void handleProcessNow()} variant="secondary">
                {isProcessing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <AlarmClock className="h-4 w-4" />}
                {isProcessing ? 'Procesando...' : 'Procesar automatizaciones ahora'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <RecurringRuleList
        categories={state.categories}
        currency={state.currency}
        onDelete={handleDelete}
        onEdit={setEditingRuleId}
        onProcessNow={() => void handleProcessNow()}
        onToggleActive={handleToggleActive}
        rules={[...state.recurringRules].sort((left, right) => {
          const leftTime = left.nextRunAt ? new Date(left.nextRunAt).getTime() : Number.POSITIVE_INFINITY
          const rightTime = right.nextRunAt ? new Date(right.nextRunAt).getTime() : Number.POSITIVE_INFINITY
          return leftTime - rightTime
        })}
      />
    </div>
  )
}
