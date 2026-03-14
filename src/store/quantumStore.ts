import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Circuit, Result } from 'quantum-computer-js'

export const MAX_QUBITS_LOCAL = 16
export const MAX_CIRCUIT_DEPTH = 100

interface QuantumState {
    circuit: Circuit | null
    topology: 'all-to-all' | 'linear' | 'ring' | 'grid'
    noiseProfile: { gateError: number; readoutError: number }
    executionResult: Result | null
    autoRun: boolean

    // Actions
    setCircuit: (circuit: Circuit, autoRun?: boolean) => void
    setExecutionResult: (result: Result | null) => void
    setTopology: (topology: 'all-to-all' | 'linear' | 'ring' | 'grid') => void
    setNoiseProfile: (noise: { gateError: number; readoutError: number }) => void
    clearCircuit: () => void
}

export const useQuantumStore = create<QuantumState>()(
    persist(
        (set) => ({
            circuit: null,
            topology: 'all-to-all',
            noiseProfile: { gateError: 0, readoutError: 0 },
            executionResult: null,
            autoRun: false,

            setCircuit: (circuit, autoRun = false) => set({ circuit, autoRun }),
            setExecutionResult: (executionResult) => set({ executionResult }),
            setTopology: (topology) => set({ topology }),
            setNoiseProfile: (noiseProfile) => set({ noiseProfile }),
            clearCircuit: () => set({ circuit: null, executionResult: null, autoRun: false, topology: 'all-to-all', noiseProfile: { gateError: 0, readoutError: 0 } }),
        }),
        {
            name: 'quantum-storage', // name of the item in the storage (must be unique)
        }
    )
)
