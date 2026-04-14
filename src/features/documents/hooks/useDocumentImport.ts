import { useState } from 'react'

import { useAuth } from '@/hooks/useAuth'
import { analyzePayslipDocument } from '@/features/documents/services/analyzePayslipDocument'
import type {
  DocumentImportState,
  ParsedDeduction,
  ParsedDocumentExtractedData,
} from '@/features/documents/types/documents'

export function useDocumentImport() {
  const [state, setState] = useState<DocumentImportState>({ status: 'idle' })
  const { user } = useAuth()

  const selectedFile =
    state.status === 'selected' || state.status === 'processing' || state.status === 'review' || state.status === 'error'
      ? state.file
      : undefined

  const canProcess = state.status === 'selected' && Boolean(state.file)

  const selectFile = (file: File) => {
    setState({ status: 'selected', file })
  }

  const reset = () => {
    setState({ status: 'idle' })
  }

  const processSelectedFile = async () => {
    if (state.status !== 'selected') {
      return
    }

    const file = state.file
    setState({ status: 'processing', file })

    try {
      const result = await analyzePayslipDocument(file, { userId: user?.id })
      setState({
        status: 'review',
        file,
        result,
      })
    } catch (error) {
      setState({
        status: 'error',
        file,
        message: error instanceof Error ? error.message : 'No pudimos leer este PDF. Verifica el archivo e intenta nuevamente.',
      })
    }
  }

  const updateExtractedField = <Key extends keyof ParsedDocumentExtractedData>(
    field: Key,
    value: ParsedDocumentExtractedData[Key],
  ) => {
    setState((currentState) => {
      if (currentState.status !== 'review') {
        return currentState
      }

      return {
        ...currentState,
        result: {
          ...currentState.result,
          extracted: {
            ...currentState.result.extracted,
            [field]: value,
          },
        },
      }
    })
  }

  const updateDeductions = (deductions: ParsedDeduction[]) => {
    updateExtractedField('deductions', deductions)
  }

  return {
    state,
    selectedFile,
    canProcess,
    actions: {
      selectFile,
      processSelectedFile,
      updateExtractedField,
      updateDeductions,
      reset,
    },
  }
}
