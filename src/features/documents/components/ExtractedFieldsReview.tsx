import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { DOCUMENT_ANALYSIS_SOURCE_LABELS, DOCUMENT_KIND_LABELS } from '@/features/documents/constants/documentRules'
import type { ParsedDeduction, ParsedDocumentResult } from '@/features/documents/types/documents'

interface ExtractedFieldsReviewProps {
  result: ParsedDocumentResult
  onFieldChange: (field: keyof ParsedDocumentResult['extracted'], value: string | number | ParsedDeduction[] | undefined) => void
}

const fieldClasses =
  'min-h-11 w-full rounded-2xl border border-outline bg-app-bg px-4 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand'

function toInputValue(value: number | string | undefined) {
  if (typeof value === 'number') {
    return String(value)
  }

  return value ?? ''
}

function getConfidenceText(confidenceLabel: ParsedDocumentResult['confidenceLabel']) {
  if (confidenceLabel === 'high') {
    return 'alta'
  }

  if (confidenceLabel === 'medium') {
    return 'media'
  }

  return 'baja'
}

export function ExtractedFieldsReview({ onFieldChange, result }: ExtractedFieldsReviewProps) {
  const deductions = result.extracted.deductions ?? []

  return (
    <Card className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Revision previa</p>
          <h2 className="mt-2 text-xl font-semibold text-text-primary">Datos del volante detectados</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Revisa y corrige los datos antes de continuar. Esta pantalla no guarda nada automaticamente.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={result.documentType === 'unknown' ? 'neutral' : 'success'}>
            {DOCUMENT_KIND_LABELS[result.documentType]}
          </Badge>
          <Badge variant="neutral">Confianza {getConfidenceText(result.confidenceLabel)}</Badge>
          <Badge variant="neutral">{DOCUMENT_ANALYSIS_SOURCE_LABELS[result.analysisSource]}</Badge>
          {result.usedOcrFallback ? <Badge variant="neutral">OCR de respaldo</Badge> : null}
        </div>
      </div>

      {result.summary ? (
        <div className="rounded-[1.4rem] border border-brand/20 bg-brand-soft/35 p-4">
          <p className="text-sm font-semibold text-text-primary">Resumen sugerido</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{result.summary}</p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Fecha</span>
          <input
            className={fieldClasses}
            onChange={(event) => onFieldChange('date', event.target.value || undefined)}
            type="text"
            value={toInputValue(result.extracted.date)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Periodo</span>
          <input
            className={fieldClasses}
            onChange={(event) => onFieldChange('period', event.target.value || undefined)}
            type="text"
            value={toInputValue(result.extracted.period)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Empresa</span>
          <input
            className={fieldClasses}
            onChange={(event) => onFieldChange('company', event.target.value || undefined)}
            type="text"
            value={toInputValue(result.extracted.company)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Codigo del empleado</span>
          <input
            className={fieldClasses}
            onChange={(event) => onFieldChange('employeeCode', event.target.value || undefined)}
            type="text"
            value={toInputValue(result.extracted.employeeCode)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Nombre del empleado</span>
          <input
            className={fieldClasses}
            onChange={(event) => onFieldChange('employeeName', event.target.value || undefined)}
            type="text"
            value={toInputValue(result.extracted.employeeName)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Departamento</span>
          <input
            className={fieldClasses}
            onChange={(event) => onFieldChange('department', event.target.value || undefined)}
            type="text"
            value={toInputValue(result.extracted.department)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Cargo</span>
          <input
            className={fieldClasses}
            onChange={(event) => onFieldChange('position', event.target.value || undefined)}
            type="text"
            value={toInputValue(result.extracted.position)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Municipio</span>
          <input
            className={fieldClasses}
            onChange={(event) => onFieldChange('municipality', event.target.value || undefined)}
            type="text"
            value={toInputValue(result.extracted.municipality)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Cuenta bancaria</span>
          <input
            className={fieldClasses}
            onChange={(event) => onFieldChange('bankAccount', event.target.value || undefined)}
            type="text"
            value={toInputValue(result.extracted.bankAccount)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Sueldo bruto</span>
          <input
            className={fieldClasses}
            onChange={(event) => onFieldChange('grossSalary', event.target.value ? Number(event.target.value) : undefined)}
            step="0.01"
            type="number"
            value={toInputValue(result.extracted.grossSalary)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-text-primary">Neto a pagar</span>
          <input
            className={fieldClasses}
            onChange={(event) => onFieldChange('netSalary', event.target.value ? Number(event.target.value) : undefined)}
            step="0.01"
            type="number"
            value={toInputValue(result.extracted.netSalary)}
          />
        </label>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-text-primary">Deducciones detectadas</p>
        {deductions.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {deductions.map((deduction) => (
              <div key={`${deduction.name}-${deduction.amount}`} className="rounded-[1.2rem] border border-outline bg-panel-muted p-4">
                <p className="text-sm font-semibold text-text-primary">{deduction.name}</p>
                <p className="mt-1 text-sm text-text-secondary">{deduction.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.2rem] border border-dashed border-outline bg-panel-muted/60 p-4 text-sm text-text-secondary">
            No se detectaron deducciones con suficiente claridad en este volante.
          </div>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-text-primary">Texto extraido</p>
        <div className="rounded-[1.4rem] border border-outline bg-app-bg p-4 text-sm leading-6 text-text-secondary">
          {result.rawText ? (
            <pre className="whitespace-pre-wrap break-words font-inherit">{result.rawText}</pre>
          ) : (
            <p>No se obtuvo texto util del PDF.</p>
          )}
        </div>
      </div>

      {result.debugReasons?.length ? (
        <div className="rounded-[1.4rem] border border-outline bg-panel-muted p-4">
          <p className="text-sm font-semibold text-text-primary">Razones de clasificacion</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-text-secondary">
            {result.debugReasons.map((reason) => (
              <li key={reason}>• {reason}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  )
}
