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

// Helper to convert internal circuit format to Braket Python code
export function generateBraketCode(circuit: Circuit): string {
  const numQubits = circuit.numQubits || 1
  let code = `from braket.circuits import Circuit
from braket.devices import LocalSimulator
# To run on real hardware like IonQ or Rigetti, import AwsDevice
# from braket.aws import AwsDevice

circ = Circuit()

# Apply Gates
`
  
  if (circuit.initialStates && Object.keys(circuit.initialStates).length > 0) {
    for (const [qStr, state] of Object.entries(circuit.initialStates)) {
      if (Number(state) === 1) code += `circ.x(${qStr})\n`
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
        if (type === 'x') code += `circ.ccnot(${control}, ${control2}, ${target})\n`
        else code += `# Warning: Missing Braket translation for 3-qubit gate ${type}\n`
      } else {
        if (type === 'x') code += `circ.cnot(${control}, ${target})\n`
        else if (type === 'z') code += `circ.cz(${control}, ${target})\n`
        else if (type === 'y') code += `circ.cy(${control}, ${target})\n`
        else if (type === 'h') code += `circ.h(${target}).cphaseshift(${control}, ${target}, 3.14159) # Approximated CH\n`
        else if (type === 'swap' && typeof target2 === 'number') code += `circ.cswap(${control}, ${target}, ${target2})\n`
        else if (angle !== undefined) {
          if (type === 'rx') code += `circ.rx(${target}, ${angle}).cphaseshift(${control}, ${target}, ${angle}) # Approximated CRX\n`
          else if (type === 'phase') code += `circ.cphaseshift(${control}, ${target}, ${angle})\n`
          else code += `# Warning: Missing Braket translation for controlled ${type}\n`
        }
        else code += `# Warning: Missing Braket translation for controlled ${type}\n`
      }
    } else {
      if (type === 'swap' && typeof target2 === 'number') code += `circ.swap(${target}, ${target2})\n`
      else if (angle !== undefined) {
        if (type === 'rx') code += `circ.rx(${target}, ${angle})\n`
        else if (type === 'ry') code += `circ.ry(${target}, ${angle})\n`
        else if (type === 'rz') code += `circ.rz(${target}, ${angle})\n`
        else if (type === 'phase') code += `circ.phaseshift(${target}, ${angle})\n`
      } else {
        if (['x', 'y', 'z', 'h', 's', 't'].includes(type)) code += `circ.${type}(${target})\n`
        else if (type === 'sdg') code += `circ.si(${target})\n`
        else if (type === 'tdg') code += `circ.ti(${target})\n`
        else code += `# Warning: Missing Braket translation for ${type}\n`
      }
    }
  })

  code += `\n# Run Simulation
device = LocalSimulator()
# For real hardware:
# device = AwsDevice("arn:aws:braket:::device/qpu/ionq/ionQdevice")

task = device.run(circ, shots=1024)
result = task.result()

print("Execution Results:")
print(result.measurement_counts)
`
  return code
}

const BraketEditor: React.FC<Props> = ({ circuit }) => {
  const { t } = useTranslation()
  const code = useMemo(() => generateBraketCode(circuit), [circuit])

  const handleCopy = async () => {
    const ok = await copyToClipboard(code)
    if (ok) toast.success(t('studio.braket_copy_success', 'AWS Braket Python script copied!'))
    else toast.error(t('studio.braket_copy_error', 'Failed to copy script.'))
  }

  return (
    <Card
      title={t('studio.braket_snippet_title', 'Amazon Braket Template')}
      description={t('studio.braket_snippet_desc', 'Use this Python script to deploy your circuit via AWS Braket SDK (Local Simulator or QPUs like IonQ/Rigetti).')}
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

export default BraketEditor
