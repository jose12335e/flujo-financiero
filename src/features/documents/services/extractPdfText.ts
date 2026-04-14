import type { DocumentTextExtractionResult } from '@/features/documents/types/documents'
import { normalizeExtractedText } from '@/features/documents/helpers/normalizeExtractedText'
import { extractImageText } from '@/features/documents/services/extractImageText'

export async function extractPdfText(file: File): Promise<DocumentTextExtractionResult> {
  const reasons: string[] = []

  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
    const workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString()
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

    const documentBuffer = await file.arrayBuffer()
    const documentTask = pdfjs.getDocument({ data: documentBuffer })
    const pdfDocument = await documentTask.promise
    const pageTexts: string[] = []

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber)
      const content = await page.getTextContent()
      const pageText = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .trim()

      if (pageText) {
        pageTexts.push(pageText)
      }
    }

    const normalizedText = normalizeExtractedText(pageTexts.join('\n'))

    if (!normalizedText) {
      reasons.push('El PDF no expuso texto seleccionable. Intentaremos OCR sobre la primera pagina.')

      try {
        const firstPage = await pdfDocument.getPage(1)
        const viewport = firstPage.getViewport({ scale: 2 })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        if (!context) {
          throw new Error('canvas-unavailable')
        }

        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)

        await firstPage.render({
          canvas,
          canvasContext: context,
          viewport,
        }).promise

        const ocrResult = await extractImageText(canvas.toDataURL('image/png'))
        return {
          ...ocrResult,
          debugReasons: [...reasons, ...ocrResult.debugReasons],
        }
      } catch {
        return {
          rawText: '',
          extractionMethod: 'unavailable',
          usedOcrFallback: false,
          debugReasons: [...reasons, 'No pudimos ejecutar el OCR de respaldo sobre el PDF.'],
        }
      }
    }

    reasons.push('Se extrajo texto nativo del PDF.')
    return {
      rawText: normalizedText,
      extractionMethod: 'pdf-text',
      usedOcrFallback: false,
      debugReasons: reasons,
    }
  } catch {
    reasons.push('No pudimos leer el PDF. Verifica que el archivo no este protegido o danado.')
    return {
      rawText: '',
      extractionMethod: 'unavailable',
      usedOcrFallback: false,
      debugReasons: reasons,
    }
  }
}
