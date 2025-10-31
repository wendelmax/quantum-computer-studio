import React, { useState } from 'react'
import Button from '../../../components/Button'

type Props = {
  rawData: string[][]
  normalizedData: number[][]
}

export default function DataExporter({ rawData, normalizedData }: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const exportRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!showMenu) return
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const exportCSV = (data: string[][] | number[][], filename: string) => {
    const csv = data.map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportJSON = (data: any, filename: string) => {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportQuantum = () => {
    if (normalizedData.length === 0) return
    
    const qubits = Math.ceil(Math.log2(normalizedData.length))
    const circuit = {
      numQubits: Math.max(2, qubits),
      gates: normalizedData.slice(0, 10).map((row, i) => ({
        type: 'H',
        target: i % Math.max(2, qubits)
      }))
    }
    
    exportJSON(circuit, 'quantum-circuit.json')
  }

  if (rawData.length === 0) return null

  return (
    <div className="relative" ref={exportRef}>
      <Button onClick={() => setShowMenu(!showMenu)}>Export</Button>
      {showMenu && (
        <div className="absolute right-0 top-full mt-1 z-10 bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-lg min-w-40">
          <div className="text-xs text-slate-400 mb-2 px-2">Raw Data</div>
          <button 
            onClick={() => { exportCSV(rawData, 'data-raw.csv'); setShowMenu(false) }}
            className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 rounded"
          >
            Export CSV
          </button>
          <button 
            onClick={() => { exportJSON(rawData, 'data-raw.json'); setShowMenu(false) }}
            className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 rounded"
          >
            Export JSON
          </button>
          
          {normalizedData.length > 0 && (
            <>
              <div className="border-t border-slate-800 my-2" />
              <div className="text-xs text-slate-400 mb-2 px-2">Normalized</div>
              <button 
                onClick={() => { exportCSV(normalizedData, 'data-normalized.csv'); setShowMenu(false) }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 rounded"
              >
                Export CSV
              </button>
              <button 
                onClick={() => { exportJSON(normalizedData, 'data-normalized.json'); setShowMenu(false) }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 rounded"
              >
                Export JSON
              </button>
            </>
          )}
          
          {normalizedData.length > 0 && (
            <>
              <div className="border-t border-slate-800 my-2" />
              <div className="text-xs text-slate-400 mb-2 px-2">Quantum</div>
              <button 
                onClick={() => { exportQuantum(); setShowMenu(false) }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 rounded"
              >
                Export Circuit
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

