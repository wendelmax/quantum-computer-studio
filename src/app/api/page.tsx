import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Editor, { Monaco } from '@monaco-editor/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faBook } from '@fortawesome/free-solid-svg-icons'
import { runSimulation, type Circuit, type CircuitGate as Gate, type Result as ExecutionResult } from 'quantum-computer-js'
import Card from '../../components/Card'
import { useQuantumStore } from '../../store/quantumStore'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

const QUANTUM_SNIPPETS = [
  {
    label: 'createCircuit',
    kind: 'snippet' as const,
    insertText: 'const circuit = {\n  numQubits: $1,\n  gates: [$2]\n}\nconst result = await runSimulation(circuit)\nconsole.log(\'Probabilities:\', result.probabilities)\nresult',
    documentation: 'Create a quantum circuit'
  },
  {
    label: 'bellState',
    kind: 'snippet' as const,
    insertText: 'const circuit = {\n  numQubits: 2,\n  gates: [\n    { type: \'H\', target: 0 },\n    { type: \'CNOT\', target: 1, control: 0 }\n  ]\n}\nconst result = await runSimulation(circuit)\nresult',
    documentation: 'Create Bell state |00⟩ + |11⟩'
  },
  {
    label: 'superposition',
    kind: 'snippet' as const,
    insertText: 'const circuit = {\n  numQubits: 1,\n  gates: [{ type: \'H\', target: 0 }]\n}\nconst result = await runSimulation(circuit)\nresult',
    documentation: 'Create 50/50 superposition'
  }
]

type Command = {
  input: string
  output: any
  type: 'success' | 'error' | 'info' | 'chart'
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
  const { t } = useTranslation()
  const [monacoTheme, setMonacoTheme] = useState<'vs' | 'vs-dark'>(() => {
    if (typeof document === 'undefined') return 'vs-dark'
    return (document.documentElement.getAttribute('data-theme') || 'dark') === 'light' ? 'vs' : 'vs-dark'
  })
  useEffect(() => {
    const update = () => {
      const theme = document.documentElement.getAttribute('data-theme') || 'dark'
      setMonacoTheme(theme === 'light' ? 'vs' : 'vs-dark')
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  const [history, setHistory] = useState<Command[]>([
    { input: '', output: 'Quantum Computer JS API\nType your code or select an example to begin', type: 'info' }
  ])
  const [input, setInput] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('quantum:api:input') || ''
    }
    return ''
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('quantum:api:input', input)
    }
  }, [input])

  const [isProcessing, setIsProcessing] = useState(false)
  const [editorHeight, setEditorHeight] = useState(300)
  const terminalRef = useRef<HTMLDivElement>(null)
  const setStoreCircuit = useQuantumStore(state => state.setCircuit)

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

      let isCircuitOutput = false
      let probabilitiesData: Record<string, number> | null = null

      let formattedOutput: any = result
      if (typeof result === 'object' && result !== null) {
        if ('probabilities' in result && typeof result.probabilities === 'object') {
          isCircuitOutput = true
          probabilitiesData = result.probabilities
        }
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
        newHistory[newHistory.length - 1] = {
          input: cmd,
          output: isCircuitOutput ? probabilitiesData : formattedOutput,
          type: isCircuitOutput ? 'chart' as any : 'success'
        }
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
        toast.error(t('api.no_circuit_found', 'No circuit found in code. Make sure you have a "const circuit = {...}" declaration.'))
        return
      }

      startPos = input.indexOf('{', startPos)
      if (startPos === -1) {
        toast.error(t('api.invalid_syntax', 'Invalid circuit syntax'))
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
        toast.error(t('api.unbalanced_braces', 'Unbalanced braces in circuit'))
        return
      }

      const circuitStr = input.substring(startPos, endPos)
      const func = new Function(`return ${circuitStr}`)
      const circuit = func()
      setStoreCircuit(circuit as any, false)
      window.location.href = '/circuits'
    } catch (err) {
      toast.error(t('api.parse_failed', 'Failed to parse circuit: ') + (err as Error).message)
    }
  }

  const hasCircuit = input.includes('const circuit =')

  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        return {
          suggestions: QUANTUM_SNIPPETS.map(snippet => ({
            label: snippet.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: snippet.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: snippet.documentation,
            range,
          })) as any[]
        }
      }
    })
  }

  return (
    <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-semibold text-theme-text">Quantum API</h2>
            <p className="text-xs text-theme-text-muted mt-1">Interactive REPL for quantum circuit programming</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditorHeight(Math.max(200, Math.min(600, editorHeight + 50)))}
              className="px-3 py-2 text-xs rounded border border-theme-border hover:border-primary transition-colors text-theme-text"
              title="Increase editor height"
            >
              +
            </button>
            <button
              onClick={() => setEditorHeight(Math.max(200, Math.min(600, editorHeight - 50)))}
              className="px-3 py-2 text-xs rounded border border-theme-border hover:border-primary transition-colors text-theme-text"
              title="Decrease editor height"
            >
              -
            </button>
            <button
              onClick={clearHistory}
              className="px-3 py-2 text-xs rounded border border-theme-border hover:border-primary transition-colors text-theme-text"
            >
              Clear
            </button>
          </div>
        </div>

        <Card className="flex flex-col overflow-hidden">
          <div className="border border-theme-border rounded-lg overflow-hidden" style={{ height: editorHeight }}>
            <Editor
              height={`${editorHeight}px`}
              defaultLanguage="javascript"
              value={input}
              onChange={(value) => setInput(value || '')}
              theme={monacoTheme}
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
                className="px-6 py-2 bg-primary hover:bg-primary/90 rounded transition-all disabled:opacity-50 font-medium shadow-lg hover:shadow-primary/30 disabled:shadow-none text-white"
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
                  className="px-6 py-2 bg-theme-surface border border-theme-border hover:border-primary hover:bg-primary/10 rounded transition-all font-medium text-theme-text"
                >
                  Open in Studio
                </button>
              )}
            </div>
            <div className="text-xs text-theme-text-muted mt-2 flex items-center gap-2">
              <span>💡</span>
              <span>{hasCircuit ? 'Execute code or open circuit in Studio' : 'Press Ctrl+Enter or click Execute'}</span>
            </div>
          </form>
        </Card>

        <Card className="flex flex-col min-h-[200px]">
          <div className="mb-2 px-3 pt-3">
            <h3 className="text-sm font-medium text-theme-text">Output</h3>
          </div>
          <div
            className="flex-1 bg-theme-surface rounded-lg p-4 font-mono text-sm overflow-y-auto text-theme-text"
            style={{ minHeight: '200px' }}
          >
            {history.map((cmd, idx) => (
              <div key={idx} className="mb-3 animate-fade-in">
                {cmd.input && (
                  <div className="text-primary mb-1 font-medium">
                    <span className="text-theme-text-muted">&gt;</span> {cmd.input}
                  </div>
                )}
                {cmd.output && cmd.type !== 'chart' && cmd.type !== ('chart' as any) && (
                  <div className={`${cmd.type === 'error'
                    ? 'text-red-400 bg-red-950/20 border border-red-800/30'
                    : cmd.type === 'info'
                      ? 'text-theme-text-muted'
                      : 'text-theme-text bg-primary/5 border border-primary/20'
                    } whitespace-pre-wrap p-2 rounded mt-1`}>
                    {cmd.output}
                  </div>
                )}
                {(cmd.type === 'chart' || cmd.type === ('chart' as any)) && cmd.output && typeof cmd.output === 'object' && (
                  <div className="text-theme-text bg-primary/5 border border-primary/20 p-3 rounded mt-1 space-y-2">
                    <div className="text-primary font-bold mb-2">Circuit Result Probabilities:</div>
                    {Object.entries(cmd.output as Record<string, number>).map(([state, prob]) => {
                      const percentage = (prob * 100).toFixed(1)
                      return (
                        <div key={state} className="flex items-center gap-3">
                          <span className="w-12 text-right font-mono text-xs opacity-70">|{state}⟩</span>
                          <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${Math.max(0.5, prob * 100)}%` }}
                            />
                          </div>
                          <span className="w-12 font-mono text-xs text-primary">{percentage}%</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}

            {isProcessing && (
              <div className="text-primary flex items-center gap-2 animate-pulse">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span>Running simulation...</span>
              </div>
            )}
          </div>
        </Card>

        <Card title="Quick Reference">
          <div className="text-xs space-y-2 font-mono text-theme-text">
            <div>
              <span className="text-primary">runSimulation(circuit)</span> - Run simulation
            </div>
            <div>
              <span className="text-primary">circuit =</span> {'{'}{' '}
              numQubits, gates: Gate[] {'}'}
            </div>
            <div>
              <span className="text-primary">Gate =</span> {'{'}{' '}
              type, target, control?, angle? {'}'}
            </div>
            <div>
              <span className="text-primary">console.log(...)</span> - Debug output
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-4">
        <Card title="Library" description="Use in other systems">
          <div className="space-y-2 mt-2">
            <a
              href="/quantum-computer-js-lib.zip"
              download="quantum-computer-js-lib.zip"
              className="flex items-center gap-2 p-3 rounded bg-theme-surface/50 border border-theme-border hover:border-primary hover:bg-primary/10 transition-all text-sm text-theme-text"
            >
              <FontAwesomeIcon icon={faDownload} className="text-primary" />
              Download library (zip)
            </a>
            <Link
              to="/lib-docs"
              className="flex items-center gap-2 p-3 rounded bg-theme-surface/50 border border-theme-border hover:border-primary hover:bg-primary/10 transition-all text-sm text-theme-text"
            >
              <FontAwesomeIcon icon={faBook} className="text-primary" />
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
                className="w-full text-left p-3 bg-theme-surface/50 border border-theme-border rounded hover:border-primary hover:bg-primary/10 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-theme-text group-hover:text-primary transition-colors">{example.name}</div>
                  <span className="text-theme-text-muted group-hover:text-primary transition-colors">›</span>
                </div>
                <div className="text-[10px] text-theme-text-muted mt-1 group-hover:text-theme-text transition-colors">{example.description}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card title="Available Gates">
          <div className="text-xs space-y-1 text-theme-text">
            <div><span className="text-primary font-bold">H</span> - Hadamard (superposition)</div>
            <div><span className="text-primary font-bold">X</span> - Pauli-X (NOT/Bit flip)</div>
            <div><span className="text-primary font-bold">Y</span> - Pauli-Y (bit+phase flip)</div>
            <div><span className="text-primary font-bold">Z</span> - Pauli-Z (Phase flip)</div>
            <div><span className="text-primary font-bold">CNOT</span> - Controlled NOT</div>
            <div><span className="text-primary font-bold">RX(θ)</span> - Rotation X-axis</div>
            <div><span className="text-primary font-bold">RY(θ)</span> - Rotation Y-axis</div>
            <div><span className="text-primary font-bold">RZ(θ)</span> - Rotation Z-axis</div>
          </div>
        </Card>

        <Card title="Return Value">
          <div className="text-xs text-theme-text space-y-2">
            <div>
              Returns object with:
            </div>
            <div className="ml-2 space-y-1">
              <div>• <code className="text-primary">probabilities</code> - {'{'}{'string: number'}{'}'}</div>
              <div>• <code className="text-primary">stateVector</code> - number[]</div>
            </div>
          </div>
        </Card>

        <Card title="Tips">
          <div className="text-xs text-theme-text space-y-2">
            <div>• Use <code className="px-1 py-0.5 bg-theme-surface rounded">Math.PI</code> for angles</div>
            <div>• Use <code className="px-1 py-0.5 bg-theme-surface rounded">await</code> for async</div>
            <div>• Use <code className="px-1 py-0.5 bg-theme-surface rounded">console.log</code> for debug</div>
            <div>• Access last result with return</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
