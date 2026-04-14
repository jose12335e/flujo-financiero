import type { DocumentTextExtractionResult } from '@/features/documents/types/documents'
import { normalizeExtractedText } from '@/features/documents/helpers/normalizeExtractedText'

export async function extractImageText(imageSource: Blob | string): Promise<DocumentTextExtractionResult> {
  try {
    const tesseract = await import('tesseract.js')
    const { data } = await tesseract.recognize(imageSource, 'spa')
    const rawText = normalizeExtractedText(data.text ?? '')

    if (!rawText) {
      return {
        rawText: '',
        extractionMethod: 'unavailable',
        usedOcrFallback: true,
        debugReasons: ['El OCR no devolvio texto suficiente del documento.'],
      }
    }

    return {
      rawText,
      extractionMethod: 'ocr',
      usedOcrFallback: true,
      debugReasons: ['Se aplico OCR con Tesseract.js como respaldo.'],
    }
  } catch {
    return {
      rawText: '',
      extractionMethod: 'unavailable',
      usedOcrFallback: true,
      debugReasons: ['No pudimos completar el OCR del documento en el navegador.'],
    }
  }
}
