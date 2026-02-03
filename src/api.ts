export type { Circuit, CircuitGate } from './types/Circuit'
export type { Result } from './types/Result'
export type { Algorithm } from './types/Algorithm'
export type { QubitIndex, QubitRegister } from './lib/quantum/qubits'

export {
  C,
  add,
  sub,
  mul,
  scale,
  conj,
  norm2,
  zero,
  one,
} from './lib/quantum/complex'
export type { Complex } from './lib/quantum/complex'

export { GATES } from './lib/quantum/gates'
export type { GateName } from './lib/quantum/gates'

export { clampQubits, createRegister } from './lib/quantum/qubits'
export { radians, normalize, clamp } from './lib/quantum/quantum-math'
export { stateToBloch, toBlochPoint } from './lib/quantum/bloch-sphere'
export type { BlochCoords, BlochPoint } from './lib/quantum/bloch-sphere'

export { validateCircuit, circuitDepth } from './lib/circuitUtils'
export type { ValidationResult } from './lib/circuitUtils'

export { runSimulation, clearCache } from './app/circuits/services/simulator'
export type { SimulatorOptions } from './app/circuits/services/simulator'
