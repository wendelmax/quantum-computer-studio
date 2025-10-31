import type { Circuit, ExecutionResult } from '../hooks/useCircuitEngine'
import { C, Complex, add, mul, scale, norm2, zero } from '../../../lib/quantum/complex'

const gateMatrixCache = new Map<string, Complex[][]>()
const SQRT2 = Math.SQRT2

export function clearCache(): void {
  gateMatrixCache.clear()
}

let worker: Worker | null = null
function getWorker(): Worker | null {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') return null
  try {
    if (!worker) worker = new Worker(new URL('../../../workers/simWorker.ts', import.meta.url), { type: 'module' })
    return worker
  } catch {
    return null
  }
}

function zeros(n: number): Complex[] { return Array.from({length:n}, () => C(0,0)) }
function basis(n: number, idx: number): Complex[] { const v = zeros(n); v[idx] = C(1,0); return v }

function applySingleQubit(state: Complex[], nQ: number, target: number, U: Complex[][]): Complex[] {
  const size = state.length
  const stride = 1 << target
  const period = stride << 1
  const out = new Array<Complex>(size)
  
  const u00 = U[0][0], u01 = U[0][1], u10 = U[1][0], u11 = U[1][1]
  
  for (let i = 0; i < size; i += period) {
    for (let j = 0; j < stride; j++) {
      const i0 = i + j
      const i1 = i + j + stride
      const a0 = state[i0]
      const a1 = state[i1]
      out[i0] = add(mul(u00, a0), mul(u01, a1))
      out[i1] = add(mul(u10, a0), mul(u11, a1))
    }
  }
  return out
}

function applyCNOT(state: Complex[], control: number, target: number): Complex[] {
  if (control === undefined || target === undefined) return state
  const size = state.length
  const out = new Array<Complex>(size)
  const bitMask = 1 << control
  const flipMask = 1 << target
  
  for (let i = 0; i < size; i++) {
    if ((i & bitMask) !== 0) {
      const j = i ^ flipMask
      out[i] = state[j]
      out[j] = state[i]
    } else {
      out[i] = state[i]
    }
  }
  return out
}

function gateMatrix(name: string, angle?: number): Complex[][] {
  if (angle !== undefined) {
    const cacheKey = `${name}_${angle.toFixed(10)}`
    if (gateMatrixCache.has(cacheKey)) {
      return gateMatrixCache.get(cacheKey)!
    }
  }
  
  let matrix: Complex[][]
  
  if (name === 'H') {
    matrix = [[C(1/SQRT2), C(1/SQRT2)], [C(1/SQRT2), C(-1/SQRT2)]]
  } else if (name === 'X') {
    matrix = [[C(0), C(1)], [C(1), C(0)]]
  } else if (name === 'Y') {
    matrix = [[C(0), C(0,-1)], [C(0,1), C(0)]]
  } else if (name === 'Z') {
    matrix = [[C(1), C(0)], [C(0), C(-1)]]
  } else if (angle !== undefined) {
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    const c2 = Math.cos(angle / 2)
    const s2 = Math.sin(angle / 2)
    
    if (name === 'RX') {
      matrix = [[C(c), C(0,-s)], [C(0,-s), C(c)]]
    } else if (name === 'RY') {
      matrix = [[C(c), C(-s)], [C(s), C(c)]]
    } else if (name === 'RZ') {
      matrix = [[C(c2, -s2), C(0)], [C(0), C(c2, s2)]]
    } else {
      matrix = [[C(1), C(0)], [C(0), C(1)]]
    }
  } else {
    matrix = [[C(1), C(0)], [C(0), C(1)]]
  }
  
  if (angle !== undefined) {
    const cacheKey = `${name}_${angle.toFixed(10)}`
    gateMatrixCache.set(cacheKey, matrix)
  }
  
  return matrix
}

export async function runSimulation(circuit: Circuit): Promise<ExecutionResult> {
  const w = getWorker()
  if (w) {
    const response: ExecutionResult = await new Promise((resolve, reject) => {
      const onMessage = (ev: MessageEvent) => {
        const data = ev.data
        if (data && data.ok) {
          w.removeEventListener('message', onMessage)
          resolve(data.result)
        } else if (data && data.error) {
          w.removeEventListener('message', onMessage)
          reject(new Error(data.error))
        }
      }
      w.addEventListener('message', onMessage)
      w.postMessage({ type: 'simulate', circuit })
    })
    return response
  }
  const n = circuit.numQubits
  const size = 1 << n
  let initIdx = 0
  const initialStates = circuit.initialStates || {}
  for (let q = 0; q < n; q++) {
    if (initialStates[q] === '1') {
      initIdx |= (1 << q)
    }
  }
  let state: Complex[] = basis(size, initIdx)

  for (const gate of circuit.gates) {
    if (gate.type === 'CNOT') {
      state = applyCNOT(state, gate.control ?? 0, gate.target)
    } else {
      const U = gateMatrix(gate.type, gate.angle)
      state = applySingleQubit(state, n, gate.target, U)
    }
  }

  const probs: Record<string, number> = {}
  for (let i = 0; i < size; i++) {
    const key = i.toString(2).padStart(n, '0')
    probs[key] = norm2(state[i])
  }

  return {
    probabilities: probs,
    stateVector: state.flatMap(c => [c.r, c.i]),
  }
}


