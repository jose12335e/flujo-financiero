import { DOCUMENT_CLASSIFICATION_RULES } from '@/features/documents/constants/documentRules'
import type { DocumentClassificationResult } from '@/features/documents/types/documents'

function getConfidenceLabel(confidence: number): DocumentClassificationResult['confidenceLabel'] {
  if (confidence >= 0.75) {
    return 'high'
  }

  if (confidence >= 0.45) {
    return 'medium'
  }

  return 'low'
}

function scoreTextAgainstKeywords(text: string, keywords: string[]) {
  if (!text) {
    return 0
  }

  const normalized = text.toLowerCase()
  const matches = keywords.filter((keyword) => normalized.includes(keyword))
  return matches.length / keywords.length
}

export function classifyDocument(rawText: string): DocumentClassificationResult {
  const normalized = rawText.trim().toLowerCase()

  if (!normalized) {
    return {
      documentType: 'unknown',
      confidence: 0,
      confidenceLabel: 'low',
      debugReasons: ['No hay texto suficiente para clasificar el documento.'],
    }
  }

  const scoredRules = DOCUMENT_CLASSIFICATION_RULES.map((rule) => ({
    ...rule,
    score: scoreTextAgainstKeywords(normalized, rule.keywords),
  })).sort((left, right) => right.score - left.score)

  const bestRule = scoredRules[0]

  if (!bestRule || bestRule.score < bestRule.minConfidence) {
    return {
      documentType: 'unknown',
      confidence: Math.min(bestRule?.score ?? 0, 0.39),
      confidenceLabel: 'low',
      debugReasons: ['El texto extraido no coincide con suficientes senales de un volante de pago.'],
    }
  }

  const confidence = Number(bestRule.score.toFixed(2))

  return {
    documentType: bestRule.kind,
    confidence,
    confidenceLabel: getConfidenceLabel(confidence),
    debugReasons: [`Se detectaron terminos como ${bestRule.keywords.filter((keyword) => normalized.includes(keyword)).slice(0, 3).join(', ')}.`],
  }
}
