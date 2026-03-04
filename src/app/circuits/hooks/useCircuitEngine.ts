import { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import type { Circuit, CircuitGate } from '../../../types/Circuit'
import type { Result } from '../../../types/Result'
import { setItem } from '../../../lib/safeStorage'
import { runSimulation, type SimulatorOptions } from '../services/simulator'
import { useQuantumStore } from '../../../store/quantumStore'

export type { Circuit }
export type Gate = CircuitGate
export type { Result as ExecutionResult }

const MAX_HISTORY = 50

const emptyCircuit = (n: number): Circuit => ({ numQubits: n, gates: [] })

export function useCircuitEngine(initialQubitCount: number = 2) {
  const setStoreCircuit = useQuantumStore(state => state.setCircuit)
  const [circuit, setCircuit] = useState<Circuit>(() => emptyCircuit(initialQubitCount))
  const [result, setResult] = useState<Result | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [historyIndex, setHistoryIndex] = useState(0)
  const historyRef = useRef<Circuit[]>([emptyCircuit(initialQubitCount)])
  const historyIndexRef = useRef(0)
  const isUndoRedoRef = useRef(false)

  const pushHistory = useCallback((next: Circuit) => {
    if (isUndoRedoRef.current) return
    const hist = historyRef.current
    let idx = historyIndexRef.current
    if (idx < hist.length - 1) hist.splice(idx + 1)
    hist.push(JSON.parse(JSON.stringify(next)))
    if (hist.length > MAX_HISTORY) hist.shift()
    historyIndexRef.current = hist.length - 1
    setHistoryIndex(historyIndexRef.current)
  }, [])

  const addGate = useCallback((type: string, target: number = 0, angle?: number, control?: number, control2?: number, target2?: number) => {
    setCircuit((prev) => {
      const next: Circuit = {
        ...prev,
        gates: [...prev.gates, { type, target, angle, control, control2, target2 }],
      }
      pushHistory(next)
      return next
    })
  }, [pushHistory])

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
      const next = { ...prev, gates }
      pushHistory(next)
      return next
    })
  }, [pushHistory])

  const replaceCircuit = useCallback((newCircuit: Circuit) => {
    isUndoRedoRef.current = false
    historyRef.current = [JSON.parse(JSON.stringify(newCircuit))]
    historyIndexRef.current = 0
    setHistoryIndex(0)
    setCircuit(newCircuit)
  }, [])

  const moveGate = useCallback((fromTarget: number, fromIdx: number, toTarget: number, toIdx: number) => {
    setCircuit((prev) => {
      const byLine: Record<number, CircuitGate[]> = {}
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
      const newGates: CircuitGate[] = []
      const lines = Array.from({ length: prev.numQubits }, (_, i) => i)
      for (const r of lines) {
        const l = byLine[r] || []
        for (const g of l) newGates.push(g)
      }
      const next = { ...prev, gates: newGates }
      pushHistory(next)
      return next
    })
  }, [pushHistory])

  const reset = useCallback(() => {
    const empty = emptyCircuit(circuit.numQubits)
    historyRef.current = [empty]
    historyIndexRef.current = 0
    setHistoryIndex(0)
    setCircuit(empty)
    setResult(null)
    setValidationError(null)
  }, [circuit.numQubits])

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return
    isUndoRedoRef.current = true
    historyIndexRef.current--
    setHistoryIndex(historyIndexRef.current)
    setCircuit(JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current])))
    setValidationError(null)
    setTimeout(() => { isUndoRedoRef.current = false }, 0)
  }, [])

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    isUndoRedoRef.current = true
    historyIndexRef.current++
    setHistoryIndex(historyIndexRef.current)
    setCircuit(JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current])))
    setValidationError(null)
    setTimeout(() => { isUndoRedoRef.current = false }, 0)
  }, [])

  const setInitialState = useCallback((qubit: number, state: '0' | '1') => {
    setCircuit((prev) => ({
      ...prev,
      initialStates: { ...(prev.initialStates || {}), [qubit]: state },
    }))
  }, [])

  const execute = useCallback(async (options?: SimulatorOptions) => {
    // Avoid re-validating heavily here if already synced, but we keep basic logic in Simulator.
    // validation is fast, though.
    setValidationError(null)
    setIsProcessing(true)
    try {
      const res = await runSimulation(circuit, options)
      setResult(res)
    } finally {
      setIsProcessing(false)
    }
  }, [circuit])

  const state = useMemo(() => ({ circuit, result, isProcessing }), [circuit, result, isProcessing])

  useEffect(() => {
    setStoreCircuit(circuit)
  }, [circuit, setStoreCircuit])

  useEffect(() => {
    setCircuit((prev) => {
      if (prev.numQubits === initialQubitCount) return prev
      const newNum = initialQubitCount
      const filteredGates = prev.gates.filter(g => g.target < newNum && (g.control == null || g.control < newNum) && (g.control2 == null || g.control2 < newNum) && (g.target2 == null || g.target2 < newNum))
      const next = { numQubits: newNum, gates: filteredGates }
      historyRef.current = [JSON.parse(JSON.stringify(next))]
      historyIndexRef.current = 0
      return next
    })
  }, [initialQubitCount])

  useEffect(() => {
    if (historyRef.current.length === 0) {
      historyRef.current = [JSON.parse(JSON.stringify(circuit))]
      historyIndexRef.current = 0
      setHistoryIndex(0)
    }
  }, [])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < Math.max(0, historyRef.current.length - 1)

  return {
    ...state,
    validationError,
    addGate,
    removeGateAt,
    moveGate,
    replaceCircuit,
    reset,
    execute,
    setInitialState,
    undo,
    redo,
    canUndo,
    canRedo,
  }
}


