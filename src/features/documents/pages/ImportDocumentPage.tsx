import { FileSearch, Sparkles } from 'lucide-react'

import { EmptyState } from '@/components/ui/EmptyState'
import { PageIntro } from '@/components/ui/PageIntro'
import { DocumentDropzone } from '@/features/documents/components/DocumentDropzone'
import { DocumentPreview } from '@/features/documents/components/DocumentPreview'
import { ExtractedFieldsReview } from '@/features/documents/components/ExtractedFieldsReview'
import { useDocumentImport } from '@/features/documents/hooks/useDocumentImport'

export function ImportDocumentPage() {
  const { actions, state } = useDocumentImport()

  return (
    <div className="space-y-8">
      <PageIntro
        description="Sube un volante de pago en PDF, extrae el texto, detecta si realmente es un payslip y revisa los datos antes de cualquier guardado futuro."
        eyebrow="Importacion documental"
        title="Importar volante de pago"
      >
        <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
          <span className="rounded-full border border-outline bg-panel px-3 py-2">PDF.js para texto nativo</span>
          <span className="rounded-full border border-outline bg-panel px-3 py-2">OCR de respaldo con Tesseract.js</span>
          <span className="rounded-full border border-outline bg-panel px-3 py-2">Analisis IA opcional via backend</span>
          <span className="rounded-full border border-outline bg-panel px-3 py-2">Revision editable antes de guardar</span>
        </div>
      </PageIntro>

      {state.status === 'idle' ? (
        <>
          <DocumentDropzone onFileSelected={actions.selectFile} />
          <EmptyState
            action={null}
            className="text-left"
            description="Esta fase trabaja solo con volantes de pago. Extrae texto, clasifica el documento y, si la capa IA esta disponible, mejora el resultado antes de dejarte una revision previa sin modificar tus finanzas."
            icon={Sparkles}
            title="Lectura de payslip lista para revisar"
          />
        </>
      ) : null}

      {state.status === 'selected' || state.status === 'processing' || state.status === 'error' ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <DocumentPreview onProcess={actions.processSelectedFile} onReset={actions.reset} state={state} />
          <EmptyState
            description="Despues del analisis apareceran la clasificacion del volante, los datos detectados, el origen del analisis y la revision manual antes de continuar."
            icon={FileSearch}
            title="Resultados pendientes de procesar"
          />
        </div>
      ) : null}

      {state.status === 'review' ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <DocumentPreview onProcess={actions.processSelectedFile} onReset={actions.reset} state={state} />
          <ExtractedFieldsReview onFieldChange={actions.updateExtractedField} result={state.result} />
        </div>
      ) : null}
    </div>
  )
}
