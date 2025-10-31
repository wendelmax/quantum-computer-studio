import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'

type Props = {
  stateVector: number[]
  numQubits: number
}

function formatComplex(r: number, i: number): string {
  if (Math.abs(i) < 1e-6) return r.toFixed(4)
  if (Math.abs(r) < 1e-6) return `${i.toFixed(4)}i`
  return `${r.toFixed(4)}${i >= 0 ? '+' : ''}${i.toFixed(4)}i`
}

export default function AmplitudeTable({ stateVector, numQubits }: Props) {
  const [showAll, setShowAll] = useState(false)

  if (!stateVector || stateVector.length === 0) {
    return (
      <div className="p-4 bg-bg-card border border-slate-800 rounded">
        <div className="text-xs text-slate-400">No amplitudes to display</div>
      </div>
    )
  }

  const amplitudes: Array<{ state: string; r: number; i: number; amp: string; prob: number; phase: number }> = []
  
  for (let i = 0; i < stateVector.length; i += 2) {
    const r = stateVector[i]
    const i_imag = stateVector[i + 1] ?? 0
    const prob = r * r + i_imag * i_imag
    const phase = Math.atan2(i_imag, r)
    
    if (prob > 1e-6 || showAll) {
      const state = (i / 2).toString(2).padStart(numQubits, '0')
      amplitudes.push({ 
        state, 
        r, 
        i: i_imag, 
        amp: formatComplex(r, i_imag), 
        prob,
        phase
      })
    }
  }

  const displayAmps = showAll ? amplitudes : amplitudes.slice(0, 10)

  return (
    <div className="p-4 bg-bg-card border border-slate-800 rounded">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">Amplitude Table</h4>
        {amplitudes.length > 10 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs px-2 py-1 text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            <FontAwesomeIcon icon={showAll ? faChevronUp : faChevronDown} />
            <span>{showAll ? 'Show Less' : `Show All (${amplitudes.length})`}</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 px-2 text-slate-400">State</th>
              <th className="text-left py-2 px-2 text-slate-400">Amplitude</th>
              <th className="text-left py-2 px-2 text-slate-400">Probability</th>
              <th className="text-left py-2 px-2 text-slate-400">Phase</th>
            </tr>
          </thead>
          <tbody>
            {displayAmps.map((amp, idx) => (
              <tr key={idx} className="border-b border-slate-800/50">
                <td className="py-2 px-2 font-mono text-slate-200">|{amp.state}⟩</td>
                <td className="py-2 px-2 font-mono text-sky-400">{amp.amp}</td>
                <td className="py-2 px-2 text-slate-300">
                  {(amp.prob * 100).toFixed(2)}%
                </td>
                <td className="py-2 px-2 text-purple-400">
                  {amp.phase.toFixed(3)} rad
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!showAll && amplitudes.length > 10 && (
        <div className="mt-2 text-xs text-slate-500 text-center">
          Showing 10 of {amplitudes.length} states
        </div>
      )}
    </div>
  )
}

