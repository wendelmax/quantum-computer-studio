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

// Helper to convert internal circuit format to IBM Qiskit code
export function generateQiskitCode(circuit: Circuit): string {
  const numQubits = circuit.numQubits || 1
  let code = `from qiskit import QuantumCircuit
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
from qiskit_ibm_runtime import SamplerV2 as Sampler
from qiskit_aer import AerSimulator

# Initialize Quantum Circuit with ${numQubits} qubits
qc = QuantumCircuit(${numQubits}, ${numQubits})

# Apply Gates
`

  // Add initialization if any
  if (circuit.initialStates && Object.keys(circuit.initialStates).length > 0) {
    code += `# Initialization\n`
    for (const [qStr, state] of Object.entries(circuit.initialStates)) {
      if (Number(state) === 1) {
        code += `qc.x(${qStr})\n`
      }
    }
  }

  // Iterate over gates
  circuit.gates.forEach(g => {
    const type = g.type.toLowerCase()
    const target = g.target
    const control = g.control
    const control2 = g.control2
    const target2 = g.target2
    const angle = g.angle

    if (typeof control === 'number') {
      if (typeof control2 === 'number') {
        // Toffoli or CCZ, etc.
        if (type === 'x') code += `qc.ccx(${control}, ${control2}, ${target})\n`
        else if (type === 'z') code += `qc.ccz(${control}, ${control2}, ${target})\n`
        else code += `# Warning: Missing Qiskit translation for 3-qubit gate ${type}\n`
      } else {
        // CNOT, CZ, CRY, etc.
        if (type === 'x') code += `qc.cx(${control}, ${target})\n`
        else if (type === 'z') code += `qc.cz(${control}, ${target})\n`
        else if (type === 'y') code += `qc.cy(${control}, ${target})\n`
        else if (type === 'h') code += `qc.ch(${control}, ${target})\n`
        else if (type === 'swap' && typeof target2 === 'number') code += `qc.cswap(${control}, ${target}, ${target2})\n`
        else if (angle !== undefined) {
          if (type === 'rx') code += `qc.crx(${angle}, ${control}, ${target})\n`
          else if (type === 'ry') code += `qc.cry(${angle}, ${control}, ${target})\n`
          else if (type === 'rz') code += `qc.crz(${angle}, ${control}, ${target})\n`
          else if (type === 'phase') code += `qc.cp(${angle}, ${control}, ${target})\n`
        }
        else {
          code += `# Warning: Missing Qiskit translation for controlled ${type}\n`
        }
      }
    } else {
      // Single qubit gate or swap
      if (type === 'swap' && typeof target2 === 'number') {
        code += `qc.swap(${target}, ${target2})\n`
      } else if (angle !== undefined) {
        if (type === 'rx') code += `qc.rx(${angle}, ${target})\n`
        else if (type === 'ry') code += `qc.ry(${angle}, ${target})\n`
        else if (type === 'rz') code += `qc.rz(${angle}, ${target})\n`
        else if (type === 'phase') code += `qc.p(${angle}, ${target})\n`
      } else {
        // X, Y, Z, H, S, T
        if (['x', 'y', 'z', 'h', 's', 't'].includes(type)) {
          code += `qc.${type}(${target})\n`
        } else if (type === 'sdg') {
          code += `qc.sdg(${target})\n`
        } else if (type === 'tdg') {
          code += `qc.tdg(${target})\n`
        } else {
          code += `# Warning: Missing Qiskit translation for ${type}\n`
        }
      }
    }
  })

  // Add measurement
  code += `\n# Measure all qubits
qc.measure(range(${numQubits}), range(${numQubits}))

# Choose a backend (Local Simulator or IBM Quantum Hardware)
backend = AerSimulator()
# To run on real hardware, uncomment below:
# from qiskit_ibm_runtime import QiskitRuntimeService
# service = QiskitRuntimeService()
# backend = service.backend("ibm_osaka")

# 1. Transpile to Instruction Set Architecture (ISA) circuit
pm = generate_preset_pass_manager(backend=backend, optimization_level=1)
isa_circuit = pm.run(qc)

# 2. Execute using SamplerV2
sampler = Sampler(backend=backend)
job = sampler.run([isa_circuit], shots=1024)
result = job.result()

# 3. Retrieve and print results
pub_result = result[0]
counts = pub_result.data.c.get_counts()
print("Execution Results:")
print(counts)
`

  return code
}

const QiskitEditor: React.FC<Props> = ({ circuit }) => {
  const { t } = useTranslation()

  const code = useMemo(() => {
    return generateQiskitCode(circuit)
  }, [circuit])

  const handleCopy = async () => {
    const ok = await copyToClipboard(code)
    if (ok) {
      toast.success(t('studio.qiskit_copy_success', 'IBM Qiskit script copied!'))
    } else {
      toast.error(t('studio.qiskit_copy_error', 'Failed to copy script.'))
    }
  }

  return (
    <Card
      title={t('studio.qiskit_snippet_title', 'IBM Qiskit Template')}
      description={t('studio.qiskit_snippet_desc', 'Use this Python script to run your exact circuit on IBM Quantum hardware or local Aer simulators.')}
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

export default QiskitEditor
