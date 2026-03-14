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

const JSEditor: React.FC<Props> = ({ circuit }) => {
  const { t } = useTranslation()

  const code = useMemo(() => {
    const circuitObj = JSON.stringify(circuit, null, 2)
    return `import { runSimulation } from 'quantum-computer-js'

// Define your quantum circuit
const circuit = ${circuitObj}

// Run the simulation
async function main() {
  const result = await runSimulation(circuit)
  
  console.log('Execution completed!')
  console.log('Probabilities:', result.probabilities)
  
  // result.stateVector contains the raw amplitudes
}

main().catch(console.error)
`
  }, [circuit])

  const handleCopy = async () => {
    const ok = await copyToClipboard(code)
    if (ok) {
      toast.success(t('studio.js_copy_success', 'JS snippet copied to clipboard!'))
    } else {
      toast.error(t('studio.js_copy_error', 'Failed to copy JS snippet.'))
    }
  }

  return (
    <Card
      title={t('studio.js_snippet_title', 'quantum-computer-js Snippet')}
      description={t('studio.js_snippet_desc', 'Use this code in your Node.js or browser project to run this exact circuit.')}
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
          defaultLanguage="javascript"
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

export default JSEditor
