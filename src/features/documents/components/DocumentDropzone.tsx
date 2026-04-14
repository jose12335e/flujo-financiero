import { FileUp, ScanText } from 'lucide-react'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

import { Button } from '@/components/ui/Button'
import { DOCUMENT_ACCEPTED_FILES, DOCUMENT_MAX_SIZE_BYTES } from '@/features/documents/constants/documentRules'

interface DocumentDropzoneProps {
  onFileSelected: (file: File) => void
}

export function DocumentDropzone({ onFileSelected }: DocumentDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const [file] = acceptedFiles

      if (file) {
        onFileSelected(file)
      }
    },
    [onFileSelected],
  )

  const { getInputProps, getRootProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: DOCUMENT_ACCEPTED_FILES,
    maxFiles: 1,
    maxSize: DOCUMENT_MAX_SIZE_BYTES,
    multiple: false,
    noClick: true,
  })

  return (
    <div
      {...getRootProps()}
      className={`rounded-[1.8rem] border border-dashed p-6 transition sm:p-8 ${
        isDragActive ? 'border-brand bg-brand-soft/40 shadow-card' : 'border-outline bg-panel-muted/60'
      }`}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col gap-5 text-center sm:text-left">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand sm:mx-0">
          <FileUp className="h-7 w-7" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-text-primary">Sube un volante de pago en PDF</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Esta fase trabaja solo con payslips. Primero se intenta recuperar el texto real del PDF y, si no existe, se prueba OCR de respaldo.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-text-muted sm:justify-start">
          <span className="rounded-full border border-outline bg-panel px-3 py-1.5">PDF</span>
          <span className="rounded-full border border-outline bg-panel px-3 py-1.5">Volante de pago</span>
          <span className="rounded-full border border-outline bg-panel px-3 py-1.5">Max. 12 MB</span>
        </div>

        <div className="rounded-[1.3rem] border border-outline bg-panel p-4 text-left text-sm text-text-secondary">
          <div className="flex items-center gap-2 text-text-primary">
            <ScanText className="h-4 w-4 text-brand" />
            <p className="font-semibold">Lectura en cliente</p>
          </div>
          <p className="mt-2 leading-6">
            La lectura ocurre dentro del navegador con PDF.js. Si el PDF viene escaneado, se intenta OCR con Tesseract.js sobre la primera pagina.
          </p>
        </div>

        <div className="flex justify-center sm:justify-start">
          <Button onClick={open}>Seleccionar PDF</Button>
        </div>
      </div>
    </div>
  )
}
