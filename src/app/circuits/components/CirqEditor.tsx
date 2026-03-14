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

// Helper to convert internal circuit format to Cirq Python code
export function generateCirqCode(circuit: Circuit): string {
  const numQubits = circuit.numQubits || 1
  let code = `import cirq

# Initialize ${numQubits} qubits on a line
qubits = [cirq.LineQubit(i) for i in range(${numQubits})]
circuit = cirq.Circuit()

# Apply Gates
`
  
  if (circuit.initialStates && Object.keys(circuit.initialStates).length > 0) {
    for (const [qStr, state] of Object.entries(circuit.initialStates)) {
      if (Number(state) === 1) code += `circuit.append(cirq.X(qubits[${qStr}]))\n`
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
        if (type === 'x') code += `circuit.append(cirq.CCNOT(qubits[${control}], qubits[${control2}], qubits[${target}]))\n`
        else if (type === 'z') code += `circuit.append(cirq.CCZ(qubits[${control}], qubits[${control2}], qubits[${target}]))\n`
        else code += `# Warning: Missing Cirq translation for 3-qubit gate ${type}\n`
      } else {
        if (type === 'x') code += `circuit.append(cirq.CNOT(qubits[${control}], qubits[${target}]))\n`
        else if (type === 'z') code += `circuit.append(cirq.CZ(qubits[${control}], qubits[${target}]))\n`
        else if (type === 'h') code += `circuit.append(cirq.H.controlled()(qubits[${control}], qubits[${target}]))\n`
        else if (type === 'y') code += `circuit.append(cirq.Y.controlled()(qubits[${control}], qubits[${target}]))\n`
        else if (type === 'swap' && typeof target2 === 'number') code += `circuit.append(cirq.CSWAP(qubits[${control}], qubits[${target}], qubits[${target2}]))\n`
        else if (angle !== undefined) {
          if (type === 'rx') code += `circuit.append(cirq.rx(${angle}).controlled()(qubits[${control}], qubits[${target}]))\n`
          else if (type === 'ry') code += `circuit.append(cirq.ry(${angle}).controlled()(qubits[${control}], qubits[${target}]))\n`
          else if (type === 'rz') code += `circuit.append(cirq.rz(${angle}).controlled()(qubits[${control}], qubits[${target}]))\n`
          else if (type === 'phase') code += `circuit.append(cirq.cphase(${angle})(qubits[${control}], qubits[${target}]))\n`
        }
        else code += `# Warning: Missing Cirq translation for controlled ${type}\n`
      }
    } else {
      if (type === 'swap' && typeof target2 === 'number') code += `circuit.append(cirq.SWAP(qubits[${target}], qubits[${target2}]))\n`
      else if (angle !== undefined) {
        if (type === 'rx') code += `circuit.append(cirq.rx(${angle})(qubits[${target}]))\n`
        else if (type === 'ry') code += `circuit.append(cirq.ry(${angle})(qubits[${target}]))\n`
        else if (type === 'rz') code += `circuit.append(cirq.rz(${angle})(qubits[${target}]))\n`
        else if (type === 'phase') code += `circuit.append(cirq.ZPowGate(exponent=${angle}/3.14159)(qubits[${target}]))\n`
      } else {
        if (['x', 'y', 'z', 'h', 's', 't'].includes(type)) code += `circuit.append(cirq.${type.toUpperCase()}(qubits[${target}]))\n`
        else if (type === 'sdg') code += `circuit.append(cirq.S(qubits[${target}])**-1)\n`
        else if (type === 'tdg') code += `circuit.append(cirq.T(qubits[${target}])**-1)\n`
        else code += `# Warning: Missing Cirq translation for ${type}\n`
      }
    }
  })

  code += `\n# Measure all qubits
circuit.append(cirq.measure(*qubits, key='result'))

# Print circuit structure
print("Circuit Topology:")
print(circuit)

# Run Simulation
simulator = cirq.Simulator()
result = simulator.run(circuit, repetitions=1024)

print("\\nExecution Results:")
print(result.histogram(key='result'))
`
  return code
}

const CirqEditor: React.FC<Props> = ({ circuit }) => {
  const { t } = useTranslation()
  const code = useMemo(() => generateCirqCode(circuit), [circuit])

  const handleCopy = async () => {
    const ok = await copyToClipboard(code)
    if (ok) toast.success(t('studio.cirq_copy_success', 'Cirq Python script copied!'))
    else toast.error(t('studio.cirq_copy_error', 'Failed to copy script.'))
  }

  return (
    <Card
      title={t('studio.cirq_snippet_title', 'Google Cirq Template')}
      description={t('studio.cirq_snippet_desc', 'Use this Python script to run your exact circuit using Google Quantum AI Cirq framework.')}
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

export default CirqEditor
