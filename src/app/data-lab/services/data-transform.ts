export function normalizeRows(rows: string[][]): number[][] {
  return rows.map(r => r.map(v => Number(v) || 0))
}

export function normalizeDataset(values: number[]): number[] {
  const max = Math.max(...values.map(v => Math.abs(v)) || [1])
  if (max === 0) return values
  return values.map(v => v / max)
}


