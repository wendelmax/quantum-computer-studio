import React, { useState, useEffect } from 'react'

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
    try {
      const stored = localStorage.getItem('quantum:executionHistory')
      if (stored) {
        setHistory(JSON.parse(stored))
      }
    } catch {}

    const handleExecution = (e: CustomEvent) => {
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
        try {
          localStorage.setItem('quantum:executionHistory', JSON.stringify(updated))
        } catch {}
        return updated
      })
    }

    window.addEventListener('quantum:algorithm-execution' as any, handleExecution as EventListener)
    return () => window.removeEventListener('quantum:algorithm-execution' as any, handleExecution as EventListener)
  }, [])

  const clearHistory = () => {
    setHistory([])
    try {
      localStorage.removeItem('quantum:executionHistory')
    } catch {}
  }

  if (history.length === 0) {
    return (
      <div className="p-4 rounded bg-bg-card border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">Execution History</h4>
        </div>
        <div className="text-xs text-slate-400">No executions yet</div>
      </div>
    )
  }

  return (
    <div className="p-4 rounded bg-bg-card border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">Execution History</h4>
        <button
          onClick={clearHistory}
          className="text-xs text-slate-400 hover:text-slate-300"
        >
          Clear
        </button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
        {history.map((record, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <div className="flex-1 min-w-0">
              <div className="text-slate-300 truncate">{record.algorithmName}</div>
              <div className="text-slate-500 text-[10px]">
                {new Date(record.timestamp).toLocaleString()}
              </div>
            </div>
            <div className="ml-2 text-slate-400 text-right">
              <div>{record.executionTime.toFixed(0)}ms</div>
              <div className="text-[10px]">{record.states} states</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

