import type { ParsedDocumentExtractedData } from '@/features/documents/types/documents'

function parseLocalizedAmount(value: string) {
  const cleaned = value.replace(/[^\d,.-]/g, '')
  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')

  let normalized = cleaned

  if (lastComma !== -1 && lastDot !== -1) {
    normalized = lastComma > lastDot ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned.replace(/,/g, '')
  } else if (lastComma !== -1) {
    normalized = cleaned.replace(/\.(?=\d{3}\b)/g, '').replace(',', '.')
  } else {
    normalized = cleaned.replace(/,(?=\d{3}\b)/g, '')
  }

  const amount = Number(normalized)
  return Number.isNaN(amount) ? undefined : amount
}

function extractFirstAmount(rawText: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = rawText.match(pattern)

    if (!match?.[1]) {
      continue
    }

    const amount = parseLocalizedAmount(match[1])

    if (typeof amount === 'number') {
      return amount
    }
  }

  return undefined
}

function extractLineValue(lines: string[], patterns: RegExp[]) {
  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern)

      if (match?.[1]) {
        return match[1].trim()
      }
    }
  }

  return undefined
}

function extractEmployeeInfo(lines: string[]) {
  const candidateLine = lines.find((line) => /^\d{2,}\s+[\p{L}][\p{L}\s.'-]{3,}$/iu.test(line))

  if (!candidateLine) {
    return {
      employeeCode: undefined,
      employeeName: undefined,
    }
  }

  const match = candidateLine.match(/^(\d{2,})\s+(.+)$/)

  return {
    employeeCode: match?.[1],
    employeeName: match?.[2]?.trim(),
  }
}

function extractDeductions(lines: string[]) {
  const deductions: ParsedDocumentExtractedData['deductions'] = []

  for (const line of lines) {
    const match = line.match(/^([\p{L}][\p{L}0-9%.\s/-]+?)\s+([\d.,]+)$/iu)

    if (!match?.[1] || !match?.[2]) {
      continue
    }

    const name = match[1].trim()
    const upperName = name.toUpperCase()

    if (
      upperName === 'SUELDO' ||
      upperName.includes('NETO A PAGAR') ||
      upperName.includes('VOLANTE DE PAGO') ||
      upperName.includes('FECHA') ||
      upperName.includes('PERIODO')
    ) {
      continue
    }

    const amount = parseLocalizedAmount(match[2])

    if (typeof amount !== 'number') {
      continue
    }

    const looksLikeDeduction =
      upperName.includes('IMPUESTO') ||
      upperName.includes('PENSION') ||
      upperName.includes('SEGURO') ||
      upperName.includes('PRESTAMO') ||
      upperName.includes('DESC') ||
      upperName.includes('SAVICA') ||
      upperName.includes('JUBILACION')

    if (looksLikeDeduction) {
      deductions.push({
        name,
        amount,
      })
    }
  }

  return deductions
}

export function parsePayslip(rawText: string): ParsedDocumentExtractedData {
  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const company =
    lines.find((line) => /junta central electoral/i.test(line)) ??
    lines.find((line) => !/volante de pago/i.test(line) && /junta|empresa|institucion|ministerio|central/i.test(line))

  const employeeInfo = extractEmployeeInfo(lines)

  return {
    grossSalary: extractFirstAmount(rawText, [
      /(?:^|\n)\s*SUELDO\s+([\d.,]+)/im,
      /salario bruto[:\s$]*([\d.,]+)/i,
      /bruto[:\s$]*([\d.,]+)/i,
    ]),
    netSalary: extractFirstAmount(rawText, [
      /neto a pagar[:\s$]*([\d.,]+)/i,
      /salario neto[:\s$]*([\d.,]+)/i,
      /neto[:\s$]*([\d.,]+)/i,
    ]),
    date:
      extractLineValue(lines, [/^fecha[:\s-]*(\d{2}[/-]\d{2}[/-]\d{2,4})/i]) ??
      rawText.match(/(\d{2}[/-]\d{2}[/-]\d{2,4})/)?.[1],
    period: extractLineValue(lines, [/^periodo de pago[:\s-]*([A-Z0-9/-]+)/i, /^periodo[:\s-]*([A-Z0-9/-]+)/i]),
    company,
    employeeCode: employeeInfo.employeeCode,
    employeeName: employeeInfo.employeeName,
    department: extractLineValue(lines, [/^departamento[:\s-]*(.+)$/i]),
    position: extractLineValue(lines, [/^(?:cargo|posicion)[:\s-]*(.+)$/i]),
    municipality: extractLineValue(lines, [/^municipio[:\s-]*(.+)$/i]),
    bankAccount: extractLineValue(lines, [/^cuenta bancaria[:\s-]*(.+)$/i, /^cuenta[:\s-]*(.+)$/i]),
    deductions: extractDeductions(lines),
  }
}
