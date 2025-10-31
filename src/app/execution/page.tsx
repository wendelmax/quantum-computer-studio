import React, { useState, useEffect } from 'react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import { runSimulation } from '../circuits/services/simulator'
import ExecutionMonitor from './components/ExecutionMonitor'
import PerformanceStats from './components/PerformanceStats'
import QubitStateViewer from './components/QubitStateViewer'

export default function ExecutionPage() {
  const [status, setStatus] = useState<'idle'|'running'|'done'>('idle')
  const [ms, setMs] = useState<number>(0)
  const [summary, setSummary] = useState<string>('')
  const [probabilities, setProbabilities] = useState<Record<string, number> | undefined>(undefined)
  const [startTime, setStartTime] = useState<number>(0)
  const [progress, setProgress] = useState(0)
  
  const [history, setHistory] = useState<Array<{time: number, states: number, ms: number}>>([])

  useEffect(() => {
    if (status === 'running') {
      const interval = setInterval(() => {
        if (startTime) {
          const elapsed = Date.now() - startTime
          setProgress(Math.min(95, (elapsed / 1000) * 10))
        }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [status, startTime])

  async function runCurrent() {
    try {
      const raw = localStorage.getItem('quantum:circuit')
      if (!raw) {
        setSummary('No circuit loaded')
        return
      }
      
      const circuit = JSON.parse(raw)
      setStatus('running')
      setProgress(0)
      setProbabilities(undefined)
      setStartTime(Date.now())
      
      const t0 = performance.now()
      const res = await runSimulation(circuit)
      const t1 = performance.now()
      
      const executionTime = t1 - t0
      setMs(executionTime)
      setSummary(`states: ${Object.keys(res.probabilities).length}`)
      setProbabilities(res.probabilities)
      setStatus('done')
      setProgress(100)
      
      setHistory(prev => [{time: Date.now(), states: Object.keys(res.probabilities).length, ms: executionTime}, ...prev].slice(0, 10))
      
      setTimeout(() => {
        setStatus('idle')
        setProgress(0)
      }, 2000)
    } catch (err: any) {
      setSummary(`Error: ${err.message || 'Simulation failed'}`)
      setStatus('idle')
      setProgress(0)
    }
  }

  return (
    <div className="p-6 grid grid-cols-12 gap-4">
      <div className="col-span-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Execution Monitor</h2>
          <Button onClick={runCurrent} disabled={status === 'running'}>
            {status === 'running' ? 'Running...' : 'Run Circuit'}
          </Button>
        </div>

        <ExecutionMonitor 
          isRunning={status === 'running'} 
          progress={progress}
          startTime={startTime}
        />

        <PerformanceStats 
          stats={status === 'done' ? {
            executionTime: ms,
            numStates: probabilities ? Object.keys(probabilities).length : 0,
            numGates: 0
          } : undefined}
        />

        <Card title="Execution Summary">
          <div className="text-sm text-slate-300">
            {summary || (status === 'idle' ? 'No execution yet' : 'Ready to run')}
          </div>
        </Card>

        {history.length > 0 && (
          <Card title="Execution History">
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
              {history.map((run, i) => (
                <div key={i} className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                  <span className="text-slate-300">Run {i + 1}</span>
                  <div className="flex gap-4 text-slate-400">
                    <span>{run.states} states</span>
                    <span>{run.ms.toFixed(2)}ms</span>
                    <span>{new Date(run.time).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <div className="col-span-4 flex flex-col gap-4">
        <QubitStateViewer probabilities={probabilities} />

        <Card title="Load Circuit">
          <div className="text-xs text-slate-300 mb-3">
            Navigate to Quantum Studio to build or modify circuits before running here.
          </div>
          <Button variant="secondary" className="w-full" onClick={() => window.location.href = '/circuits'}>
            Open Quantum Studio
          </Button>
        </Card>

        <Card title="About Execution">
          <div className="text-xs text-slate-300 space-y-2">
            <p>
              Monitor circuit execution with real-time performance metrics and state visualization.
            </p>
            <p>
              <strong>Performance indicators:</strong>
              <br />
              • Execution time
              <br />
              • States discovered
              <br />
              • Gates processed
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
