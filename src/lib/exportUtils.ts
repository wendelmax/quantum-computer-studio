export function downloadFile(content: string, filename: string, mimeType: string = 'application/octet-stream'): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function probabilitiesToCSV(probabilities: Record<string, number>): string {
  const header = 'state,probability'
  const rows = Object.entries(probabilities)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([state, prob]) => `${state},${prob.toFixed(6)}`)
  return [header, ...rows].join('\n')
}
