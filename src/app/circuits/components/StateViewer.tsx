import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

type Props = {
  probabilities?: Record<string, number>
  processing?: boolean
  stateVector?: number[]
  numQubits?: number
}

function formatComplex(r: number, i: number): string {
  if (Math.abs(i) < 1e-6) return r.toFixed(3)
  if (Math.abs(r) < 1e-6) return `${i.toFixed(3)}i`
  return `${r.toFixed(3)}${i >= 0 ? '+' : ''}${i.toFixed(3)}i`
}

export default function StateViewer({ probabilities, processing, stateVector, numQubits = 0 }: Props) {
  const [escala, setEscala] = useState(1)
  const [showVector, setShowVector] = useState(false)
  const entries = probabilities ? Object.entries(probabilities).sort((a,b)=> b[1]-a[1]).slice(0,16) : []
  
  const vectorEntries = stateVector && numQubits ? (() => {
    const items: Array<{state: string; amp: string; prob: number}> = []
    for (let i = 0; i < stateVector.length; i += 2) {
      const r = stateVector[i]
      const im = stateVector[i + 1] ?? 0
      const prob = r * r + im * im
      if (prob > 1e-6) {
        const state = (i / 2).toString(2).padStart(numQubits, '0')
        items.push({ state, amp: formatComplex(r, im), prob })
      }
    }
    return items.sort((a,b)=> b.prob - a.prob)
  })() : []
  
  return (
    <div className="rounded-lg p-4 bg-bg-card border border-theme-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-theme-text">State Viewer</h3>
        {(vectorEntries.length > 0 || entries.length > 0) && (
          <div className="flex gap-2">
            <button
              onClick={()=> setShowVector(false)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                !showVector 
                  ? 'bg-primary text-white' 
                  : 'text-theme-text-muted hover:text-theme-text hover:bg-theme-surface/50'
              }`}
            >
              Probabilities
            </button>
            {vectorEntries.length > 0 && (
              <button
                onClick={()=> setShowVector(true)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  showVector 
                    ? 'bg-primary text-white' 
                    : 'text-theme-text-muted hover:text-theme-text hover:bg-theme-surface/50'
                }`}
              >
                State Vector
              </button>
            )}
          </div>
        )}
      </div>
      <div className="mt-3 text-xs text-theme-text">
        {processing ? (
          <div className="flex items-center gap-2 text-primary">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            <span>Running...</span>
          </div>
        ) : showVector && vectorEntries.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
            {vectorEntries.map(({state, amp, prob})=> (
              <div key={state} className="flex items-center justify-between p-2 rounded bg-theme-surface/50 border border-theme-border">
                <div className="font-mono text-theme-text">|{state}⟩</div>
                <div className="text-theme-text-muted">{amp}</div>
                <div className="text-theme-text-muted">{(prob * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>
        ) : entries.length ? (
          <>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-theme-text-muted">Scale</span>
              <input type="range" min="0.5" max="2" step="0.1" value={escala} onChange={(e)=> setEscala(parseFloat(e.target.value))} />
              <span className="text-theme-text-muted">{escala.toFixed(1)}x</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {entries.map(([state,p])=> (
              <div key={state} className="flex flex-col items-center">
                <div className="w-8 h-16 bg-theme-surface/30 border border-theme-border rounded flex items-end">
                  <div className="w-full bg-primary/60" style={{height: `${Math.min(100, p*100*escala)}%`}} />
                </div>
                <div className="mt-1 text-[10px] text-theme-text-muted">|{state}⟩</div>
              </div>
            ))}
            </div>
          </>
        ) : 'Run to preview probabilities'}
      </div>
    </div>
  )
}


