export type CircuitGate = {
  type: string
  target: number
  control?: number
  control2?: number
  target2?: number
  angle?: number
}

export type Circuit = {
  numQubits: number
  gates: CircuitGate[]
  initialStates?: Record<number, '0' | '1'>
}
