import { FileText, ImageIcon, LoaderCircle } from 'lucide-react'
import { useEffect, useMemo } from 'react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { DocumentImportState } from '@/features/documents/types/documents'

interface DocumentPreviewProps {
  state: DocumentImportState
  onProcess: () => void
  onReset: () => void
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentPreview({ onProcess, onReset, state }: DocumentPreviewProps) {
  const file =
    state.status === 'selected' || state.status === 'processing' || state.status === 'review' || state.status === 'error'
      ? state.file
      : null

  const previewUrl = useMemo(() => {
    if (!file || file.type === 'application/pdf') {
      return null
    }

    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const title = useMemo(() => {
    if (state.status === 'processing') {
      return 'Procesando documento'
    }

    if (state.status === 'review') {
      return 'Vista previa lista para revision'
    }

    if (state.status === 'error') {
      return 'No pudimos preparar el documento'
    }

    return 'Archivo seleccionado'
  }, [state.status])

  if (!file) {
    return null
  }

  return (
    <Card className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Documento</p>
          <h2 className="mt-2 text-xl font-semibold text-text-primary">{title}</h2>
          <p className="mt-2 text-sm text-text-secondary">{file.name} · {formatFileSize(file.size)}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          {file.type === 'application/pdf' ? <FileText className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
        </div>
      </div>

      {previewUrl ? (
        <div className="overflow-hidden rounded-[1.5rem] border border-outline bg-app-bg">
          <img alt={file.name} className="max-h-72 w-full object-cover" src={previewUrl} />
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-outline bg-panel-muted p-5 text-sm text-text-secondary">
          El archivo se preparara para lectura y clasificacion. Primero usamos el texto real del PDF y, si la capa IA esta
          disponible, enriquecemos la lectura antes de tu revision manual.
        </div>
      )}

      {state.status === 'error' ? (
        <div className="rounded-[1.4rem] border border-danger/25 bg-danger-soft p-4 text-sm text-danger">
          {state.message}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button onClick={onReset} variant="ghost">
          Cambiar archivo
        </Button>
        {state.status === 'selected' ? <Button onClick={onProcess}>Analizar documento</Button> : null}
        {state.status === 'processing' ? (
          <Button disabled>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Procesando...
          </Button>
        ) : null}
      </div>
    </Card>
  )
}
