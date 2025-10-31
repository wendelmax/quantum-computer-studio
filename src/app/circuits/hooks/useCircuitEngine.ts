import { useCallback, useMemo, useState, useEffect } from 'react'
import { runSimulation } from '../services/simulator'

export type Gate = {
  type: string
  target: number
  control?: number
  angle?: number
}

export type Circuit = {
  numQubits: number
  gates: Gate[]
  initialStates?: Record<number, '0' | '1'>
}

export type ExecutionResult = {
  probabilities: Record<string, number>
  stateVector?: number[]
}

export function useCircuitEngine(initialQubitCount: number = 2) {
  const [circuit, setCircuit] = useState<Circuit>({ numQubits: initialQubitCount, gates: [] })
  const [result, setResult] = useState<ExecutionResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const addGate = useCallback((type: string, target: number = 0, angle?: number, control?: number) => {
    setCircuit((prev) => ({
      ...prev,
      gates: [...prev.gates, { type, target, angle, control }],
    }))
  }, [])

  const removeGateAt = useCallback((target: number, lineIndex: number) => {
    setCircuit((prev) => {
      const gates = prev.gates.slice()
      let count = -1
      for (let i = 0; i < gates.length; i++) {
        if (gates[i].target === target) {
          count++
          if (count === lineIndex) {
            gates.splice(i, 1)
            break
          }
        }
      }
      return { ...prev, gates }
    })
  }, [])

  const replaceCircuit = useCallback((newCircuit: Circuit) => {
    setCircuit(newCircuit)
  }, [])

  const moveGate = useCallback((fromTarget: number, fromIdx: number, toTarget: number, toIdx: number) => {
    setCircuit((prev) => {
      const byLine: Record<number, Gate[]> = {}
      for (const g of prev.gates) {
        if (!byLine[g.target]) byLine[g.target] = []
        byLine[g.target].push(g)
      }
      const origLine = byLine[fromTarget] || []
      const item = origLine[fromIdx]
      if (!item) return prev
      origLine.splice(fromIdx, 1)
      byLine[fromTarget] = origLine
      const destLine = byLine[toTarget] || []
      destLine.splice(Math.min(toIdx, destLine.length), 0, { ...item, target: toTarget })
      byLine[toTarget] = destLine
      const newGates: Gate[] = []
      const lines = Array.from({ length: prev.numQubits }, (_, i) => i)
      for (const r of lines) {
        const l = byLine[r] || []
        for (const g of l) newGates.push(g)
      }
      return { ...prev, gates: newGates }
    })
  }, [])

  const reset = useCallback(() => {
    setCircuit((prev) => ({ ...prev, gates: [] }))
    setResult(null)
  }, [])

  const setInitialState = useCallback((qubit: number, state: '0' | '1') => {
    setCircuit((prev) => ({
      ...prev,
      initialStates: { ...(prev.initialStates || {}), [qubit]: state },
    }))
  }, [])

  const execute = useCallback(async () => {
    setIsProcessing(true)
    try {
      const res = await runSimulation(circuit)
      setResult(res)
    } finally {
      setIsProcessing(false)
    }
  }, [circuit])

  const state = useMemo(() => ({ circuit, result, isProcessing }), [circuit, result, isProcessing])

  useEffect(() => {
    try { localStorage.setItem('quantum:circuit', JSON.stringify(circuit)) } catch {}
  }, [circuit])

  useEffect(() => {
    setCircuit((prev) => {
      if (prev.numQubits === initialQubitCount) return prev
      const newNum = initialQubitCount
      const filteredGates = prev.gates.filter(g => g.target < newNum && (g.control == null || g.control < newNum))
      return { numQubits: newNum, gates: filteredGates }
    })
  }, [initialQubitCount])

  return {
    ...state,
    addGate,
    removeGateAt,
    moveGate,
    replaceCircuit,
    reset,
    execute,
    setInitialState,
  }
}


