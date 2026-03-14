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

export function generateQSharpCode(circuit: Circuit): string {
  const numQubits = circuit.numQubits || 1
  let code = `import qsharp

# Define the Q# operation as a string
qsharp_code = """
namespace QuantumComputerStudio {
    open Microsoft.Quantum.Intrinsic;
    open Microsoft.Quantum.Canon;
    open Microsoft.Quantum.Measurement;
    open Microsoft.Quantum.Math;

    operation RunCircuit() : Result[] {
        // Allocate ${numQubits} qubits
        use qubits = Qubit[${numQubits}];

`
  
  if (circuit.initialStates && Object.keys(circuit.initialStates).length > 0) {
    code += `        // Initialization\n`
    for (const [qStr, state] of Object.entries(circuit.initialStates)) {
      if (Number(state) === 1) code += `        X(qubits[${qStr}]);\n`
    }
  }

  code += `\n        // Apply Gates\n`

  circuit.gates.forEach(g => {
    const type = g.type.toLowerCase()
    const target = g.target
    const control = g.control
    const control2 = g.control2
    const target2 = g.target2
    const angle = g.angle

    if (typeof control === 'number') {
      if (typeof control2 === 'number') {
        if (type === 'x') code += `        CCNOT(qubits[${control}], qubits[${control2}], qubits[${target}]);\n`
        else code += `        // Warning: Missing Q# translation for 3-qubit gate ${type}\n`
      } else {
        if (type === 'x') code += `        CNOT(qubits[${control}], qubits[${target}]);\n`
        else if (type === 'z') code += `        CZ(qubits[${control}], qubits[${target}]);\n`
        else if (type === 'y') code += `        CY(qubits[${control}], qubits[${target}]);\n`
        else if (type === 'h') code += `        Controlled H([qubits[${control}]], qubits[${target}]);\n`
        else if (type === 'swap' && typeof target2 === 'number') code += `        CSWAP(qubits[${control}], qubits[${target}], qubits[${target2}]);\n`
        else if (angle !== undefined) {
          if (type === 'rx') code += `        Controlled Rx([qubits[${control}]], (${angle}, qubits[${target}]));\n`
          else if (type === 'ry') code += `        Controlled Ry([qubits[${control}]], (${angle}, qubits[${target}]));\n`
          else if (type === 'rz') code += `        Controlled Rz([qubits[${control}]], (${angle}, qubits[${target}]));\n`
          else if (type === 'phase') code += `        Controlled R1([qubits[${control}]], (${angle}, qubits[${target}]));\n`
        }
        else code += `        // Warning: Missing Q# translation for controlled ${type}\n`
      }
    } else {
      if (type === 'swap' && typeof target2 === 'number') code += `        SWAP(qubits[${target}], qubits[${target2}]);\n`
      else if (angle !== undefined) {
        if (type === 'rx') code += `        Rx(${angle}, qubits[${target}]);\n`
        else if (type === 'ry') code += `        Ry(${angle}, qubits[${target}]);\n`
        else if (type === 'rz') code += `        Rz(${angle}, qubits[${target}]);\n`
        else if (type === 'phase') code += `        R1(${angle}, qubits[${target}]);\n`
      } else {
        if (['x', 'y', 'z', 'h', 's', 't'].includes(type)) code += `        ${type.toUpperCase()}(qubits[${target}]);\n`
        else if (type === 'sdg') code += `        Adjoint S(qubits[${target}]);\n`
        else if (type === 'tdg') code += `        Adjoint T(qubits[${target}]);\n`
        else code += `        // Warning: Missing Q# translation for ${type}\n`
      }
    }
  })

  code += `
        // Measure and Reset
        mutable results = [];
        for q in qubits {
            set results += [MResetZ(q)];
        }
        
        return results;
    }
}
"""

# Initialize Q# environment and evaluate the code block
qsharp.init(target_profile=qsharp.TargetProfile.Base)
qsharp.eval(qsharp_code)

# Execute the operation (Local simulator by default)
print("Executing circuit on local simulator...")
result = qsharp.run("QuantumComputerStudio.RunCircuit()", shots=1024)

print("\\nExecution Results (Sample View):")
for x in result[:10]:
    print(x)

# Azure Quantum Submission (Uncomment to execute on Real Hardware):
# import azure.quantum
# workspace = azure.quantum.Workspace(
#     resource_id="<YOUR_WORKSPACE_ID>",
#     location="<YOUR_LOCATION>"
# )
# target = workspace.get_targets("ionq.simulator")
# compiled_qsharp = qsharp.compile("QuantumComputerStudio.RunCircuit()")
# job = target.submit(compiled_qsharp, "QCS Job", shots=1024)
# print(f"Job ID: {job.id}")
`
  return code
}

const QSharpEditor: React.FC<Props> = ({ circuit }) => {
  const { t } = useTranslation()
  const code = useMemo(() => generateQSharpCode(circuit), [circuit])

  const handleCopy = async () => {
    const ok = await copyToClipboard(code)
    if (ok) toast.success(t('studio.qsharp_copy_success', 'Q# script copied!'))
    else toast.error(t('studio.qsharp_copy_error', 'Failed to copy script.'))
  }

  return (
    <Card
      title={t('studio.qsharp_snippet_title', 'Microsoft Q# Template')}
      description={t('studio.qsharp_snippet_desc', 'Use this Q# script to run your exact circuit via the Microsoft Quantum Development Kit (QDK) or Azure Quantum.')}
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
          defaultLanguage="qsharp"
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

export default QSharpEditor
