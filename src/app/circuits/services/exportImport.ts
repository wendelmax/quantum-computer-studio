import type { Circuit, CircuitGate } from 'quantum-computer-js'

function getGateSymbol(type: string): string {
  const map: Record<string, string> = {
    'H': 'h', 'X': 'x', 'Y': 'y', 'Z': 'z',
    'CNOT': 'cx', 'RX': 'rx', 'RY': 'ry', 'RZ': 'rz'
  }
  return map[type] || type.toLowerCase()
}

// QASM logic has been moved to the 'quantum-computer-js' library.
// Use circuitToQASM() and parseQASM() from the package.

export function exportToCirq(circuit: Circuit): string {
  const lines: string[] = [
    'import cirq',
    'import numpy as np',
    '',
    'def create_circuit():',
    '    qubits = [cirq.GridQubit(0, i) for i in range(' + circuit.numQubits + ')]',
    '    circuit = cirq.Circuit()',
    ''
  ]

  for (const gate of circuit.gates) {
    const symbol = getGateSymbol(gate.type)

    if (gate.control !== undefined) {
      lines.push(`    circuit.append(cirq.${symbol}(qubits[${gate.control}], qubits[${gate.target}]))`)
    } else if (gate.angle !== undefined) {
      lines.push(`    circuit.append(cirq.${symbol}(qubits[${gate.target}])**(${gate.angle.toFixed(6)}))`)
    } else {
      lines.push(`    circuit.append(cirq.${symbol}(qubits[${gate.target}]))`)
    }
  }

  lines.push('    return circuit', '')
  lines.push('if __name__ == "__main__":', '    c = create_circuit()', '    print(c)')

  return lines.join('\n')
}

export function exportToQuil(circuit: Circuit): string {
  const lines: string[] = []

  for (let i = 0; i < circuit.numQubits; i++) {
    lines.push(`DECLARE ro BIT[${i}]`)
  }
  lines.push('')

  for (const gate of circuit.gates) {
    const symbol = getGateSymbol(gate.type).toUpperCase()

    if (gate.control !== undefined) {
      lines.push(`${symbol} ${gate.control} ${gate.target}`)
    } else if (gate.angle !== undefined) {
      lines.push(`${symbol}(${gate.angle.toFixed(6)}) ${gate.target}`)
    } else {
      lines.push(`${symbol} ${gate.target}`)
    }
  }

  return lines.join('\n')
}


function parseCirq(code: string): Circuit {
  const gates: CircuitGate[] = []
  const numQubitsMatch = code.match(/range\((\d+)\)/i)
  const numQubits = numQubitsMatch ? parseInt(numQubitsMatch[1]) : 2

  const gateRegex = /cirq\.(\w+)(?:\*?\*?\([^\)]*\))?\(qubits\[(\d+)\]\)(?:\s*,\s*qubits\[(\d+)\])?/g
  let match

  while ((match = gateRegex.exec(code)) !== null) {
    const [, type, target, control] = match
    const typeUpper = type.toUpperCase()

    if (control !== undefined) {
      gates.push({ type: typeUpper, target: parseInt(target), control: parseInt(control) })
    } else {
      const angleMatch = code.substring(match.index).match(/\*\*\(([^\)]+)\)/)
      const angle = angleMatch ? parseFloat(angleMatch[1]) : undefined
      gates.push({ type: typeUpper, target: parseInt(target), angle })
    }
  }

  return { numQubits, gates }
}

function parseQuil(code: string): Circuit {
  const gates: CircuitGate[] = []
  const decMatch = code.match(/DECLARE\s+ro\s+BIT\[(\d+)\]/g)
  const numQubits = decMatch ? decMatch.length : 2

  const lines = code.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('DECLARE')) continue

    const gateMatch = trimmed.match(/^(\w+)(?:\(([^\)]+)\))?\s+(\d+)(?:\s+(\d+))?/i)
    if (!gateMatch) continue

    const [, type, angleStr, target, control] = gateMatch
    const typeUpper = type.toUpperCase().replace('CNOT', 'CX')

    if (control !== undefined) {
      gates.push({ type: typeUpper, target: parseInt(target), control: parseInt(control) })
    } else if (angleStr) {
      gates.push({ type: typeUpper, target: parseInt(target), angle: parseFloat(angleStr) })
    } else {
      gates.push({ type: typeUpper, target: parseInt(target) })
    }
  }

  return { numQubits, gates }
}

export function importCircuit(code: string, format: 'qasm' | 'cirq' | 'quil'): Circuit {
  try {
    // QASM parsing is now handled by the library
    throw new Error('Please use parseQASM from quantum-computer-js for QASM format')
    if (format === 'cirq') return parseCirq(code)
    if (format === 'quil') return parseQuil(code)
    throw new Error('Unsupported format')
  } catch (err) {
    throw new Error('Error importing circuit: ' + (err as Error).message)
  }
}

export function detectFormat(code: string): 'qasm' | 'cirq' | 'quil' | 'unknown' {
  if (code.includes('OPENQASM') || code.includes('qreg')) return 'qasm'
  if (code.includes('cirq') || code.includes('GridQubit')) return 'cirq'
  if (code.includes('DECLARE') || code.includes('DEFGATE')) return 'quil'
  return 'unknown'
}

