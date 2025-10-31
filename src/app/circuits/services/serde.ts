import type { Circuit, Gate } from '../hooks/useCircuitEngine'

type EnglishGate = { type: string; target: number; control?: number; angle?: number }
type EnglishCircuit = { qubits: number; gates: EnglishGate[]; version?: string }

export function toEnglishCircuit(c: Circuit): EnglishCircuit {
  return {
    version: '1.0.0',
    qubits: c.numQubits,
    gates: c.gates.map(g => ({ type: g.type, target: g.target, control: g.control, angle: g.angle }))
  }
}

export function fromAnyCircuit(jsonText: string): Circuit {
  const data = JSON.parse(jsonText)
  if (data && typeof data === 'object' && Array.isArray(data.gates)) {
    return {
      numQubits: Number(data.qubits) || 1,
      gates: (data.gates as EnglishGate[]).map(g => ({ type: g.type, target: g.target, control: g.control, angle: g.angle }))
    }
  }
  if (data && typeof data === 'object' && Array.isArray(data.gates)) {
    return data as Circuit
  }
  throw new Error('Unsupported circuit format')
}


