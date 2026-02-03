import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { getItem, setItem, parseJSON, removeItem } from '../../../lib/safeStorage'
import { downloadFile } from '../../../lib/exportUtils'
import { QUANTUM_ALGORITHM_EXECUTION } from '../../../lib/events'

type ExecutionRecord = {
  algorithmId: string
  algorithmName: string
  timestamp: number
  executionTime: number
  states: number
}

export default function ExecutionHistory() {
  const [history, setHistory] = useState<ExecutionRecord[]>([])

  useEffect(() => {
    const stored = getItem('quantum:executionHistory')
    if (stored) {
      const parsed = parseJSON<ExecutionRecord[]>(stored, [])
      if (Array.isArray(parsed)) setHistory(parsed)
    }

    const handleExecution = (e: CustomEvent<{ algorithm: string; executionTime: number; states: number }>) => {
      const { algorithm, executionTime, states } = e.detail
      const newRecord: ExecutionRecord = {
        algorithmId: algorithm,
        algorithmName: algorithm,
        timestamp: Date.now(),
        executionTime,
        states
      }
      setHistory(prev => {
        const updated = [newRecord, ...prev].slice(0, 10)
        setItem('quantum:executionHistory', JSON.stringify(updated))
        return updated
      })
    }

    window.addEventListener(QUANTUM_ALGORITHM_EXECUTION, handleExecution as EventListener)
    return () => window.removeEventListener(QUANTUM_ALGORITHM_EXECUTION, handleExecution as EventListener)
  }, [])

  const clearHistory = () => {
    setHistory([])
    removeItem('quantum:executionHistory')
  }

  if (history.length === 0) {
    return (
      <div className="p-4 rounded bg-bg-card border border-theme-border">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-theme-text">Execution History</h4>
        </div>
        <div className="text-xs text-theme-text-muted">No executions yet</div>
      </div>
    )
  }

  const exportHistory = () => {
    const payload = history.map(r => ({ ...r, date: new Date(r.timestamp).toISOString() }))
    downloadFile(JSON.stringify(payload, null, 2), 'execution-history.json', 'application/json')
  }

  return (
    <div className="p-4 rounded bg-bg-card border border-theme-border">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-theme-text">Execution History</h4>
        <div className="flex items-center gap-2">
          <button onClick={exportHistory} className="text-xs text-theme-text-muted hover:text-theme-text flex items-center gap-1">
            <FontAwesomeIcon icon={faDownload} className="text-[10px]" />
            Export
          </button>
          <button
            onClick={clearHistory}
            className="text-xs text-theme-text-muted hover:text-theme-text"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
        {history.map((record, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs border-b border-theme-border pb-2">
            <div className="flex-1 min-w-0">
              <div className="text-theme-text truncate">{record.algorithmName}</div>
              <div className="text-theme-text-muted text-[10px]">
                {new Date(record.timestamp).toLocaleString()}
              </div>
            </div>
            <div className="ml-2 text-theme-text-muted text-right">
              <div>{record.executionTime.toFixed(0)}ms</div>
              <div className="text-[10px]">{record.states} states</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

