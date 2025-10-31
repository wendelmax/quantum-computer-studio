type ParsedGate = {
  type: string
  target: number
  control?: number
  angle?: number
}

export function parseQASM(code: string): ParsedGate[] {
  const gates: ParsedGate[] = []
  const lines = code.split('\n')
  
  lines.forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('OPENQASM')) return
    
    const matchGate = trimmed.match(/^(h|x|y|z|cx|cy|cz|u|rx|ry|rz)\s*(?:\[(\d+)\])?\s*,?\s*(\[(\d+)\])?/i)
    if (!matchGate) return
    
    const [, gateType, targetIdx, _, controlIdx] = matchGate
    const lowerType = gateType.toLowerCase()
    
    if (lowerType === 'cx' || lowerType === 'cy' || lowerType === 'cz') {
      gates.push({
        type: lowerType.toUpperCase(),
        target: controlIdx ? parseInt(controlIdx) : 0,
        control: targetIdx ? parseInt(targetIdx) : 0
      })
    } else if (lowerType === 'rx' || lowerType === 'ry' || lowerType === 'rz') {
      const angleMatch = trimmed.match(/\((.*?)\)/)
      const angle = angleMatch ? parseFloat(angleMatch[1]) : 0
      gates.push({
        type: lowerType.toUpperCase(),
        target: targetIdx ? parseInt(targetIdx) : 0,
        angle
      })
    } else {
      gates.push({
        type: lowerType.toUpperCase(),
        target: targetIdx ? parseInt(targetIdx) : 0
      })
    }
  })
  
  return gates
}

export function qasmToCircuit(code: string, numQubits: number = 5) {
  const gates = parseQASM(code)
  return {
    numQubits,
    gates: gates.map(g => ({
      type: g.type,
      target: g.target,
      control: g.control,
      angle: g.angle
    }))
  }
}

