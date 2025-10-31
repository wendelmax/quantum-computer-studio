import type { Circuit } from '../../circuits/hooks/useCircuitEngine'

export type Oracle = {
  id: string
  name: string
  description: string
  category: 'Constant' | 'Balanced' | 'Phase' | 'Custom'
  numQubits: number
  circuit: Circuit
  truthTable: Record<string, string>
  application: string
  algorithm: 'Deutsch-Jozsa' | 'Grover' | 'Bernstein-Vazirani' | 'Simon' | 'All'
}

export const oracles: Oracle[] = [
  {
    id: 'constant-0',
    name: 'Constant Oracle (Always 0)',
    description: 'Returns 0 for all possible inputs, representing a constant function',
    category: 'Constant',
    numQubits: 2,
    circuit: { numQubits: 2, gates: [] },
    truthTable: { '00': '0', '01': '0', '10': '0', '11': '0' },
    application: 'Testing Deutsch-Jozsa',
    algorithm: 'Deutsch-Jozsa'
  },
  {
    id: 'constant-1',
    name: 'Constant Oracle (Always 1)',
    description: 'Returns 1 for all possible inputs, representing a constant function',
    category: 'Constant',
    numQubits: 2,
    circuit: { numQubits: 2, gates: [{ type: 'X', target: 1 }] },
    truthTable: { '00': '1', '01': '1', '10': '1', '11': '1' },
    application: 'Testing Deutsch-Jozsa',
    algorithm: 'Deutsch-Jozsa'
  },
  {
    id: 'balanced-xor',
    name: 'Balanced XOR Oracle',
    description: 'Returns 1 when inputs differ (XOR operation)',
    category: 'Balanced',
    numQubits: 2,
    circuit: { numQubits: 2, gates: [{ type: 'CNOT', target: 1, control: 0 }] },
    truthTable: { '00': '0', '01': '1', '10': '1', '11': '0' },
    application: 'Testing Deutsch-Jozsa',
    algorithm: 'Deutsch-Jozsa'
  },
  {
    id: 'balanced-parity',
    name: 'Balanced Parity Oracle',
    description: 'Returns 1 for odd parity (odd number of 1s)',
    category: 'Balanced',
    numQubits: 2,
    circuit: { numQubits: 2, gates: [{ type: 'CNOT', target: 1, control: 0 }, { type: 'X', target: 1 }] },
    truthTable: { '00': '1', '01': '0', '10': '0', '11': '1' },
    application: 'Testing Deutsch-Jozsa',
    algorithm: 'Deutsch-Jozsa'
  },
  {
    id: 'phase-oracle-0',
    name: 'Phase Oracle (|00⟩)',
    description: 'Flips phase of |00⟩ state',
    category: 'Phase',
    numQubits: 2,
    circuit: { 
      numQubits: 2, 
      gates: [
        { type: 'X', target: 0 },
        { type: 'X', target: 1 },
        { type: 'Z', target: 0 },
        { type: 'Z', target: 1 },
        { type: 'X', target: 0 },
        { type: 'X', target: 1 }
      ] 
    },
    truthTable: { '00': '1', '01': '0', '10': '0', '11': '0' },
    application: 'Grover search',
    algorithm: 'Grover'
  },
  {
    id: 'phase-oracle-1',
    name: 'Phase Oracle (|11⟩)',
    description: 'Flips phase of |11⟩ state',
    category: 'Phase',
    numQubits: 2,
    circuit: { 
      numQubits: 2, 
      gates: [
        { type: 'Z', target: 0 },
        { type: 'Z', target: 1 },
        { type: 'CNOT', target: 1, control: 0 },
        { type: 'Z', target: 0 }
      ] 
    },
    truthTable: { '00': '0', '01': '0', '10': '0', '11': '1' },
    application: 'Grover search',
    algorithm: 'Grover'
  },
  {
    id: 'phase-oracle-2',
    name: 'Phase Oracle (|10⟩)',
    description: 'Flips phase of |10⟩ state',
    category: 'Phase',
    numQubits: 2,
    circuit: { 
      numQubits: 2, 
      gates: [
        { type: 'X', target: 1 },
        { type: 'Z', target: 0 },
        { type: 'CNOT', target: 1, control: 0 },
        { type: 'Z', target: 0 },
        { type: 'X', target: 1 }
      ] 
    },
    truthTable: { '00': '0', '01': '0', '10': '1', '11': '0' },
    application: 'Grover search',
    algorithm: 'Grover'
  },
  {
    id: 'bernstein-vazirani-11',
    name: 'BV Oracle (Hidden String: 11)',
    description: 'Hidden string oracle for Bernstein-Vazirani algorithm',
    category: 'Custom',
    numQubits: 3,
    circuit: { 
      numQubits: 3, 
      gates: [
        { type: 'CNOT', target: 2, control: 0 },
        { type: 'CNOT', target: 2, control: 1 }
      ] 
    },
    truthTable: { '000': '0', '001': '1', '010': '1', '011': '0', '100': '1', '101': '0', '110': '0', '111': '1' },
    application: 'Bernstein-Vazirani',
    algorithm: 'Bernstein-Vazirani'
  },
  {
    id: 'bernstein-vazirani-10',
    name: 'BV Oracle (Hidden String: 10)',
    description: 'Hidden string oracle for Bernstein-Vazirani algorithm',
    category: 'Custom',
    numQubits: 3,
    circuit: { 
      numQubits: 3, 
      gates: [
        { type: 'CNOT', target: 2, control: 0 }
      ] 
    },
    truthTable: { '000': '0', '001': '1', '010': '0', '011': '1', '100': '1', '101': '0', '110': '1', '111': '0' },
    application: 'Bernstein-Vazirani',
    algorithm: 'Bernstein-Vazirani'
  }
]

