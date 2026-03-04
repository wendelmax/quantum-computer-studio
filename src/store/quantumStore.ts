import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Circuit } from 'quantum-computer-js'

interface QuantumState {
    circuit: Circuit | null
    autoRun: boolean

    // Actions
    setCircuit: (circuit: Circuit, autoRun?: boolean) => void
    clearCircuit: () => void
}

export const useQuantumStore = create<QuantumState>()(
    persist(
        (set) => ({
            circuit: null,
            autoRun: false,

            setCircuit: (circuit, autoRun = false) => set({ circuit, autoRun }),
            clearCircuit: () => set({ circuit: null, autoRun: false }),
        }),
        {
            name: 'quantum-storage', // name of the item in the storage (must be unique)
        }
    )
)
