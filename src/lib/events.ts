import type { Circuit } from '../types/Circuit'

export type QuantumSetCircuitDetail = { circuit: Circuit; autoRun?: boolean }
export type QuantumAlgorithmExecutionDetail = { algorithm: string; executionTime: number; states: number }

declare global {
  interface WindowEventMap {
    'quantum:set-circuit': CustomEvent<QuantumSetCircuitDetail>
    'quantum:clear-circuit': CustomEvent<void>
    'quantum:algorithm-execution': CustomEvent<QuantumAlgorithmExecutionDetail>
  }
}

export const QUANTUM_SET_CIRCUIT = 'quantum:set-circuit'
export const QUANTUM_CLEAR_CIRCUIT = 'quantum:clear-circuit'
export const QUANTUM_ALGORITHM_EXECUTION = 'quantum:algorithm-execution'
