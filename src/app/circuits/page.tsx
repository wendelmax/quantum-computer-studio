import React, { useState, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartBar, faBolt } from '@fortawesome/free-solid-svg-icons'
import CircuitCanvas from './components/CircuitCanvas'
import GatePanel from './components/GatePanel'
import { getPreset } from '../algorithms/services/presets'
import AlgorithmsInline from './components/AlgorithmsInline'
import ExecutionTerminal from './components/ExecutionTerminal'
import CircuitControls from './components/CircuitControls'
import QubitTimeline from './components/QubitTimeline'
import QASMEditor from './components/QASMEditor'
import JSEditor from './components/JSEditor'
import { useCircuitEngine } from './hooks/useCircuitEngine'
import { useCircuitPrefs } from '../CircuitPrefs'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { useTranslation } from 'react-i18next'
import { useQuantumStore } from '../../store/quantumStore'
import { parseJSON } from '../../lib/safeStorage'
import { toast } from 'sonner'
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
  const [viewMode, setViewMode] = useState<'visual' | 'code' | 'js'>('visual')
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

  const shareUrl = useCallback(async () => {
    try {
      const json = JSON.stringify(engine.circuit)
      const b64 = btoa(unescape(encodeURIComponent(json)))
      const url = `${window.location.origin}${window.location.pathname}#circuit=${b64}`
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        toast.success(t('studio.copy_link_success'))
      } else {
        toast.error(t('studio.copy_link_error'))
      }
    } catch {
      toast.error(t('studio.share_link_error'))
    }
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
          <button
            onClick={() => setViewMode('js')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'js' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-theme-text-muted hover:text-theme-text'}`}
          >
            JS Lib
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

      {/* Top Toolbar (Ribbon) */}
      <div className="mb-4 animate-fade-in shadow-sm">
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
        <div className="mt-2 flex gap-2 flex-wrap px-1">
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

      {/* Main IDE Layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Sidebar (Toolbox / Explorer) */}
        <div className="lg:w-72 flex flex-col gap-4 animate-slide-right shrink-0">
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
        </div>

        {/* Center Canvas / Code Area & Bottom Panel */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Main Editor View */}
          <div className="bg-theme-surface/30 rounded-xl border border-theme-border/50 shadow-sm p-4 lg:p-5">
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
          ) : viewMode === 'code' ? (
            <div className="flex-1 min-h-[500px]">
              <QASMEditor
                circuit={engine.circuit}
                onChange={(c) => engine.replaceCircuit(c)}
                onValidationError={setQasmError}
              />
            </div>
          ) : (
            <div className="flex-1 min-h-[500px]">
              <JSEditor circuit={engine.circuit} />
            </div>
          )}
          </div>
          
          {/* Output / Terminal Area */}
          <div className="flex flex-col gap-4">
          {engine.isProcessing && (
            <Card title={t('studio.running')} description={t('studio.simulating')} className="animate-slide-up border-primary/50">
              <div className="flex items-center gap-3 py-2">
                <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-sm text-theme-text-muted">{t('studio.computing')}</span>
              </div>
            </Card>
          )}
          <ExecutionTerminal
            circuit={engine.circuit}
            probabilities={engine.result?.probabilities}
            processing={engine.isProcessing}
            stateVector={engine.result?.stateVector}
          />
          </div>
        </div>
      </div>
    </div>
  )
}
