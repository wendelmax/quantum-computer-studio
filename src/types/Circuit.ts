export type QuantumCircuit = {
  numQubits: number
  gates: Array<{ type: string; target: number; control?: number; angle?: number }>
}

export type CircuitGate = { type: string; target: number; control?: number; angle?: number }
export type Circuit = { numQubits: number; gates: CircuitGate[] }


