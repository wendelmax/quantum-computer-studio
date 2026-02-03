import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faExternalLink } from '@fortawesome/free-solid-svg-icons'
import QASMEditor from './components/QASMEditor'
import RunButton from './components/RunButton'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { qasmToCircuit } from './services/qasmParser'
import { runSimulation } from '../circuits/services/simulator'

const EXAMPLE_CODES = {
  bell: `OPENQASM 2.0
include "qelib1.inc";

qreg q[2];
creg c[2];

h q[0];
cx q[0], q[1];
measure q[0] -> c[0];
measure q[1] -> c[1];`,
  grover: `OPENQASM 2.0
include "qelib1.inc";

qreg q[2];

h q[0];
h q[1];
cx q[0], q[1];
h q[0];
h q[1];`,
  superposition: `OPENQASM 2.0
include "qelib1.inc";

qreg q[1];

h q[0];`
}

export default function PlaygroundPage() {
  const [code, setCode] = useState(() => {
    try { return localStorage.getItem('quantum:play:code') || EXAMPLE_CODES.bell } catch { return EXAMPLE_CODES.bell }
  })
  const [output, setOutput] = useState('')
  const [results, setResults] = useState<Record<string, number> | null>(null)
  const [error, setError] = useState<string>('')
  
  React.useEffect(()=>{ try { localStorage.setItem('quantum:play:code', code) } catch {} }, [code])

  async function runInWorker() {
    setError('')
    setResults(null)
    
    try {
      const circuit = qasmToCircuit(code, 5)
      const result = await runSimulation(circuit)
      setResults(result.probabilities)
      setOutput(`Simulation complete. Found ${Object.keys(result.probabilities).length} states.`)
    } catch (err: any) {
      setError(err.message || 'Simulation failed')
      setOutput(err.message || 'Error')
    }
  }

  const loadToStudio = () => {
    try {
      const circuit = qasmToCircuit(code, 5)
      localStorage.setItem('quantum:loadCircuit', JSON.stringify(circuit))
      localStorage.setItem('quantum:circuit', JSON.stringify(circuit))
      window.dispatchEvent(new CustomEvent('quantum:set-circuit', { detail: { circuit, autoRun: false } }))
      window.location.href = '/circuits'
    } catch (err: any) {
      setError(err.message || 'Failed to load circuit')
    }
  }

  return (
    <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-8 flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-theme-text">QASM Playground</h2>
        
        <QASMEditor value={code} onChange={setCode} />
        
        <div className="flex items-center gap-3">
          <RunButton onRun={runInWorker} />
          <Button variant="secondary" onClick={loadToStudio}>
            <FontAwesomeIcon icon={faExternalLink} className="mr-1.5" />
            Load to Studio
          </Button>
          {error && <span className="text-xs text-red-400">{error}</span>}
        </div>

        {output && (
          <Card title="Output">
            <pre className="text-xs text-theme-text whitespace-pre-wrap">{output}</pre>
          </Card>
        )}

        {results && (
          <Card title="Simulation Results">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(results)
                .filter(([_, prob]) => prob > 0.01)
                .sort((a, b) => b[1] - a[1])
                .map(([state, prob]) => (
                  <div key={state} className="flex flex-col items-center">
                    <div className="w-8 h-16 bg-theme-surface/30 border border-theme-border rounded flex items-end">
                      <div className="w-full bg-primary/60" style={{height: `${prob*100}%`}} />
                    </div>
                    <div className="mt-1 text-[10px] text-theme-text-muted font-mono">{state}</div>
                    <div className="text-[10px] text-theme-text-muted">{(prob*100).toFixed(1)}%</div>
                  </div>
                ))}
            </div>
          </Card>
        )}
      </div>

      <div className="lg:col-span-4 flex flex-col gap-4">
        <Card title="Example Circuits">
          <div className="space-y-2">
            <Button variant="secondary" className="w-full text-xs" onClick={() => setCode(EXAMPLE_CODES.bell)}>
              Bell State
            </Button>
            <Button variant="secondary" className="w-full text-xs" onClick={() => setCode(EXAMPLE_CODES.grover)}>
              Grover 2-qubit
            </Button>
            <Button variant="secondary" className="w-full text-xs" onClick={() => setCode(EXAMPLE_CODES.superposition)}>
              Superposition
            </Button>
          </div>
        </Card>

        <Card title="QASM Reference">
          <div className="text-xs text-theme-text space-y-2">
            <div>
              <strong>Single qubit:</strong> h q[0], x q[1]
            </div>
            <div>
              <strong>Two-qubit:</strong> cx q[0], q[1]
            </div>
            <div>
              <strong>Rotation:</strong> rx(π/2) q[0]
            </div>
            <div>
              <strong>Measurement:</strong> measure q[0] -&gt; c[0]
            </div>
          </div>
        </Card>

        <Card title="About QASM">
          <div className="text-xs text-theme-text space-y-2">
            <p>
              QASM (Quantum Assembly) is a low-level language for describing quantum circuits.
              This playground supports basic syntax parsing and execution.
            </p>
            <p className="text-theme-text-muted">
              Full QASM 2.0 specification coming soon.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
