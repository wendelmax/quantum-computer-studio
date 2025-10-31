import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'

interface StateAnalysisProps {
  stateVector: number[]
  probabilities: Record<string, number>
  numQubits: number
}

// TODO: Consider adding state comparison features
const StateAnalysis = ({ stateVector, probabilities, numQubits }: StateAnalysisProps) => {
  if (!stateVector || stateVector.length === 0) {
    return (
      <div className="p-4 bg-bg-card border border-slate-800 rounded">
        <div className="text-xs text-slate-400">No state to analyze</div>
      </div>
    )
  }

  const amplitudes: Array<{ r: number; i: number; prob: number }> = []
  let sumSquared = 0
  for (let i = 0; i < stateVector.length; i += 2) {
    const r = stateVector[i]
    const i_imag = stateVector[i + 1] ?? 0
    const prob = r * r + i_imag * i_imag
    sumSquared += prob
    amplitudes.push({ r, i: i_imag, prob })
  }

  const pureStates = amplitudes.filter(a => a.prob > 0.99)
  const mixedStates = amplitudes.filter(a => a.prob > 1e-6 && a.prob <= 0.99)
  const superposition = amplitudes.filter(a => a.prob > 1e-6).length > 1

  const maxProb = Math.max(...amplitudes.map(a => a.prob))
  const minProb = Math.min(...amplitudes.filter(a => a.prob > 1e-6).map(a => a.prob))
  const entropy = -amplitudes.reduce((acc, a) => {
    if (a.prob > 1e-10) return acc + a.prob * Math.log2(a.prob)
    return acc
  }, 0)

  const isNormalized = Math.abs(sumSquared - 1) < 0.01
  
  const maxEntropy = numQubits
  const relativeEntropy = maxEntropy > 0 ? (entropy / maxEntropy) : 0
  
  const avgProb = amplitudes.reduce((sum, a) => sum + a.prob, 0) / amplitudes.length
  const probSpread = Math.sqrt(
    amplitudes.reduce((sum, a) => sum + Math.pow(a.prob - avgProb, 2), 0) / amplitudes.length
  )
  
  const zeroStates = amplitudes.filter(a => a.prob < 1e-10).length
  const activeStates = amplitudes.length - zeroStates
  
  const isMaximallyEntangled = Math.abs(entropy - maxEntropy) < 0.01
  const isProductState = activeStates === 1 && pureStates.length === 1

  return (
    <div className="p-4 bg-bg-card border border-slate-800 rounded">
      <h4 className="text-sm font-medium mb-3">State Analysis</h4>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400">Normalized:</span>
            <span className={`ml-2 ${isNormalized ? 'text-green-400' : 'text-red-400'} flex items-center gap-1`}>
              <FontAwesomeIcon icon={isNormalized ? faCheck : faTimes} className="text-xs" />
              {isNormalized ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Sum:</span>
            <span className="ml-2 font-mono text-slate-200">{sumSquared.toFixed(4)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Superposition:</span>
            <span className={superposition ? 'text-cyan-400' : 'text-slate-500'}>
              {superposition ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Active states:</span>
            <span className="text-green-400">{activeStates} / {amplitudes.length}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Zero states:</span>
            <span className="text-slate-500">{zeroStates}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Max prob:</span>
            <span className="text-sky-400 font-mono">{maxProb.toFixed(4)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Min prob:</span>
            <span className="text-slate-300 font-mono">{minProb.toFixed(4)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Avg prob:</span>
            <span className="text-slate-300 font-mono">{avgProb.toFixed(4)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Spread:</span>
            <span className="text-slate-300 font-mono">{probSpread.toFixed(4)}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Entropy:</span>
            <span className="text-purple-400 font-mono">{entropy.toFixed(4)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Max entropy:</span>
            <span className="text-purple-400/60 font-mono">{maxEntropy.toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Relative:</span>
            <span className="text-purple-400/60 font-mono">{(relativeEntropy * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800">
          <div className="space-y-1 text-xs">
            {isMaximallyEntangled && (
              <div className="text-cyan-400 font-medium">
                Maximally entangled state
              </div>
            )}
            {isProductState && !superposition && (
              <div className="text-green-400 font-medium">
                Pure product state
              </div>
            )}
            {superposition && !isMaximallyEntangled && !isProductState && (
              <div className="text-yellow-400 font-medium">
                Partial superposition
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StateAnalysis

