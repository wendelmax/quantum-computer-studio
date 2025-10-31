import React from 'react'

export default function Loader() {
  return (
    <div className="inline-flex items-center gap-2 text-slate-300">
      <span className="w-3 h-3 rounded-full bg-sky-500 animate-pulse" />
      <span>Loading…</span>
    </div>
  )
}


