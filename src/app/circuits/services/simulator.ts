import type { Circuit } from '../../../types/Circuit'
import type { Result } from '../../../types/Result'
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

function applySWAP(state: Complex[], _n: number, q1: number, q2: number): Complex[] {
  const size = state.length
  const out = new Array<Complex>(size)
  const mask1 = 1 << q1
  const mask2 = 1 << q2
  for (let i = 0; i < size; i++) {
    const b1 = (i & mask1) !== 0 ? 1 : 0
    const b2 = (i & mask2) !== 0 ? 1 : 0
    if (b1 !== b2) out[i] = state[i ^ mask1 ^ mask2]
    else out[i] = state[i]
  }
  return out
}

function applyToffoli(state: Complex[], c1: number, c2: number, target: number): Complex[] {
  const size = state.length
  const out = new Array<Complex>(size)
  const m1 = 1 << c1
  const m2 = 1 << c2
  const flip = 1 << target
  for (let i = 0; i < size; i++) {
    if ((i & m1) !== 0 && (i & m2) !== 0) out[i] = state[i ^ flip]
    else out[i] = state[i]
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
  } else if (name === 'S') {
    matrix = [[C(1), C(0)], [C(0), C(0, 1)]]
  } else if (name === 'T') {
    const s = Math.SQRT1_2
    matrix = [[C(1), C(0)], [C(0), C(s, s)]]
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

export type SimulatorOptions = {
  shots?: number
  noise?: number
}

function applyNoise(state: Complex[], n: number, p: number): Complex[] {
  if (p <= 0) return state
  const size = state.length
  const out = state.slice()
  for (let q = 0; q < n; q++) {
    if (Math.random() >= p) continue
    const stride = 1 << q
    const period = stride << 1
    for (let i = 0; i < size; i += period) {
      for (let j = 0; j < stride; j++) {
        const i0 = i + j
        const i1 = i + j + stride
        ;[out[i0], out[i1]] = [out[i1], out[i0]]
      }
    }
  }
  return out
}

export async function runSimulation(circuit: Circuit, options: SimulatorOptions = {}): Promise<Result> {
  const { shots, noise = 0 } = options
  const w = getWorker()
  if (w && shots == null && noise === 0) {
    const response: Result = await new Promise((resolve, reject) => {
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
    if (gate.type === 'M' || gate.type === 'MEASURE') continue
    if (gate.type === 'CNOT') {
      state = applyCNOT(state, gate.control ?? 0, gate.target)
    } else if (gate.type === 'SWAP' && gate.target2 != null) {
      state = applySWAP(state, n, gate.target, gate.target2)
    } else if (gate.type === 'Toffoli' && gate.control != null && gate.control2 != null) {
      state = applyToffoli(state, gate.control, gate.control2, gate.target)
    } else {
      const U = gateMatrix(gate.type, gate.angle)
      if (U) state = applySingleQubit(state, n, gate.target, U)
    }
    if (noise > 0) state = applyNoise(state, n, noise)
  }

  const probs: Record<string, number> = {}
  for (let i = 0; i < size; i++) {
    const key = i.toString(2).padStart(n, '0')
    probs[key] = norm2(state[i])
  }

  if (shots != null && shots > 0) {
    const keys = Object.keys(probs)
    const sum = keys.reduce((s, k) => s + probs[k], 0)
    const weights = sum > 0 ? keys.map(k => probs[k] / sum) : keys.map(() => 1 / keys.length)
    const counts: Record<string, number> = {}
    keys.forEach(k => { counts[k] = 0 })
    for (let s = 0; s < shots; s++) {
      let r = Math.random()
      for (let i = 0; i < keys.length; i++) {
        r -= weights[i]
        if (r <= 0 || i === keys.length - 1) {
          counts[keys[i]]++
          break
        }
      }
    }
    const total = shots
    const sampledProbs: Record<string, number> = {}
    keys.forEach(k => { sampledProbs[k] = counts[k] / total })
    return {
      probabilities: sampledProbs,
      stateVector: state.flatMap(c => [c.r, c.i]),
    }
  }

  return {
    probabilities: probs,
    stateVector: state.flatMap(c => [c.r, c.i]),
  }
}


