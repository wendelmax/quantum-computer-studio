import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Editor, { Monaco } from '@monaco-editor/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faBook } from '@fortawesome/free-solid-svg-icons'
import { runSimulation } from '../circuits/services/simulator'
import type { Circuit, Gate, ExecutionResult } from '../circuits/hooks/useCircuitEngine'
import Card from '../../components/Card'

const QUANTUM_SNIPPETS = [
  {
    label: 'createCircuit',
    kind: 'snippet' as const,
    insertText: 'const circuit = {\n  numQubits: $1,\n  gates: [$2]\n}\nconst result = await runSimulation(circuit)\nconsole.log(\'Probabilities:\', result.probabilities)\nresult',
    insertTextRules: 4 as any,
    documentation: 'Create a quantum circuit'
  },
  {
    label: 'bellState',
    kind: 'snippet' as const,
    insertText: 'const circuit = {\n  numQubits: 2,\n  gates: [\n    { type: \'H\', target: 0 },\n    { type: \'CNOT\', target: 1, control: 0 }\n  ]\n}\nconst result = await runSimulation(circuit)\nresult',
    insertTextRules: 4 as any,
    documentation: 'Create Bell state |00⟩ + |11⟩'
  },
  {
    label: 'superposition',
    kind: 'snippet' as const,
    insertText: 'const circuit = {\n  numQubits: 1,\n  gates: [{ type: \'H\', target: 0 }]\n}\nconst result = await runSimulation(circuit)\nresult',
    insertTextRules: 4 as any,
    documentation: 'Create 50/50 superposition'
  }
]

type Command = {
  input: string
  output: any
  type: 'success' | 'error' | 'info'
}

const EXAMPLES = [
  {
    name: 'Bell State',
    description: 'Creates entangled Bell state |00⟩ + |11⟩',
    code: `const circuit = { 
  numQubits: 2, 
  gates: [
    { type: 'H', target: 0 }, 
    { type: 'CNOT', target: 1, control: 0 }
  ] 
}
const result = await runSimulation(circuit)
console.log('Probabilities:', result.probabilities)
result`
  },
  {
    name: 'Superposition',
    description: 'Creates 50/50 superposition',
    code: `const circuit = { 
  numQubits: 1, 
  gates: [{ type: 'H', target: 0 }] 
}
const result = await runSimulation(circuit)
console.log('Probabilities:', result.probabilities)
result`
  },
  {
    name: 'Rotation Gate',
    description: 'Rotates qubit around X-axis',
    code: `const circuit = { 
  numQubits: 1, 
  gates: [{ type: 'RX', target: 0, angle: Math.PI/2 }] 
}
const result = await runSimulation(circuit)
console.log('Probabilities:', result.probabilities)
result`
  },
  {
    name: 'Grover Search',
    description: 'Grover algorithm with 3 qubits',
    code: `const circuit = {
  numQubits: 3,
  gates: [
    { type: 'H', target: 0 }, 
    { type: 'H', target: 1 },
    { type: 'X', target: 2 }, 
    { type: 'H', target: 2 },
    { type: 'CNOT', target: 2, control: 1 },
    { type: 'CNOT', target: 2, control: 0 },
    { type: 'H', target: 2 }
  ]
}
const result = await runSimulation(circuit)
console.log('Probabilities:', result.probabilities)
result`
  },
  {
    name: 'Multiple Gates',
    description: 'Chain of Pauli gates',
    code: `const circuit = {
  numQubits: 2,
  gates: [
    { type: 'X', target: 0 },
    { type: 'Y', target: 1 },
    { type: 'Z', target: 0 }
  ]
}
const result = await runSimulation(circuit)
console.log('Probabilities:', result.probabilities)
console.log('State vector:', result.stateVector)
result`
  }
]

export default function APIPage() {
  const [history, setHistory] = useState<Command[]>([
    { input: '', output: 'Quantum Computer JS API\nType your code or select an example to begin', type: 'info' }
  ])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [editorHeight, setEditorHeight] = useState(300)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) {
      return
    }

    setIsProcessing(true)
    const consoleLogs: string[] = []
    
    const customConsole = {
      log: (...args: any[]) => {
        consoleLogs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '))
      }
    }

    setHistory(prev => [...prev, { input: cmd, output: null, type: 'success' }])
    
    try {
      const runSimulation = (await import('../circuits/services/simulator')).runSimulation
      
      const func = new Function('runSimulation', 'Math', 'console', `
        return (async () => {
          try {
            ${cmd}
          } catch (e) {
            throw e
          }
        })()
      `)
      
      const result = await func(runSimulation, Math, customConsole)

      let outputParts: string[] = []
      if (consoleLogs.length > 0) {
        outputParts.push(...consoleLogs)
      }
      
      let formattedOutput: any = result
      if (typeof result === 'object' && result !== null) {
        formattedOutput = JSON.stringify(result, null, 2)
      } else if (result !== undefined) {
        formattedOutput = String(result)
      } else {
        formattedOutput = 'undefined'
      }
      
      if (outputParts.length > 0 && formattedOutput !== 'undefined') {
        outputParts.push('')
        outputParts.push('Result:')
        outputParts.push(formattedOutput)
        formattedOutput = outputParts.join('\n')
      } else if (outputParts.length > 0) {
        formattedOutput = outputParts.join('\n')
      }

      setHistory(prev => {
        const newHistory = [...prev]
        newHistory[newHistory.length - 1] = { input: cmd, output: formattedOutput, type: 'success' }
        return newHistory
      })
    } catch (error: any) {
      setHistory(prev => {
        const newHistory = [...prev]
        newHistory[newHistory.length - 1] = { input: cmd, output: error.message, type: 'error' }
        return newHistory
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isProcessing) {
      executeCommand(input)
    }
  }

  const loadExample = (example: string) => {
    setInput(example)
  }

  const clearHistory = () => {
    setHistory([{ input: '', output: 'Terminal cleared', type: 'info' }])
    setInput('')
  }

  const loadCircuitToStudio = () => {
    try {
      let startPos = input.indexOf('const circuit =')
      if (startPos === -1) {
        alert('No circuit found in code. Make sure you have a "const circuit = {...}" declaration.')
        return
      }
      
      startPos = input.indexOf('{', startPos)
      if (startPos === -1) {
        alert('Invalid circuit syntax')
        return
      }
      
      let depth = 0
      let endPos = startPos
      for (let i = startPos; i < input.length; i++) {
        if (input[i] === '{') depth++
        if (input[i] === '}') {
          depth--
          if (depth === 0) {
            endPos = i + 1
            break
          }
        }
      }
      
      if (depth !== 0) {
        alert('Unbalanced braces in circuit')
        return
      }
      
      const circuitStr = input.substring(startPos, endPos)
      const func = new Function(`return ${circuitStr}`)
      const circuit = func()
      localStorage.setItem('quantum:loadCircuit', JSON.stringify(circuit))
      localStorage.setItem('quantum:circuit', JSON.stringify(circuit))
      localStorage.setItem('quantum:prefs:numQubits', String(circuit.numQubits || 2))
      window.dispatchEvent(new CustomEvent('quantum:set-circuit', { detail: { circuit, autoRun: false } }))
      window.location.href = '/circuits'
    } catch (err) {
      alert('Failed to parse circuit: ' + (err as Error).message)
    }
  }

  const hasCircuit = input.includes('const circuit =')

  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: () => {
        return {
          suggestions: QUANTUM_SNIPPETS.map(snippet => ({
            label: snippet.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: snippet.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: snippet.documentation
          }))
        }
      }
    })
  }

  return (
    <div className="p-6 grid grid-cols-12 gap-4">
      <div className="col-span-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Quantum API</h2>
            <p className="text-xs text-slate-400 mt-1">Interactive REPL for quantum circuit programming</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditorHeight(Math.max(200, Math.min(600, editorHeight + 50)))}
              className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded hover:border-sky-600 transition-colors"
              title="Increase editor height"
            >
              +
            </button>
            <button
              onClick={() => setEditorHeight(Math.max(200, Math.min(600, editorHeight - 50)))}
              className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded hover:border-sky-600 transition-colors"
              title="Decrease editor height"
            >
              -
            </button>
            <button
              onClick={clearHistory}
              className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded hover:border-sky-600 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <Card className="flex flex-col overflow-hidden">
          <div className="border border-slate-800 rounded-lg overflow-hidden" style={{ height: editorHeight }}>
            <Editor
              height={`${editorHeight}px`}
              defaultLanguage="javascript"
              value={input}
              onChange={(value) => setInput(value || '')}
              theme="vs-dark"
              beforeMount={handleEditorWillMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                suggest: {
                  snippetsPreventQuickSuggestions: false,
                  showKeywords: true,
                  showSnippets: true
                },
                contextmenu: true,
                quickSuggestions: true,
                parameterHints: { enabled: true },
                autoClosingBrackets: 'always',
                formatOnPaste: true,
                formatOnType: true
              }}
            />
          </div>

          <form onSubmit={handleSubmit} className="mt-3">
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded transition-all disabled:opacity-50 font-medium shadow-lg hover:shadow-cyan-500/50 disabled:shadow-none"
                disabled={isProcessing || !input.trim()}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Running...
                  </span>
                ) : (
                  'Execute'
                )}
              </button>
              {hasCircuit && (
                <button
                  type="button"
                  onClick={loadCircuitToStudio}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded transition-all font-medium shadow-lg hover:shadow-purple-500/50"
                >
                  Open in Studio
                </button>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-2 flex items-center gap-2">
              <span>💡</span>
              <span>{hasCircuit ? 'Execute code or open circuit in Studio' : 'Press Ctrl+Enter or click Execute'}</span>
            </div>
          </form>
        </Card>

        <Card className="flex flex-col" style={{ minHeight: '200px' }}>
          <div className="mb-2 px-3 pt-3">
            <h3 className="text-sm font-medium">Output</h3>
          </div>
          <div 
            className="flex-1 bg-black rounded-lg p-4 font-mono text-sm overflow-y-auto"
            style={{ minHeight: '200px' }}
          >
            {history.map((cmd, idx) => (
              <div key={idx} className="mb-3 animate-fade-in">
                {cmd.input && (
                  <div className="text-cyan-400 mb-1 font-medium">
                    <span className="text-slate-600">&gt;</span> {cmd.input}
                  </div>
                )}
                {cmd.output && (
                  <div className={`${
                    cmd.type === 'error' 
                      ? 'text-red-400 bg-red-950/20 border border-red-800/30' 
                      : cmd.type === 'info' 
                      ? 'text-slate-400' 
                      : 'text-green-400 bg-green-950/10 border border-green-800/30'
                  } whitespace-pre-wrap p-2 rounded mt-1`}>
                    {cmd.output}
                  </div>
                )}
              </div>
            ))}

            {isProcessing && (
              <div className="text-yellow-400 flex items-center gap-2 animate-pulse">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                <span>Running simulation...</span>
              </div>
            )}
          </div>
        </Card>

        <Card title="Quick Reference">
          <div className="text-xs space-y-2 font-mono text-slate-300">
            <div>
              <span className="text-green-400">runSimulation(circuit)</span> - Run simulation
            </div>
            <div>
              <span className="text-blue-400">circuit =</span> {'{'}{' '}
              numQubits, gates: Gate[] {'}'}
            </div>
            <div>
              <span className="text-yellow-400">Gate =</span> {'{'}{' '}
              type, target, control?, angle? {'}'}
            </div>
            <div>
              <span className="text-purple-400">console.log(...)</span> - Debug output
            </div>
          </div>
        </Card>
      </div>

      <div className="col-span-4 flex flex-col gap-4">
        <Card title="Library" description="Use in other systems">
          <div className="space-y-2 mt-2">
            <a
              href="/quantum-computer-js-lib.zip"
              download="quantum-computer-js-lib.zip"
              className="flex items-center gap-2 p-3 rounded bg-slate-900/30 border border-slate-800 hover:border-sky-600 hover:bg-sky-900/10 transition-all text-sm text-slate-200"
            >
              <FontAwesomeIcon icon={faDownload} className="text-sky-400" />
              Download library (zip)
            </a>
            <Link
              to="/lib-docs"
              className="flex items-center gap-2 p-3 rounded bg-slate-900/30 border border-slate-800 hover:border-sky-600 hover:bg-sky-900/10 transition-all text-sm text-slate-200"
            >
              <FontAwesomeIcon icon={faBook} className="text-sky-400" />
              Library API reference
            </Link>
          </div>
        </Card>

        <Card title="Code Examples">
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
            {EXAMPLES.map((example, idx) => (
              <button
                key={idx}
                onClick={() => loadExample(example.code)}
                className="w-full text-left p-3 bg-slate-900/30 border border-slate-800 rounded hover:border-cyan-600 hover:bg-cyan-900/10 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">{example.name}</div>
                  <span className="text-slate-600 group-hover:text-cyan-600 transition-colors">›</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 group-hover:text-slate-300 transition-colors">{example.description}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card title="Available Gates">
          <div className="text-xs space-y-1 text-slate-300">
            <div><span className="text-sky-400 font-bold">H</span> - Hadamard (superposition)</div>
            <div><span className="text-sky-400 font-bold">X</span> - Pauli-X (NOT/Bit flip)</div>
            <div><span className="text-sky-400 font-bold">Y</span> - Pauli-Y (bit+phase flip)</div>
            <div><span className="text-sky-400 font-bold">Z</span> - Pauli-Z (Phase flip)</div>
            <div><span className="text-sky-400 font-bold">CNOT</span> - Controlled NOT</div>
            <div><span className="text-sky-400 font-bold">RX(θ)</span> - Rotation X-axis</div>
            <div><span className="text-sky-400 font-bold">RY(θ)</span> - Rotation Y-axis</div>
            <div><span className="text-sky-400 font-bold">RZ(θ)</span> - Rotation Z-axis</div>
          </div>
        </Card>

        <Card title="Return Value">
          <div className="text-xs text-slate-300 space-y-2">
            <div>
              Returns object with:
            </div>
            <div className="ml-2 space-y-1">
              <div>• <code className="text-green-400">probabilities</code> - {'{'}{'string: number'}{'}'}</div>
              <div>• <code className="text-blue-400">stateVector</code> - number[]</div>
            </div>
          </div>
        </Card>

        <Card title="Tips">
          <div className="text-xs text-slate-300 space-y-2">
            <div>• Use <code className="px-1 py-0.5 bg-slate-900 rounded">Math.PI</code> for angles</div>
            <div>• Use <code className="px-1 py-0.5 bg-slate-900 rounded">await</code> for async</div>
            <div>• Use <code className="px-1 py-0.5 bg-slate-900 rounded">console.log</code> for debug</div>
            <div>• Access last result with return</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
