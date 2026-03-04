import { runSimulation } from '../../circuits/services/simulator'
import { getPreset } from './presets'
import type { Circuit } from 'quantum-computer-js'

export async function runAlgorithm(id: string, params?: Record<string, unknown>) {
  try {
    const preset = getPreset(id)
    if (!preset) throw new Error("Algorithm not found")

    const startTime = performance.now()
    const result = await runSimulation(preset as Circuit)
    const endTime = performance.now()

    return {
      id,
      ok: true,
      result,
      executionTime: endTime - startTime
    }
  } catch (error) {
    console.error('Algorithm execution failed:', error)
    return { id, ok: false, error: (error as Error).message }
  }
}


