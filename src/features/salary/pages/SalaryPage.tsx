import { useMemo, useState } from 'react'
import { BadgeDollarSign, Landmark, ReceiptText, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageIntro } from '@/components/ui/PageIntro'
import { SalaryDeductionForm } from '@/features/salary/components/SalaryDeductionForm'
import { SalaryDeductionList } from '@/features/salary/components/SalaryDeductionList'
import { SalaryProfileForm } from '@/features/salary/components/SalaryProfileForm'
import { useFinanceStore } from '@/hooks/useFinanceStore'
import type { SalaryDeduction, SalaryDeductionFormValues, SalaryProfile, SalaryProfileFormValues } from '@/types/finance'
import { formatCurrency } from '@/utils/format'

export function SalaryPage() {
  const { actions, selectors, state } = useFinanceStore()
  const [editingDeductionId, setEditingDeductionId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const editingDeduction = editingDeductionId
    ? selectors.salaryDeductions.find((deduction) => deduction.id === editingDeductionId)
    : undefined

  const salaryProfileInitialValues = selectors.salaryProfile
    ? {
        grossSalary: selectors.salaryProfile.grossSalary,
        payFrequency: selectors.salaryProfile.payFrequency,
        bonuses: selectors.salaryProfile.bonuses,
        overtimePay: selectors.salaryProfile.overtimePay,
        otherIncome: selectors.salaryProfile.otherIncome,
        notes: selectors.salaryProfile.notes,
        allowTransactionGeneration: selectors.salaryProfile.allowTransactionGeneration,
      }
    : undefined

  const deductionInitialValues = useMemo<SalaryDeductionFormValues | undefined>(() => {
    if (!editingDeduction) {
      return undefined
    }

    return {
      name: editingDeduction.name,
      type: editingDeduction.type,
      value: editingDeduction.value,
      isActive: editingDeduction.isActive,
      isMandatory: editingDeduction.isMandatory,
      frequency: editingDeduction.frequency,
      notes: editingDeduction.notes,
    }
  }, [editingDeduction])

  const handleSaveProfile = (values: SalaryProfileFormValues) => {
    const timestamp = new Date().toISOString()
    const nextProfile: SalaryProfile = {
      id: selectors.salaryProfile?.id ?? crypto.randomUUID(),
      grossSalary: values.grossSalary,
      payFrequency: values.payFrequency,
      bonuses: values.bonuses,
      overtimePay: values.overtimePay,
      otherIncome: values.otherIncome,
      notes: values.notes.trim(),
      allowTransactionGeneration: values.allowTransactionGeneration,
      createdAt: selectors.salaryProfile?.createdAt ?? timestamp,
      updatedAt: timestamp,
    }

    actions.setSalaryProfile(nextProfile)
    setFeedback('Perfil salarial actualizado.')
  }

  const handleSaveDeduction = (values: SalaryDeductionFormValues) => {
    const timestamp = new Date().toISOString()
    const deduction: SalaryDeduction = {
      id: editingDeduction?.id ?? crypto.randomUUID(),
      name: values.name.trim(),
      type: values.type,
      value: values.value,
      isActive: values.isActive,
      isMandatory: values.isMandatory,
      frequency: values.frequency,
      notes: values.notes.trim(),
      createdAt: editingDeduction?.createdAt ?? timestamp,
      updatedAt: timestamp,
    }

    if (editingDeduction) {
      actions.updateSalaryDeduction(deduction)
      setFeedback('Descuento actualizado.')
    } else {
      actions.addSalaryDeduction(deduction)
      setFeedback('Descuento agregado.')
    }

    setEditingDeductionId(null)
  }

  const handleDeleteDeduction = (deductionId: string) => {
    const shouldDelete = window.confirm('Se eliminara este descuento del perfil salarial. Deseas continuar?')

    if (!shouldDelete) {
      return
    }

    actions.deleteSalaryDeduction(deductionId)

    if (editingDeductionId === deductionId) {
      setEditingDeductionId(null)
    }

    setFeedback('Descuento eliminado.')
  }

  return (
    <div className="space-y-8">
      <PageIntro
        description="Configura tu sueldo bruto, adicionales y descuentos para estimar el neto por periodo y por mes."
        eyebrow="Perfil salarial"
        title="Sueldo neto estimado"
      >
        {selectors.salarySummary ? (
          <div className="flex flex-wrap gap-3">
            <div className="rounded-full bg-panel px-4 py-2 text-sm text-text-secondary">
              Neto por periodo:{' '}
              <span className="font-semibold text-text-primary">{formatCurrency(selectors.salarySummary.netPerPeriod, state.currency)}</span>
            </div>
            <div className="rounded-full bg-panel px-4 py-2 text-sm text-text-secondary">
              Neto mensual:{' '}
              <span className="font-semibold text-text-primary">{formatCurrency(selectors.salarySummary.netMonthlyEstimate, state.currency)}</span>
            </div>
          </div>
        ) : null}
      </PageIntro>

      {feedback ? (
        <div className="rounded-[1.5rem] border border-outline bg-panel p-4 text-sm text-text-secondary shadow-card">
          {feedback}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success-soft text-success">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">Perfil salarial</h2>
              <p className="text-sm text-text-secondary">
                Define sueldo bruto, frecuencia, extras y habilita el registro manual del neto como ingreso real.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <SalaryProfileForm initialValues={salaryProfileInitialValues} onSubmit={handleSaveProfile} />
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <BadgeDollarSign className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">Resumen neto</h3>
                <p className="text-sm text-text-secondary">Proyeccion del sueldo luego de descuentos activos.</p>
              </div>
            </div>

            {selectors.salarySummary ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <MetricCard label="Bruto por periodo" value={formatCurrency(selectors.salarySummary.grossPerPeriod, state.currency)} />
                <MetricCard label="Descuentos por periodo" value={formatCurrency(selectors.salarySummary.totalDeductionsPerPeriod, state.currency)} />
                <MetricCard label="Neto por periodo" value={formatCurrency(selectors.salarySummary.netPerPeriod, state.currency)} />
                <MetricCard label="Neto mensual estimado" value={formatCurrency(selectors.salarySummary.netMonthlyEstimate, state.currency)} />
              </div>
            ) : (
              <div className="mt-5 rounded-[1.3rem] border border-dashed border-outline bg-panel-muted p-4 text-sm leading-6 text-text-secondary">
                Crea tu perfil salarial para obtener estimaciones automáticas.
              </div>
            )}

            {selectors.salaryProfile?.allowTransactionGeneration && selectors.salarySummary ? (
              <div className="mt-5 rounded-[1.4rem] bg-panel-muted p-4">
                <p className="text-sm leading-6 text-text-secondary">
                  Si ya recibiste el pago de este periodo, puedes registrarlo como ingreso real usando el neto calculado.
                </p>
                <Button
                  className="mt-4 w-full sm:w-auto"
                  onClick={() => {
                    actions.recordSalaryPayment({
                      paymentDate: new Date().toISOString().slice(0, 10),
                      description: 'Pago de sueldo neto',
                    })
                    setFeedback('Ingreso neto registrado en el historial.')
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                  Registrar sueldo neto
                </Button>
              </div>
            ) : null}
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warning-soft text-warning">
                <ReceiptText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">
                  {editingDeduction ? 'Editar descuento' : 'Agregar descuento'}
                </h3>
                <p className="text-sm text-text-secondary">
                  Soporta descuentos fijos o porcentuales, obligatorios o manuales.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <SalaryDeductionForm
                initialValues={deductionInitialValues}
                isEditing={Boolean(editingDeduction)}
                onCancel={editingDeduction ? () => setEditingDeductionId(null) : undefined}
                onSubmit={handleSaveDeduction}
              />
            </div>
          </Card>
        </div>
      </div>

      <SalaryDeductionList
        deductions={selectors.salaryDeductions}
        onDelete={handleDeleteDeduction}
        onEdit={setEditingDeductionId}
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
