import React from 'react'

export default function Loader() {
  return (
    <div className="inline-flex items-center gap-2 text-theme-text">
      <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
      <span>Loading…</span>
    </div>
  )
}


