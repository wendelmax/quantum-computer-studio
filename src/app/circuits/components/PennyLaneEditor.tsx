import React, { useMemo } from 'react'
import Editor from '@monaco-editor/react'
import type { Circuit } from 'quantum-computer-js'
import Card from '../../../components/Card'
import { copyToClipboard } from '../../../lib/exportUtils'
import { toast } from 'sonner'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'

interface Props {
  circuit: Circuit
}

// Helper to convert internal circuit format to PennyLane Python code
export function generatePennyLaneCode(circuit: Circuit): string {
  const numQubits = circuit.numQubits || 1
  let code = `import pennylane as qml
from pennylane import numpy as np

# Initialize the device
dev = qml.device("default.qubit", wires=${numQubits}, shots=1024)

@qml.qnode(dev)
def quantum_circuit():
    # Apply Gates
`
  
  if (circuit.initialStates && Object.keys(circuit.initialStates).length > 0) {
    for (const [qStr, state] of Object.entries(circuit.initialStates)) {
      if (Number(state) === 1) code += `    qml.PauliX(wires=${qStr})\n`
    }
  }

  circuit.gates.forEach(g => {
    const type = g.type.toLowerCase()
    const target = g.target
    const control = g.control
    const control2 = g.control2
    const target2 = g.target2
    const angle = g.angle

    if (typeof control === 'number') {
      if (typeof control2 === 'number') {
        if (type === 'x') code += `    qml.Toffoli(wires=[${control}, ${control2}, ${target}])\n`
        else code += `    # Warning: Missing PennyLane translation for 3-qubit gate ${type}\n`
      } else {
        if (type === 'x') code += `    qml.CNOT(wires=[${control}, ${target}])\n`
        else if (type === 'z') code += `    qml.CZ(wires=[${control}, ${target}])\n`
        else if (type === 'y') code += `    qml.CY(wires=[${control}, ${target}])\n`
        else if (type === 'h') code += `    qml.ctrl(qml.Hadamard, control=${control})(wires=${target})\n`
        else if (type === 'swap' && typeof target2 === 'number') code += `    qml.CSWAP(wires=[${control}, ${target}, ${target2}])\n`
        else if (angle !== undefined) {
          if (type === 'rx') code += `    qml.CRX(${angle}, wires=[${control}, ${target}])\n`
          else if (type === 'ry') code += `    qml.CRY(${angle}, wires=[${control}, ${target}])\n`
          else if (type === 'rz') code += `    qml.CRZ(${angle}, wires=[${control}, ${target}])\n`
          else if (type === 'phase') code += `    qml.ControlledPhaseShift(${angle}, wires=[${control}, ${target}])\n`
        }
        else code += `    # Warning: Missing PennyLane translation for controlled ${type}\n`
      }
    } else {
      if (type === 'swap' && typeof target2 === 'number') code += `    qml.SWAP(wires=[${target}, ${target2}])\n`
      else if (angle !== undefined) {
        if (type === 'rx') code += `    qml.RX(${angle}, wires=${target})\n`
        else if (type === 'ry') code += `    qml.RY(${angle}, wires=${target})\n`
        else if (type === 'rz') code += `    qml.RZ(${angle}, wires=${target})\n`
        else if (type === 'phase') code += `    qml.PhaseShift(${angle}, wires=${target})\n`
      } else {
        if (type === 'x') code += `    qml.PauliX(wires=${target})\n`
        else if (type === 'y') code += `    qml.PauliY(wires=${target})\n`
        else if (type === 'z') code += `    qml.PauliZ(wires=${target})\n`
        else if (type === 'h') code += `    qml.Hadamard(wires=${target})\n`
        else if (type === 's') code += `    qml.S(wires=${target})\n`
        else if (type === 't') code += `    qml.T(wires=${target})\n`
        else code += `    # Warning: Missing PennyLane translation for ${type}\n`
      }
    }
  })

  code += `\n    # Measurements
    return qml.counts()

# Run the circuit
result = quantum_circuit()
print("Execution Results:")
print(result)
`
  return code
}

const PennyLaneEditor: React.FC<Props> = ({ circuit }) => {
  const { t } = useTranslation()
  const code = useMemo(() => generatePennyLaneCode(circuit), [circuit])

  const handleCopy = async () => {
    const ok = await copyToClipboard(code)
    if (ok) toast.success(t('studio.penny_copy_success', 'PennyLane Python script copied!'))
    else toast.error(t('studio.penny_copy_error', 'Failed to copy script.'))
  }

  return (
    <Card
      title={t('studio.penny_snippet_title', 'Xanadu PennyLane Template')}
      description={t('studio.penny_snippet_desc', 'Use this Python script to build Quantum Machine Learning (QML) layers using Xanadu PennyLane framework.')}
      className="flex flex-col relative"
    >
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 bg-theme-surface/80 hover:bg-theme-surface border border-theme-border rounded text-xs text-theme-text-muted hover:text-theme-text transition-colors shadow flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faCopy} />
          {t('studio.copy_code', 'Copy Code')}
        </button>
      </div>
      <div className="h-[400px] border border-theme-border rounded overflow-hidden relative mt-2">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            readOnly: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 10, bottom: 10 },
            wordWrap: 'on'
          }}
        />
      </div>
    </Card>
  )
}

export default PennyLaneEditor
