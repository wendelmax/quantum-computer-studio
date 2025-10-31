import React, { useRef, useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faRotateLeft, faDownload, faUpload } from '@fortawesome/free-solid-svg-icons'
import Button from '../../../components/Button'
import { toEnglishCircuit, fromAnyCircuit } from '../services/serde'
import { exportToQASM, exportToCirq, exportToQuil, importCircuit, detectFormat } from '../services/exportImport'
import type { Circuit } from '../hooks/useCircuitEngine'

interface CircuitControlsProps {
  onRun?: () => void
  onReset?: () => void
  circuitJSON?: string
  onImport?: (json: string) => void
}

const CircuitControls = ({ onRun, onReset, circuitJSON, onImport }: CircuitControlsProps) => {
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
    } catch {}
  }

  const exportQASM = () => {
    try {
      if (!circuitJSON) return
      const circuit: Circuit = JSON.parse(circuitJSON)
      const qasm = exportToQASM(circuit)
      const blob = new Blob([qasm], { type: 'text/plain' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'circuit.qasm'
      a.click()
    } catch {}
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
    } catch {}
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
    } catch {}
  }

  return (
    <div className="rounded-lg p-3 bg-[#021825] border border-slate-800">
      <div className="flex gap-2 flex-wrap">
        <Button className="flex-1" onClick={onRun}>
          <FontAwesomeIcon icon={faPlay} className="mr-1.5" />
          Run
        </Button>
        <Button variant="secondary" className="flex-1" onClick={onReset}>
          <FontAwesomeIcon icon={faRotateLeft} className="mr-1.5" />
          Reset
        </Button>
        <div className="relative" ref={exportRef}>
          <Button variant="secondary" onClick={() => setShowExport(!showExport)}>
            <FontAwesomeIcon icon={faDownload} className="mr-1.5" />
            Export
          </Button>
          {showExport && (
            <div className="absolute right-0 top-full mt-1 z-10 bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-lg min-w-32">
              <button onClick={() => { exportJSON(); setShowExport(false) }} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 rounded">JSON</button>
              <button onClick={() => { exportQASM(); setShowExport(false) }} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 rounded">QASM</button>
              <button onClick={() => { exportCirq(); setShowExport(false) }} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 rounded">Cirq</button>
              <button onClick={() => { exportQuil(); setShowExport(false) }} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 rounded">Quil</button>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept=".json,.qasm,.py,.quil,application/json,text/plain" className="hidden" onChange={async (e)=>{
          const f = e.target.files?.[0]; if (!f) return
          const txt = await f.text();
          try {
            const format = detectFormat(txt)
            if (format === 'qasm' || format === 'cirq' || format === 'quil') {
              const circuit = importCircuit(txt, format)
              onImport?.(JSON.stringify(circuit))
            } else {
              const circuit = fromAnyCircuit(txt)
              onImport?.(JSON.stringify(circuit))
            }
          } catch {
            onImport?.(txt)
          }
        }} />
        <Button variant="secondary" onClick={()=> fileRef.current?.click()}>
          <FontAwesomeIcon icon={faUpload} className="mr-1.5" />
          Import
        </Button>
      </div>
    </div>
  )
}

export default CircuitControls


