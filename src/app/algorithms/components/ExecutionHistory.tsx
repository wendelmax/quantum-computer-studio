import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faHistory, faTrash, faClock, faMicrochip, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { getItem, setItem, parseJSON, removeItem } from '../../../lib/safeStorage'
import { downloadFile } from '../../../lib/exportUtils'
import { QUANTUM_ALGORITHM_EXECUTION } from '../../../lib/events'
import Card from '../../../components/Card'
import { useTranslation } from 'react-i18next'

type ExecutionRecord = {
  algorithmId: string
  algorithmName: string
  timestamp: number
  executionTime: number
  states: number
}

export default function ExecutionHistory() {
  const { t } = useTranslation()
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

  const exportHistory = () => {
    const payload = history.map(r => ({ ...r, date: new Date(r.timestamp).toISOString() }))
    downloadFile(JSON.stringify(payload, null, 2), 'execution-history.json', 'application/json')
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faHistory} className="text-primary text-xs" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-theme-text-muted">{t('algorithms.history_title')}</h4>
        </div>
        {history.length > 0 && (
          <div className="flex items-center gap-4">
             <button onClick={exportHistory} className="text-[9px] font-black uppercase text-theme-text-muted hover:text-primary transition-colors tracking-tighter">
                <FontAwesomeIcon icon={faDownload} className="mr-1.5" />
                {t('algorithms.export_btn')}
             </button>
             <button onClick={clearHistory} className="text-[9px] font-black uppercase text-theme-text-muted hover:text-red-500 transition-colors tracking-tighter">
                <FontAwesomeIcon icon={faTrash} className="mr-1.5" />
                {t('algorithms.clear_btn')}
             </button>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-center opacity-40">
           <FontAwesomeIcon icon={faClock} className="text-2xl mb-3" />
           <p className="text-[10px] font-bold uppercase tracking-widest">{t('algorithms.no_history')}</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin pr-1">
          {history.map((record, idx) => (
            <div key={idx} className="group p-3 rounded-xl bg-theme-border/10 border border-theme-border/30 hover:border-primary/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-[10px] text-primary">
                      <FontAwesomeIcon icon={faCheckCircle} />
                   </div>
                   <span className="text-xs font-bold text-theme-text uppercase tracking-tight">{record.algorithmName}</span>
                </div>
                <span className="text-[9px] font-mono font-bold opacity-40">#{history.length - idx}</span>
              </div>
              
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-tighter text-theme-text-muted">
                 <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                       <FontAwesomeIcon icon={faClock} className="text-[8px]" />
                       {record.executionTime.toFixed(0)}ms
                    </span>
                    <span className="flex items-center gap-1">
                       <FontAwesomeIcon icon={faMicrochip} className="text-[8px]" />
                       {record.states} {t('algorithms.states_label')}
                    </span>
                 </div>
                 <div className="opacity-60">
                    {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
