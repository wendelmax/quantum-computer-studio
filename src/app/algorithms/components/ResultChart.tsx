import React from 'react'

export default function ResultChart({ data }: { data?: Record<string, number> }) {
  const entries = data ? Object.entries(data).sort((a,b)=> b[1]-a[1]).slice(0,16) : []
  return (
    <div className="p-4 rounded bg-bg-card border border-slate-800">
      <div className="text-sm text-slate-300">Results</div>
      <div className="mt-3 grid grid-cols-4 gap-2 min-h-[120px]">
        {entries.length ? entries.map(([state,p]) => (
          <div key={state} className="flex flex-col items-center">
            <div className="w-8 h-16 bg-slate-900/20 border border-slate-800 rounded flex items-end">
              <div className="w-full bg-sky-500/60" style={{height: `${Math.min(100, p*100)}%`}} />
            </div>
            <div className="mt-1 text-[10px] text-slate-400">{state}</div>
          </div>
        )) : <div className="text-xs text-slate-400 col-span-4">Click a card to run preview</div>}
      </div>
    </div>
  )
}
