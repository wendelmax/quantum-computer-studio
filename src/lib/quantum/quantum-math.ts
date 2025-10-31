export function radians(deg: number): number { return (deg * Math.PI) / 180 }
export function normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((s,v)=> s + v*v, 0)) || 1
  return vec.map(v => v / norm)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}


