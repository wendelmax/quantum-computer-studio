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
import QASMEditor from './components/QASMEditor'
import { useCircuitEngine } from './hooks/useCircuitEngine'
import { useCircuitPrefs } from '../CircuitPrefs'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { useTranslation } from 'react-i18next'
import { useQuantumStore } from '../../store/quantumStore'
import { parseJSON } from '../../lib/safeStorage'
import { circuitDepth, QuantumMetrics } from 'quantum-computer-js'
import { downloadFile } from '../../lib/exportUtils'
import type { Circuit } from 'quantum-computer-js'

export default function CircuitsPage() {
  const { t } = useTranslation()
  const storeCircuit = useQuantumStore(state => state.circuit)
  const autoRun = useQuantumStore(state => state.autoRun)
  const setStoreCircuit = useQuantumStore(state => state.setCircuit)
  const { numQubits, shots } = useCircuitPrefs()
  const engine = useCircuitEngine(numQubits)
  const [selectedGate, setSelectedGate] = useState<string | undefined>(undefined)
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual')
  const [qasmError, setQasmError] = useState<string | null>(null)
  const depth = circuitDepth(engine.circuit)

  useEffect(() => {
    if (storeCircuit && !engine.circuit.gates.length && !engine.canUndo) {
      // First load or empty circuit
      engine.replaceCircuit(storeCircuit)
      if (autoRun) {
        setStoreCircuit(storeCircuit, false)
        setTimeout(() => engine.execute(), 50)
      }
    }
  }, []) // initial load

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
    } catch { }
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
      } catch { }
    }
  }, [])

  return (
    <div className="p-4 lg:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-theme-text">{t('studio.title')}</h2>

        <div className="flex bg-theme-surface border border-theme-border rounded-lg p-1">
          <button
            onClick={() => setViewMode('visual')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'visual' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-theme-text-muted hover:text-theme-text'}`}
          >
            Visual
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'code' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-theme-text-muted hover:text-theme-text'}`}
          >
            QASM Code
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-theme-text-muted">
          <div className="flex items-center gap-1">
            <span className="font-mono">{engine.circuit.gates.length}</span>
            <span>{t('studio.gates')}</span>
          </div>
          <div className="w-px h-4 bg-theme-border" />
          <div className="flex items-center gap-1">
            <span className="font-mono">{depth}</span>
            <span>{t('studio.depth')}</span>
          </div>
          <div className="w-px h-4 bg-theme-border" />
          <div className="flex items-center gap-1">
            <span className="font-mono">{engine.circuit.numQubits}</span>
            <span>{t('studio.qubits')}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 flex flex-col gap-4">
          {viewMode === 'visual' ? (
            <>
              <CircuitCanvas
                circuit={engine.circuit}
                selectedGate={selectedGate}
                onPlace={(g, target) => engine.addGate(g, target)}
                onRemove={(target, idx) => engine.removeGateAt(target, idx)}
                onMove={(fromTarget, fromIdx, toTarget, toIdx) => engine.moveGate(fromTarget, fromIdx, toTarget, toIdx)}
              />
              <QubitTimeline circuit={engine.circuit} />
            </>
          ) : (
            <div className="flex-1 min-h-[500px]">
              <QASMEditor
                circuit={engine.circuit}
                onChange={(c) => engine.replaceCircuit(c)}
                onValidationError={setQasmError}
              />
            </div>
          )}
          {engine.isProcessing && (
            <Card title={t('studio.running')} description={t('studio.simulating')} className="animate-slide-up border-primary/50">
              <div className="flex items-center gap-3 py-2">
                <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-sm text-theme-text-muted">{t('studio.computing')}</span>
              </div>
            </Card>
          )}
          {!engine.isProcessing && engine.result?.probabilities && Object.keys(engine.result.probabilities).length > 0 && (
            <Card title={t('studio.results')} description={t('studio.prob_dist')} className="animate-slide-up">
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
                  {t('studio.export_btn')}
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {engine.result && Object.entries(engine.result.probabilities)
                  .sort((a, b) => (b[1] as number) - (a[1] as number))
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
                          style={{ height: `${(prob as number) * 100}%`, animationDelay: `${i * 50}ms` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-primary font-semibold transition-colors duration-200">{((prob as number) * 100).toFixed(1)}%</div>
                    </div>
                  ))}
              </div>
            </Card>
          )}
          {!engine.isProcessing && engine.result?.stateVector && (
            <div className="flex gap-4 animate-fade-in mt-2">
              <div className="px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 flex flex-col">
                <span className="text-[10px] uppercase text-primary font-bold tracking-widest">Von Neumann Entropy</span>
                <span className="text-xl font-mono text-theme-text">
                  {(() => {
                    const sv = engine.result.stateVector
                    const complexSV = []
                    for (let i = 0; i < sv.length; i += 2) complexSV.push({ r: sv[i], i: sv[i + 1] })
                    // Trace out all but one qubit to see single-qubit mixedness
                    const circQubits = engine.circuit.numQubits
                    const dm = QuantumMetrics.partialTrace(complexSV, circQubits, Array.from({ length: Math.max(0, circQubits - 1) }, (_, i) => i + 1))
                    return QuantumMetrics.calculateEntropy(dm).toFixed(4)
                  })()}
                </span>
              </div>
              <div className="px-3 py-2 rounded-lg bg-accent/10 border border-accent/20 flex flex-col">
                <span className="text-[10px] uppercase text-accent font-bold tracking-widest">State Purity</span>
                <span className="text-xl font-mono text-theme-text">
                  100%
                </span>
              </div>
            </div>
          )}
          <StateViewer
            probabilities={engine.result?.probabilities}
            processing={engine.isProcessing}
            stateVector={engine.result?.stateVector}
            numQubits={engine.circuit.numQubits}
          />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-4">
          <GatePanel
            numQubits={engine.circuit.numQubits}
            onAdd={(g, target, angle, control, control2, target2) => engine.addGate(g, target, angle, control, control2, target2)}
            onSelect={(g) => setSelectedGate(g)}
            initialStates={engine.circuit.initialStates}
            onSetInitialState={engine.setInitialState}
          />
          <AlgorithmsInline onLoadAlgorithm={(id, autoRunPreset) => {
            const preset = getPreset(id)
            engine.replaceCircuit(preset)
            if (autoRunPreset) engine.execute()
          }} />
          <CircuitControls
            onRun={handleRun}
            onReset={engine.reset}
            onUndo={engine.undo}
            onRedo={engine.redo}
            canUndo={engine.canUndo}
            canRedo={engine.canRedo}
            validationError={engine.validationError || qasmError}
            circuitJSON={JSON.stringify(engine.circuit)}
            onImport={(txt) => {
              const parsed = parseJSON<Circuit | null>(txt, null)
              if (parsed && typeof parsed.numQubits === 'number' && Array.isArray(parsed.gates)) engine.replaceCircuit(parsed)
            }}
          />
          <div className="mt-2 flex gap-2 flex-wrap">
            <Button variant="secondary" className="text-xs transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]" onClick={handleRunShots}>
              {t('studio.run_shots', { shots })}
            </Button>
            <Button variant="secondary" className="text-xs transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]" onClick={() => engine.execute({ noise: 0.05 })}>
              {t('studio.run_noise')}
            </Button>
            <Button variant="secondary" className="text-xs transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]" onClick={shareUrl}>
              {t('studio.copy_link')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
