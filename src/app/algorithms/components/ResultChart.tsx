import React from 'react'

export default function ResultChart({ data }: { data?: Record<string, number> }) {
  const entries = data ? Object.entries(data).sort((a,b)=> b[1]-a[1]).slice(0,16) : []
  return (
    <div className="p-4 rounded bg-bg-card border border-theme-border">
      <div className="text-sm text-theme-text">Results</div>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 min-h-[120px]">
        {entries.length ? entries.map(([state,p]) => (
          <div key={state} className="flex flex-col items-center">
            <div className="w-8 h-16 bg-theme-surface/30 border border-theme-border rounded flex items-end">
              <div className="w-full bg-primary/60" style={{height: `${Math.min(100, p*100)}%`}} />
            </div>
            <div className="mt-1 text-[10px] text-theme-text-muted">{state}</div>
          </div>
        )) : <div className="text-xs text-theme-text-muted col-span-2 sm:col-span-4">Click a card to run preview</div>}
      </div>
    </div>
  )
}
