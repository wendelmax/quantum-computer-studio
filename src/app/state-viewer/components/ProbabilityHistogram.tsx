import React from 'react'

type Props = {
  probabilities: Record<string, number>
  numQubits: number
}

export default function ProbabilityHistogram({ probabilities, numQubits }: Props) {
  if (Object.keys(probabilities).length === 0) {
    return (
      <div className="p-4 bg-bg-card border border-slate-800 rounded text-center text-slate-500">
        No data to display
      </div>
    )
  }

  const entries = Object.entries(probabilities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16)

  const maxProb = Math.max(...entries.map(([_, p]) => p))

  return (
    <div className="p-4 bg-bg-card border border-slate-800 rounded">
      <h4 className="text-sm font-medium mb-3">Probability Distribution</h4>
      
      <div className="grid grid-cols-4 gap-3">
        {entries.map(([state, prob]) => {
          const height = (prob / maxProb) * 100
          return (
            <div key={state} className="flex flex-col items-center">
              <div className="w-full h-32 bg-slate-900/20 border border-slate-800 rounded flex items-end p-1">
                <div 
                  className="w-full bg-gradient-to-t from-sky-600 to-cyan-400 rounded transition-all"
                  style={{ height: `${height}%` }}
                  title={`State |${state}⟩: ${(prob * 100).toFixed(2)}%`}
                />
              </div>
              <div className="mt-2 text-[10px] font-mono text-slate-400">|{state}⟩</div>
              <div className="text-[10px] text-sky-400 font-medium">{(prob * 100).toFixed(1)}%</div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Total states: {Object.keys(probabilities).length}</span>
          <span>Max: {maxProb.toFixed(3)}</span>
        </div>
      </div>
    </div>
  )
}

