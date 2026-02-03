import React, { useState, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartBar, faBolt } from '@fortawesome/free-solid-svg-icons'
import CircuitCanvas from './components/CircuitCanvas'
import GatePanel from './components/GatePanel'
import { getPreset } from '../algorithms/services/presets'
import AlgorithmsInline from './components/AlgorithmsInline'
import StateViewer from './components/StateViewer'
import CircuitControls from './components/CircuitControls'
import QubitTimeline from './components/QubitTimeline'
import { useCircuitEngine } from './hooks/useCircuitEngine'
import { useCircuitPrefs } from '../CircuitPrefs'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { getItem, removeItem, setItem, parseJSON } from '../../lib/safeStorage'
import { QUANTUM_SET_CIRCUIT } from '../../lib/events'
import { circuitDepth } from '../../lib/circuitUtils'
import { downloadFile } from '../../lib/exportUtils'
import type { Circuit } from '../../types/Circuit'

export default function CircuitsPage() {
  const { numQubits, shots } = useCircuitPrefs()
  const engine = useCircuitEngine(numQubits)
  const [selectedGate, setSelectedGate] = useState<string | undefined>(undefined)
  const depth = circuitDepth(engine.circuit)

  useEffect(() => {
    const loadCircuit = async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
      const raw = getItem('quantum:loadCircuit')
      if (raw) {
        const parsed = parseJSON<Circuit | null>(raw, null)
        if (parsed && typeof parsed.numQubits === 'number' && Array.isArray(parsed.gates)) {
          engine.replaceCircuit(parsed)
        }
        removeItem('quantum:loadCircuit')
        if (getItem('quantum:autoRun') === '1') {
          removeItem('quantum:autoRun')
          engine.execute()
        }
      }
    }
    loadCircuit()
  }, [engine.replaceCircuit, engine.execute])

  useEffect(() => {
    let isMounted = true
    const handler = (e: CustomEvent<{ circuit: Circuit; autoRun?: boolean }>) => {
      const detail = e?.detail
      if (detail?.circuit && isMounted) {
        engine.replaceCircuit(detail.circuit)
        if (detail.autoRun) engine.execute()
      }
    }
    window.addEventListener(QUANTUM_SET_CIRCUIT, handler as EventListener)
    return () => {
      isMounted = false
      window.removeEventListener(QUANTUM_SET_CIRCUIT, handler as EventListener)
    }
  }, [engine.replaceCircuit, engine.execute])

  const handleRun = useCallback(() => engine.execute(), [engine.execute])
  const handleRunShots = useCallback(() => engine.execute({ shots }), [engine.execute, shots])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault()
        handleRun()
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        engine.redo()
      }
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        engine.undo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleRun, engine.undo, engine.redo])

  const shareUrl = useCallback(() => {
    try {
      const json = JSON.stringify(engine.circuit)
      const b64 = btoa(unescape(encodeURIComponent(json)))
      const url = `${window.location.origin}${window.location.pathname}#circuit=${b64}`
      navigator.clipboard?.writeText(url)
    } catch {}
  }, [engine.circuit])

  useEffect(() => {
    const hash = window.location.hash
    const m = hash?.match(/#circuit=(.+)/)
    if (m && m[1]) {
      try {
        const json = decodeURIComponent(escape(atob(m[1])))
        const parsed = parseJSON<Circuit | null>(json, null)
        if (parsed && typeof parsed.numQubits === 'number' && Array.isArray(parsed.gates)) {
          engine.replaceCircuit(parsed)
        }
      } catch {}
    }
  }, [])

  return (
    <div className="p-4 lg:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-theme-text">Quantum Studio</h2>
        <div className="flex items-center gap-4 text-xs text-theme-text-muted">
          <div className="flex items-center gap-1">
            <span className="font-mono">{engine.circuit.gates.length}</span>
            <span>gates</span>
          </div>
          <div className="w-px h-4 bg-theme-border" />
          <div className="flex items-center gap-1">
            <span className="font-mono">{depth}</span>
            <span>depth</span>
          </div>
          <div className="w-px h-4 bg-theme-border" />
          <div className="flex items-center gap-1">
            <span className="font-mono">{numQubits}</span>
            <span>qubits</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <CircuitCanvas circuit={engine.circuit} selectedGate={selectedGate} onPlace={(g, target)=> engine.addGate(g, target)} onRemove={(target, idx)=> engine.removeGateAt(target, idx)} onMove={(fromTarget, fromIdx, toTarget, toIdx)=> engine.moveGate(fromTarget, fromIdx, toTarget, toIdx)} />
          <QubitTimeline circuit={engine.circuit} />
          {engine.isProcessing && (
            <Card title="Running" description="Simulating circuit..." className="animate-slide-up border-primary/50">
              <div className="flex items-center gap-3 py-2">
                <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-sm text-theme-text-muted">Computing state vector and probabilities</span>
              </div>
            </Card>
          )}
          {!engine.isProcessing && engine.result?.probabilities && Object.keys(engine.result.probabilities).length > 0 && (
            <Card title="Results" description="Probabilities distribution" className="animate-slide-up">
              <div className="flex justify-end mb-2">
                <Button
                  variant="secondary"
                  className="text-xs"
                  onClick={() => {
                    const payload = {
                      circuit: engine.circuit,
                      probabilities: engine.result!.probabilities,
                      stateVector: engine.result!.stateVector,
                    }
                    downloadFile(JSON.stringify(payload, null, 2), 'circuit-result.json', 'application/json')
                  }}
                >
                  Export result
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {Object.entries(engine.result.probabilities)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([state, prob], i) => (
                    <div
                      key={state}
                      className="flex flex-col items-center p-2 rounded bg-theme-surface/50 border border-theme-border transition-smooth hover:border-primary/50 hover:bg-theme-surface animate-fade-in opacity-0"
                      style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'forwards' }}
                    >
                      <div className="text-xs font-mono text-theme-text">|{state}⟩</div>
                      <div className="mt-1 w-12 h-16 bg-theme-surface rounded overflow-hidden flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-primary to-accent animate-bar-grow"
                          style={{ height: `${prob * 100}%`, animationDelay: `${i * 50}ms` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-primary font-semibold transition-colors duration-200">{(prob * 100).toFixed(1)}%</div>
                    </div>
                  ))}
              </div>
            </Card>
          )}
          <StateViewer
            probabilities={engine.result?.probabilities}
            processing={engine.isProcessing}
            stateVector={engine.result?.stateVector}
            numQubits={numQubits}
          />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-4">
          <GatePanel
            numQubits={numQubits}
            onAdd={(g, target, angle, control, control2, target2)=> engine.addGate(g, target, angle, control, control2, target2)}
            onSelect={(g)=> setSelectedGate(g)}
            initialStates={engine.circuit.initialStates}
            onSetInitialState={engine.setInitialState}
          />
          <AlgorithmsInline onLoadAlgorithm={(id, autoRun)=> {
            const preset = getPreset(id)
            engine.replaceCircuit(preset)
            setItem('quantum:circuit', JSON.stringify(preset))
            setItem('quantum:prefs:numQubits', String(preset.numQubits))
            if (autoRun) engine.execute()
          }} />
          <CircuitControls
            onRun={handleRun}
            onReset={engine.reset}
            onUndo={engine.undo}
            onRedo={engine.redo}
            canUndo={engine.canUndo}
            canRedo={engine.canRedo}
            validationError={engine.validationError}
            circuitJSON={JSON.stringify(engine.circuit)}
            onImport={(txt)=> {
              const parsed = parseJSON<Circuit | null>(txt, null)
              if (parsed && typeof parsed.numQubits === 'number' && Array.isArray(parsed.gates)) engine.replaceCircuit(parsed)
            }}
          />
          <div className="mt-2 flex gap-2 flex-wrap">
            <Button variant="secondary" className="text-xs transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]" onClick={handleRunShots}>
              Run (shots {shots})
            </Button>
            <Button variant="secondary" className="text-xs transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]" onClick={() => engine.execute({ noise: 0.05 })}>
              Run (noise 5%)
            </Button>
            <Button variant="secondary" className="text-xs transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]" onClick={shareUrl}>
              Copy share link
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
