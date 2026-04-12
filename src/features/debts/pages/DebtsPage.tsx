import { useMemo, useState } from 'react'
import { CreditCard, Landmark, ReceiptText, TriangleAlert } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageIntro } from '@/components/ui/PageIntro'
import { DebtForm } from '@/features/debts/components/DebtForm'
import { DebtList } from '@/features/debts/components/DebtList'
import { DebtPaymentForm } from '@/features/debts/components/DebtPaymentForm'
import { useFinanceStore } from '@/hooks/useFinanceStore'
import type { Debt, DebtFormValues } from '@/types/finance'
import { formatCurrency, formatDisplayDate } from '@/utils/format'

export function DebtsPage() {
  const { actions, helpers, selectors, state } = useFinanceStore()
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null)
  const [payingDebtId, setPayingDebtId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const editingDebt = editingDebtId ? helpers.getDebtById(editingDebtId) : undefined
  const payingDebt = payingDebtId ? helpers.getDebtById(payingDebtId) : undefined

  const initialValues = useMemo<DebtFormValues | undefined>(() => {
    if (!editingDebt) {
      return undefined
    }

    return {
      name: editingDebt.name,
      type: editingDebt.type,
      originalAmount: editingDebt.originalAmount,
      pendingBalance: editingDebt.pendingBalance,
      monthlyPayment: editingDebt.monthlyPayment,
      interestRate: editingDebt.interestRate,
      paymentDay: editingDebt.paymentDay,
      startDate: editingDebt.startDate,
      endDate: editingDebt.endDate ?? '',
      status: editingDebt.status,
      priority: editingDebt.priority,
      notes: editingDebt.notes,
    }
  }, [editingDebt])

  const handleSubmit = (values: DebtFormValues) => {
    const timestamp = new Date().toISOString()
    const debt: Debt = {
      id: editingDebt?.id ?? crypto.randomUUID(),
      name: values.name.trim(),
      type: values.type,
      originalAmount: values.originalAmount,
      pendingBalance: values.pendingBalance,
      monthlyPayment: values.monthlyPayment,
      interestRate: values.interestRate,
      paymentDay: values.paymentDay,
      startDate: values.startDate,
      endDate: values.endDate || null,
      status: values.status,
      priority: values.priority,
      notes: values.notes.trim(),
      createdAt: editingDebt?.createdAt ?? timestamp,
      updatedAt: timestamp,
    }

    if (editingDebt) {
      actions.updateDebt(debt)
      setFeedback('Deuda actualizada correctamente.')
    } else {
      actions.addDebt(debt)
      setFeedback('Deuda registrada correctamente.')
    }

    setEditingDebtId(null)
  }

  const handleDelete = (debtId: string) => {
    const debt = helpers.getDebtById(debtId)
    const hasLinkedPayments = selectors.debtPayments.some((payment) => payment.debtId === debtId)
    const shouldDelete = window.confirm(
      hasLinkedPayments
        ? `Se eliminara ${debt?.name ?? 'esta deuda'} y sus pagos vinculados. Deseas continuar?`
        : `Se eliminara ${debt?.name ?? 'esta deuda'}. Deseas continuar?`,
    )

    if (!shouldDelete) {
      return
    }

    actions.deleteDebt(debtId)

    if (editingDebtId === debtId) {
      setEditingDebtId(null)
    }

    if (payingDebtId === debtId) {
      setPayingDebtId(null)
    }

    setFeedback('Deuda eliminada.')
  }

  const handleRecordPayment = (debtId: string) => {
    setPayingDebtId(debtId)
    setFeedback('')
  }

  return (
    <div className="space-y-8">
      <PageIntro
        action={
          <div className="rounded-full bg-panel px-4 py-2 text-sm text-text-secondary max-sm:w-full max-sm:text-center">
            Activas: <span className="font-semibold text-text-primary">{selectors.debtSummary.activeCount}</span>
          </div>
        }
        description="Controla obligaciones pendientes con entidad propia y registra pagos que impactan tu balance real."
        eyebrow="Compromisos"
        title="Modulo de deudas"
      >
        <div className="flex flex-wrap gap-3">
          <div className="rounded-full bg-panel px-4 py-2 text-sm text-text-secondary">
            Pendiente: <span className="font-semibold text-text-primary">{formatCurrency(selectors.debtSummary.totalPending, state.currency)}</span>
          </div>
          <div className="rounded-full bg-panel px-4 py-2 text-sm text-text-secondary">
            Cuota mensual: <span className="font-semibold text-text-primary">{formatCurrency(selectors.debtSummary.monthlyCommitted, state.currency)}</span>
          </div>
        </div>
      </PageIntro>

      {feedback ? (
        <div className="rounded-[1.5rem] border border-outline bg-panel p-4 text-sm text-text-secondary shadow-card">
          {feedback}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warning-soft text-warning">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                {editingDebt ? 'Editar deuda' : 'Registrar deuda'}
              </h2>
              <p className="text-sm text-text-secondary">
                Crea compromisos reales con saldo pendiente, fecha de pago y prioridad.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <DebtForm
              initialValues={initialValues}
              isEditing={Boolean(editingDebt)}
              onCancel={editingDebt ? () => setEditingDebtId(null) : undefined}
              onSubmit={handleSubmit}
            />
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">Panorama actual</h3>
                <p className="text-sm text-text-secondary">Resumen rapido de deuda total, saldo pendiente y pagos proximos.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <MetricCard label="Total original" value={formatCurrency(selectors.debtSummary.totalOriginal, state.currency)} />
              <MetricCard label="Pendiente" value={formatCurrency(selectors.debtSummary.totalPending, state.currency)} />
              <MetricCard label="Comprometido al mes" value={formatCurrency(selectors.debtSummary.monthlyCommitted, state.currency)} />
              <MetricCard label="Deudas activas" value={String(selectors.debtSummary.activeCount)} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-danger-soft text-danger">
                <ReceiptText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">Pagos proximos</h3>
                <p className="text-sm text-text-secondary">Esto te ayuda a ver de un vistazo lo que viene en los siguientes ciclos.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {selectors.upcomingDebtPayments.length === 0 ? (
                <div className="rounded-[1.3rem] border border-dashed border-outline bg-panel-muted p-4 text-sm leading-6 text-text-secondary">
                  Aun no hay deudas activas con saldo pendiente.
                </div>
              ) : (
                selectors.upcomingDebtPayments.map((payment) => (
                  <div key={payment.debtId} className="rounded-[1.3rem] bg-panel-muted p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-text-primary">{payment.debtName}</p>
                          <Badge variant={payment.priority === 'critical' || payment.priority === 'high' ? 'warning' : 'neutral'}>
                            {payment.priority === 'critical' ? 'Critica' : payment.priority === 'high' ? 'Alta' : 'Programada'}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-text-secondary">
                          Proximo pago: {formatDisplayDate(payment.dueDate)}
                        </p>
                      </div>
                      <p className="font-semibold text-danger">-{formatCurrency(payment.amount, state.currency)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {payingDebt ? (
            <Card className="border-brand/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-text-primary">Registrar pago</h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    Este pago se vinculara con un gasto real y reducira el saldo pendiente de {payingDebt.name}.
                  </p>
                </div>
                <TriangleAlert className="mt-1 h-5 w-5 text-warning" />
              </div>

              <div className="mt-4 rounded-[1.3rem] bg-panel-muted p-4 text-sm text-text-secondary">
                Pendiente actual: <span className="font-semibold text-text-primary">{formatCurrency(payingDebt.pendingBalance, state.currency)}</span>
              </div>

              <div className="mt-5">
                <DebtPaymentForm
                  defaultAmount={Math.min(payingDebt.monthlyPayment, payingDebt.pendingBalance)}
                  onCancel={() => setPayingDebtId(null)}
                  onSubmit={(values) => {
                    actions.recordDebtPayment(payingDebt.id, values)
                    setPayingDebtId(null)
                    setFeedback('Pago registrado y vinculado al historial financiero.')
                  }}
                />
              </div>
            </Card>
          ) : null}
        </div>
      </div>

      <DebtList
        currency={state.currency}
        debts={selectors.debts}
        emptyDescription="Cuando registres una deuda, aqui podras seguir su saldo pendiente, prioridad y fecha de pago."
        emptyTitle="Todavia no hay deudas"
        onDelete={handleDelete}
        onEdit={(debtId) => {
          setEditingDebtId(debtId)
          setPayingDebtId(null)
        }}
        onRecordPayment={handleRecordPayment}
        upcomingPayments={selectors.upcomingDebtPayments}
      />
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.3rem] bg-panel-muted px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">{label}</p>
      <p className="mt-2 text-xl font-bold text-text-primary">{value}</p>
    </div>
  )
}
