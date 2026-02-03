import type { Circuit, CircuitGate } from '../types/Circuit'

export type ValidationResult = { valid: true } | { valid: false; error: string }

export function validateCircuit(circuit: Circuit): ValidationResult {
  if (!circuit || typeof circuit.numQubits !== 'number') {
    return { valid: false, error: 'Invalid circuit: missing numQubits' }
  }
  const n = circuit.numQubits
  if (n < 1 || n > 16) {
    return { valid: false, error: 'numQubits must be between 1 and 16' }
  }
  if (!Array.isArray(circuit.gates)) {
    return { valid: false, error: 'Invalid circuit: gates must be an array' }
  }
  for (let i = 0; i < circuit.gates.length; i++) {
    const g = circuit.gates[i] as CircuitGate
    if (g.target < 0 || g.target >= n) {
      return { valid: false, error: `Gate ${i + 1}: target qubit ${g.target} out of range [0, ${n - 1}]` }
    }
    if (g.control != null && (g.control < 0 || g.control >= n)) {
      return { valid: false, error: `Gate ${i + 1}: control qubit ${g.control} out of range [0, ${n - 1}]` }
    }
    if (g.control != null && g.control === g.target) {
      return { valid: false, error: `Gate ${i + 1}: control and target must differ` }
    }
    if (g.type === 'Toffoli' && g.control2 != null) {
      if (g.control2 < 0 || g.control2 >= n) {
        return { valid: false, error: `Gate ${i + 1}: control2 qubit out of range` }
      }
      if (g.control2 === g.target || g.control2 === g.control) {
        return { valid: false, error: `Gate ${i + 1}: control2 must differ from control and target` }
      }
    }
    if (g.type === 'SWAP' && g.target2 != null) {
      if (g.target2 < 0 || g.target2 >= n) {
        return { valid: false, error: `Gate ${i + 1}: target2 qubit out of range` }
      }
      if (g.target2 === g.target) {
        return { valid: false, error: `Gate ${i + 1}: SWAP requires two different qubits` }
      }
    }
  }
  return { valid: true }
}

export function circuitDepth(circuit: Circuit): number {
  if (!circuit.gates.length) return 0
  const n = circuit.numQubits
  const countByQubit: number[] = Array.from({ length: n }, () => 0)
  for (const g of circuit.gates) {
    countByQubit[g.target]++
    if (g.control != null) countByQubit[g.control]++
    if (g.control2 != null) countByQubit[g.control2]++
    if (g.target2 != null) countByQubit[g.target2]++
  }
  return Math.max(...countByQubit, 0)
}
