import React from 'react'

type Props = {
  stateVector: number[]
  numQubits: number
}

export default function PhaseDiagram({ stateVector, numQubits }: Props) {
  if (!stateVector || stateVector.length === 0) {
    return (
      <div className="p-4 bg-bg-card border border-slate-800 rounded text-center text-slate-500">
        No state vector to display
      </div>
    )
  }

  const size = 120
  const center = size / 2
  const radius = 40

  const amplitudes: Array<{ r: number; i: number; prob: number }> = []
  for (let i = 0; i < stateVector.length; i += 2) {
    const r = stateVector[i]
    const i_imag = stateVector[i + 1] ?? 0
    const prob = r * r + i_imag * i_imag
    if (prob > 1e-6) {
      amplitudes.push({ r, i: i_imag, prob })
    }
  }

  const maxProb = Math.max(...amplitudes.map(a => a.prob))

  return (
    <div className="p-4 bg-bg-card border border-slate-800 rounded">
      <h4 className="text-sm font-medium mb-3">Phase Diagram (Argand)</h4>
      
      <div className="flex items-center justify-center">
        <svg width={size} height={size} className="border border-slate-800 rounded">
          {/* Axes */}
          <line x1={0} y1={center} x2={size} y2={center} stroke="#334155" strokeWidth="1" />
          <line x1={center} y1={0} x2={center} y2={size} stroke="#334155" strokeWidth="1" />
          
          {/* Circle */}
          <circle cx={center} cy={center} r={radius} stroke="#334155" strokeWidth="1" fill="none" />
          
          {/* Labels */}
          <text x={size - 5} y={center + 4} fill="#64748b" fontSize="8" textAnchor="end">Real</text>
          <text x={center + 3} y={10} fill="#64748b" fontSize="8">Imag</text>
          <text x={center - 5} y={center - 3} fill="#475569" fontSize="8" textAnchor="end">0</text>
          
          {/* Vectors */}
          {amplitudes.map((amp, idx) => {
            const mag = Math.sqrt(amp.r * amp.r + amp.i * amp.i)
            const angle = Math.atan2(amp.i, amp.r)
            
            const x = center + (mag / maxProb) * radius * Math.cos(angle)
            const y = center - (mag / maxProb) * radius * Math.sin(angle)
            
            const prob = amp.prob / maxProb
            const opacity = Math.max(0.3, prob)
            
            return (
              <g key={idx}>
                <line 
                  x1={center} 
                  y1={center} 
                  x2={x} 
                  y2={y} 
                  stroke="#06b6d4" 
                  strokeWidth="2" 
                  opacity={opacity}
                />
                <circle 
                  cx={x} 
                  cy={y} 
                  r="3" 
                  fill="#22d3ee" 
                  opacity={opacity}
                />
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800">
        <div className="text-xs text-slate-400">
          Showing {amplitudes.length} of {stateVector.length / 2} amplitudes
        </div>
      </div>
    </div>
  )
}

