import React, { createContext, useContext, useMemo, useState } from 'react'

type CircuitPrefs = {
  numQubits: number
  setNumQubits: (n: number) => void
  depth: number
  setDepth: (n: number) => void
  shots: number
  setShots: (n: number) => void
}

const Ctx = createContext<CircuitPrefs | undefined>(undefined)

export function CircuitPrefsProvider({ children }: { children: React.ReactNode }) {
  const [numQubits, setNumQubits] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('quantum:prefs:numQubits')
      if (saved) return Math.min(16, Math.max(1, parseInt(saved)))
    } catch {}
    return 5
  })
  const [depth, setDepth] = useState<number>(12)
  const [shots, setShots] = useState<number>(1024)

  const value = useMemo(() => ({
    numQubits,
    setNumQubits: (n: number) => {
      const clamped = Math.min(16, Math.max(1, n))
      try { localStorage.setItem('quantum:prefs:numQubits', String(clamped)) } catch {}
      setNumQubits(clamped)
    },
    depth,
    setDepth,
    shots,
    setShots,
  }), [numQubits, depth, shots])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCircuitPrefs(): CircuitPrefs {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCircuitPrefs must be used within CircuitPrefsProvider')
  return ctx
}



