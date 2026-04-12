import { Pencil, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import type { SalaryDeduction } from '@/types/finance'

interface SalaryDeductionListProps {
  deductions: SalaryDeduction[]
  onDelete: (deductionId: string) => void
  onEdit: (deductionId: string) => void
}

export function SalaryDeductionList({ deductions, onDelete, onEdit }: SalaryDeductionListProps) {
  if (deductions.length === 0) {
    return (
      <EmptyState
        description="Todavia no has configurado descuentos. Cuando agregues uno, aparecera aqui con su impacto en el sueldo neto."
        icon={Trash2}
        title="Sin descuentos configurados"
      />
    )
  }

  return (
    <div className="grid gap-4">
      {deductions.map((deduction) => (
        <Card key={deduction.id} className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-text-primary">{deduction.name}</h3>
                <Badge variant={deduction.isActive ? 'success' : 'neutral'}>{deduction.isActive ? 'Activo' : 'Inactivo'}</Badge>
                <Badge variant={deduction.isMandatory ? 'warning' : 'neutral'}>
                  {deduction.isMandatory ? 'Obligatorio' : 'Manual'}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                {deduction.type === 'fixed' ? 'Monto fijo' : 'Porcentaje'} ·{' '}
                {deduction.frequency === 'monthly' ? 'Mensual' : 'Por periodo'}
              </p>
              {deduction.notes ? <p className="mt-2 text-sm leading-6 text-text-secondary">{deduction.notes}</p> : null}
            </div>

            <div className="flex flex-col items-start gap-3 sm:items-end">
              <p className="text-xl font-bold text-text-primary">
                {deduction.type === 'fixed' ? deduction.value.toFixed(2) : `${deduction.value}%`}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => onEdit(deduction.id)} size="sm" variant="secondary">
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
                <Button onClick={() => onDelete(deduction.id)} size="sm" variant="ghost">
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
