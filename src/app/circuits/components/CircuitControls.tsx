import React, { useRef, useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faRotateLeft, faDownload, faUpload, faUndo, faRedo, faCopy } from '@fortawesome/free-solid-svg-icons'
import Button from '../../../components/Button'
import { circuitToQASM, parseQASM } from 'quantum-computer-js'
import { toEnglishCircuit, fromAnyCircuit } from '../services/serde'
import { exportToCirq, exportToQuil, importCircuit, detectFormat } from '../services/exportImport'
import { copyToClipboard } from '../../../lib/exportUtils'
import { getItem } from '../../../lib/safeStorage'
import type { Circuit } from 'quantum-computer-js'

const DEFAULT_EXPORT_KEY = 'quantum:prefs:defaultExportFormat'

interface CircuitControlsProps {
  onRun?: (options?: { shots?: number; noise?: number }) => void
  onReset?: () => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  validationError?: string | null
  circuitJSON?: string
  onImport?: (json: string) => void
}

const CircuitControls = ({ onRun, onReset, onUndo, onRedo, canUndo, canRedo, validationError, circuitJSON, onImport }: CircuitControlsProps) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [showExport, setShowExport] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showExport) return
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExport(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showExport])

  const exportJSON = () => {
    try {
      if (!circuitJSON) return
      const english = toEnglishCircuit(JSON.parse(circuitJSON))
      const blob = new Blob([JSON.stringify(english, null, 2)], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'circuit.json'
      a.click()
    } catch { }
  }

  const exportQASM = () => {
    try {
      if (!circuitJSON) return
      const circuit: Circuit = JSON.parse(circuitJSON)
      const qasm = circuitToQASM(circuit)
      const blob = new Blob([qasm], { type: 'text/plain' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'circuit.qasm'
      a.click()
    } catch (err) {
      console.error('QASM Export failed:', err)
    }
  }

  const exportCirq = () => {
    try {
      if (!circuitJSON) return
      const circuit: Circuit = JSON.parse(circuitJSON)
      const cirq = exportToCirq(circuit)
      const blob = new Blob([cirq], { type: 'text/plain' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'circuit.py'
      a.click()
    } catch { }
  }

  const exportQuil = () => {
    try {
      if (!circuitJSON) return
      const circuit: Circuit = JSON.parse(circuitJSON)
      const quil = exportToQuil(circuit)
      const blob = new Blob([quil], { type: 'text/plain' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'circuit.quil'
      a.click()
    } catch { }
  }

  const copyCircuitJSON = async () => {
    if (!circuitJSON) return
    const ok = await copyToClipboard(circuitJSON)
    if (ok) setShowExport(false)
  }

  const defaultFormat = getItem(DEFAULT_EXPORT_KEY) || 'json'
  const exportOptions: { id: string; label: string; run: () => void }[] = [
    { id: 'json', label: 'Download JSON', run: () => { exportJSON(); setShowExport(false) } },
    { id: 'qasm', label: 'QASM', run: () => { exportQASM(); setShowExport(false) } },
    { id: 'cirq', label: 'Cirq', run: () => { exportCirq(); setShowExport(false) } },
    { id: 'quil', label: 'Quil', run: () => { exportQuil(); setShowExport(false) } },
  ]
  const sorted = [...exportOptions].sort((a, b) => (a.id === defaultFormat ? -1 : b.id === defaultFormat ? 1 : 0))

  return (
    <div className="rounded-lg p-3 bg-bg-card border border-theme-border transition-all duration-300 hover:border-primary/50">
      {validationError && (
        <div className="mb-3 px-3 py-2 rounded bg-red-900/30 border border-red-700/50 text-xs text-red-300 animate-fade-in">
          {validationError}
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        <Button
          className="flex-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
          onClick={() => onRun?.()}
          title="Run (Ctrl+Enter)"
        >
          <FontAwesomeIcon icon={faPlay} className="mr-1.5" />
          Run
        </Button>
        <Button variant="secondary" className="transition-transform duration-200 hover:scale-105 disabled:hover:scale-100" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <FontAwesomeIcon icon={faUndo} className="mr-1.5" />
        </Button>
        <Button variant="secondary" className="transition-transform duration-200 hover:scale-105 disabled:hover:scale-100" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
          <FontAwesomeIcon icon={faRedo} className="mr-1.5" />
        </Button>
        <Button variant="secondary" className="flex-1 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]" onClick={onReset}>
          <FontAwesomeIcon icon={faRotateLeft} className="mr-1.5" />
          Reset
        </Button>
        <div className="relative" ref={exportRef}>
          <Button variant="secondary" onClick={() => setShowExport(!showExport)}>
            <FontAwesomeIcon icon={faDownload} className="mr-1.5" />
            Export
          </Button>
          {showExport && (
            <div className="absolute right-0 top-full mt-1 z-10 bg-theme-surface border border-theme-border rounded-lg p-2 shadow-lg min-w-32">
              <button onClick={() => copyCircuitJSON()} className="w-full text-left px-3 py-2 text-xs hover:bg-theme-border/50 rounded text-theme-text">Copy circuit JSON</button>
              {sorted.map((opt) => (
                <button key={opt.id} onClick={opt.run} className="w-full text-left px-3 py-2 text-xs hover:bg-theme-border/50 rounded text-theme-text">
                  {opt.label}{opt.id === defaultFormat ? ' (default)' : ''}
                </button>
              ))}
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept=".json,.qasm,.py,.quil,application/json,text/plain" className="hidden" onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return
          const txt = await f.text();
          try {
            const format = detectFormat(txt)
            if (format === 'qasm') {
              const circuit = parseQASM(txt)
              onImport?.(JSON.stringify(circuit))
            } else if (format === 'cirq' || format === 'quil') {
              const circuit = importCircuit(txt, format)
              onImport?.(JSON.stringify(circuit))
            } else {
              const circuit = fromAnyCircuit(txt)
              onImport?.(JSON.stringify(circuit))
            }
          } catch (err) {
            console.error('Import failed:', err)
            onImport?.(txt)
          }
        }} />
        <Button variant="secondary" onClick={async () => {
          if (!circuitJSON) return
          const qasm = circuitToQASM(JSON.parse(circuitJSON))
          await copyToClipboard(qasm)
        }} title="Copy QASM">
          <FontAwesomeIcon icon={faCopy} className="mr-1.5" />
          QASM
        </Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>
          <FontAwesomeIcon icon={faUpload} className="mr-1.5" />
          Import
        </Button>
      </div>
    </div>
  )
}

export default CircuitControls


