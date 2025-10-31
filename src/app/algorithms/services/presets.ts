import type { Circuit } from '../../circuits/hooks/useCircuitEngine'

export function getPreset(id: string): Circuit {
  switch (id) {
    case 'grover':
      return { numQubits: 3, gates: [ 
        { type: 'H', target: 0 }, { type: 'H', target: 1 }, 
        { type: 'X', target: 2 }, { type: 'H', target: 2 },
        { type: 'CNOT', target: 2, control: 1 },
        { type: 'CNOT', target: 2, control: 0 },
        { type: 'H', target: 2 }
      ] }
    case 'deutsch-jozsa':
      return { numQubits: 3, gates: [ 
        { type: 'X', target: 2 }, { type: 'H', target: 0 }, 
        { type: 'H', target: 1 }, { type: 'H', target: 2 }
      ] }
    case 'shor':
      return { numQubits: 2, gates: [ { type: 'H', target: 0 } ] }
    case 'qft':
      return { numQubits: 3, gates: [ 
        { type: 'H', target: 0 }, 
        { type: 'RZ', target: 1, angle: Math.PI/2 },
        { type: 'RZ', target: 2, angle: Math.PI/4 }
      ] }
    case 'qpe':
      return { numQubits: 3, gates: [ 
        { type: 'H', target: 0 }, { type: 'H', target: 1 },
        { type: 'RZ', target: 2, angle: Math.PI/4 },
        { type: 'CNOT', target: 2, control: 0 }
      ] }
    case 'bernstein-vazirani':
      return { numQubits: 4, gates: [ 
        { type: 'X', target: 3 }, { type: 'H', target: 0 }, 
        { type: 'H', target: 1 }, { type: 'H', target: 2 }, { type: 'H', target: 3 },
        { type: 'CNOT', target: 3, control: 0 },
        { type: 'CNOT', target: 3, control: 1 },
        { type: 'H', target: 0 }, { type: 'H', target: 1 }, { type: 'H', target: 2 }
      ] }
    case 'simon':
      return { numQubits: 6, gates: [ 
        { type: 'H', target: 0 }, { type: 'H', target: 1 }, { type: 'H', target: 2 },
        { type: 'CNOT', target: 3, control: 0 },
        { type: 'CNOT', target: 4, control: 1 },
        { type: 'CNOT', target: 5, control: 2 },
        { type: 'H', target: 0 }, { type: 'H', target: 1 }, { type: 'H', target: 2 }
      ] }
    case 'qaoa':
      return { numQubits: 3, gates: [ 
        { type: 'X', target: 0 }, { type: 'H', target: 1 }, { type: 'H', target: 2 },
        { type: 'RZ', target: 0, angle: Math.PI/3 },
        { type: 'RZ', target: 1, angle: Math.PI/4 },
        { type: 'CNOT', target: 1, control: 0 },
        { type: 'CNOT', target: 2, control: 1 }
      ] }
    case 'vqe':
      return { numQubits: 2, gates: [ 
        { type: 'RY', target: 0, angle: Math.PI/4 },
        { type: 'RY', target: 1, angle: Math.PI/6 },
        { type: 'CNOT', target: 1, control: 0 },
        { type: 'RZ', target: 1, angle: Math.PI/3 }
      ] }
    default:
      return { numQubits: 1, gates: [ { type: 'H', target: 0 } ] }
  }
}


