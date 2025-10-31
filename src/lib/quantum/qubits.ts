export type QubitIndex = number
export function clampQubits(n: number): number { return Math.min(16, Math.max(1, n)) }

export type QubitRegister = { size: number }
export function createRegister(size: number): QubitRegister {
  return { size }
}


