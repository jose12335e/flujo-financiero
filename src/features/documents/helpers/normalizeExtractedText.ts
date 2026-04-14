export function normalizeExtractedText(rawText: string) {
  return rawText
    .replace(/\u00a0/g, ' ')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .filter((line, index, allLines) => line.length > 0 || (allLines[index - 1] && allLines[index - 1].length > 0))
    .join('\n')
    .trim()
}
