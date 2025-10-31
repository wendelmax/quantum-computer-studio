import React from 'react'

type Props = {
  numQubits: number
  mappingMode: 'amplitude' | 'angle'
  onNumQubitsChange: (value: number) => void
  onMappingModeChange: (value: 'amplitude' | 'angle') => void
}

export default function QuantumMappingPanel({ numQubits, mappingMode, onNumQubitsChange, onMappingModeChange }: Props) {
  return (
    <div className="rounded-lg p-4 bg-bg-card border border-slate-800">
      <div className="text-sm font-medium mb-3">Quantum Mapping</div>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-300">Number of Qubits</label>
          <select 
            value={numQubits} 
            onChange={(e) => onNumQubitsChange(parseInt(e.target.value))}
            className="w-full mt-1 bg-bg border border-slate-700 rounded px-2 py-1 text-sm"
          >
            {[1,2,3,4,5,6].map(n => (
              <option key={n} value={n}>{n} qubit{n > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-300">Mapping Mode</label>
          <div className="mt-1 space-y-1">
            <label className="flex items-center">
              <input 
                type="radio" 
                value="amplitude" 
                checked={mappingMode === 'amplitude'}
                onChange={(e) => onMappingModeChange(e.target.value as 'amplitude' | 'angle')}
                className="mr-2"
              />
              <span className="text-xs text-slate-300">Amplitude Encoding</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                value="angle" 
                checked={mappingMode === 'angle'}
                onChange={(e) => onMappingModeChange(e.target.value as 'amplitude' | 'angle')}
                className="mr-2"
              />
              <span className="text-xs text-slate-300">Angle Encoding</span>
            </label>
          </div>
        </div>

        <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
          {mappingMode === 'amplitude' 
            ? 'Data values become amplitudes of superposition states'
            : 'Data values become rotation angles for quantum gates'}
        </div>
      </div>
    </div>
  )
}
