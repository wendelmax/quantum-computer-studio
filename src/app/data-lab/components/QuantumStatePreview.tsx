import React from 'react'

type Props = {
  data: number[][]
  numQubits: number
  mappingMode: 'amplitude' | 'angle'
}

export default function QuantumStatePreview({ data, numQubits, mappingMode }: Props) {
  if (data.length === 0) {
    return (
      <div className="p-4 bg-bg-card border border-theme-border rounded">
        <div className="text-xs text-theme-text-muted">No data to map</div>
      </div>
    )
  }

  const numStates = Math.min(data.length, 2 ** numQubits)
  const maxAmplitude = Math.max(...data.flat().map(v => Math.abs(v)), 1)

  const states = Array.from({ length: numStates }, (_, i) => {
    const index = i.toString(2).padStart(numQubits, '0')
    const amplitude = Math.sqrt(data[i]?.[0] || 0) / Math.sqrt(maxAmplitude)
    const probability = amplitude ** 2
    return { index, amplitude, probability, angle: (data[i]?.[0] || 0) * Math.PI }
  })

  return (
    <div className="p-4 bg-bg-card border border-theme-border rounded">
      <h4 className="text-sm font-medium mb-3 text-theme-text">
        Quantum State Mapping ({mappingMode === 'amplitude' ? 'Amplitude' : 'Angle'} Encoding)
      </h4>
      
      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
        {states.map((state, i) => (
          <div key={i} className="border-b border-theme-border pb-2 last:border-0">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono text-theme-text">|{state.index}⟩</span>
              {mappingMode === 'amplitude' ? (
                <span className="text-primary">{state.probability.toFixed(4)}</span>
              ) : (
                <span className="text-purple-400">{state.angle.toFixed(3)} rad</span>
              )}
            </div>
            {mappingMode === 'amplitude' && (
              <div className="h-2 bg-theme-surface rounded overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent" 
                  style={{ width: `${state.probability * 100}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-theme-border">
        <div className="text-xs text-theme-text-muted">
          {mappingMode === 'amplitude' 
            ? 'Values → Quantum amplitudes → Probabilities' 
            : 'Values → Rotation angles → Quantum gates'}
        </div>
      </div>
    </div>
  )
}

