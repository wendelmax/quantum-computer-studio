import React from 'react'
import { getPreset } from '../services/presets'
import type { Circuit } from '../../circuits/hooks/useCircuitEngine'

interface AlgorithmCircuitsProps {
  algorithmId: string
  selectedGate?: number
}

const AlgorithmCircuits = ({ algorithmId, selectedGate }: AlgorithmCircuitsProps) => {
  const circuit = getPreset(algorithmId)
  
  const gatesByQubit: Record<number, typeof circuit.gates> = {}
  
  for (const gate of circuit.gates) {
    if (!gatesByQubit[gate.target]) {
      gatesByQubit[gate.target] = []
    }
    gatesByQubit[gate.target].push(gate)
  }

  const gateSymbol = (type: string): string => {
    const symbols: Record<string, string> = {
      'H': 'H', 'X': 'X', 'Y': 'Y', 'Z': 'Z',
      'CNOT': '⊗', 'RX': 'Rx', 'RY': 'Ry', 'RZ': 'Rz'
    }
    return symbols[type] || '?'
  }

  return (
    <div className="p-4 rounded bg-bg-card border border-slate-800">
      <h4 className="text-sm font-medium mb-3">Circuit Visualization</h4>
      <div className="space-y-2">
        {Array.from({ length: circuit.numQubits }, (_, i) => i).map(qubit => (
          <div key={qubit} className="flex items-center gap-1 text-xs">
            <div className="w-16 flex-shrink-0">
              <span className="text-slate-400 font-mono">q[{qubit}]</span>
            </div>
            <div className="flex-1 h-8 flex items-center border-b border-slate-700">
              {gatesByQubit[qubit]?.map((gate, idx) => (
                <React.Fragment key={idx}>
                  <div className="relative">
                    <div className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center min-w-[40px]">
                      {gate.type === 'CNOT' ? (
                        <span className="text-xs">•</span>
                      ) : (
                        <span>{gateSymbol(gate.type)}</span>
                      )}
                    </div>
                    {gate.type === 'CNOT' && gate.control !== undefined && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-px h-8 bg-slate-700" />
                    )}
                  </div>
                  <div className="h-px w-4 bg-slate-700" />
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{circuit.gates.length} gates</span>
          <span>{circuit.numQubits} qubits</span>
        </div>
      </div>
    </div>
  )
}

export default AlgorithmCircuits

