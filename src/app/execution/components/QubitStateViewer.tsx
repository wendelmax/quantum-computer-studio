import React from 'react'

type Props = {
  probabilities?: Record<string, number>
}

export default function QubitStateViewer({ probabilities }: Props) {
  if (!probabilities || Object.keys(probabilities).length === 0) {
    return (
      <div className="rounded-lg p-4 bg-bg-card border border-slate-800">
        <div className="text-sm text-slate-400">No state data available</div>
      </div>
    )
  }

  const sorted = Object.entries(probabilities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16)

  const total = Object.values(probabilities).reduce((a, b) => a + b, 0)

  return (
    <div className="rounded-lg p-4 bg-bg-card border border-slate-800">
      <div className="text-sm font-medium mb-3">Qubit States</div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
        {sorted.map(([state, prob]) => (
          <div key={state} className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-200">|{state}⟩</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-slate-900/50 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(prob / total) * 100}%` }} />
              </div>
              <span className="text-slate-400 w-12 text-right">{(prob * 100).toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
        Total states: {Object.keys(probabilities).length} | Normalized: {total.toFixed(3)}
      </div>
    </div>
  )
}
