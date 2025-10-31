import React from 'react'
import type { Circuit } from '../../circuits/hooks/useCircuitEngine'

interface OracleCircuitProps {
  circuit: Circuit
}

const OracleCircuit = ({ circuit }: OracleCircuitProps) => {
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

  const getGateColor = (type: string): string => {
    if (['X', 'Y', 'Z'].includes(type)) return 'bg-blue-900 border-blue-700'
    if (type === 'H') return 'bg-green-900 border-green-700'
    if (type === 'CNOT') return 'bg-purple-900 border-purple-700'
    if (type.startsWith('R')) return 'bg-orange-900 border-orange-700'
    return 'bg-slate-800 border-slate-700'
  }

  return (
    <div className="p-4 rounded bg-bg-card border border-slate-800">
      <h4 className="text-sm font-medium mb-3">Circuit Diagram</h4>
      <div className="space-y-3">
        {Array.from({ length: circuit.numQubits }, (_, i) => i).map(qubit => (
          <div key={qubit} className="flex items-center gap-2 text-xs">
            <div className="w-16 flex-shrink-0">
              <span className="text-slate-400 font-mono">q[{qubit}]</span>
            </div>
            <div className="flex-1 h-10 flex items-center border-b border-slate-700 relative">
              {gatesByQubit[qubit]?.map((gate, idx) => (
                <React.Fragment key={idx}>
                  <div className="relative">
                    <div className={`px-3 py-2 border rounded text-center min-w-[50px] ${getGateColor(gate.type)}`}>
                      {gate.type === 'CNOT' ? (
                        <span className="text-lg">•</span>
                      ) : (
                        <span className="font-mono">{gateSymbol(gate.type)}</span>
                      )}
                    </div>
                    {gate.type === 'CNOT' && gate.control !== undefined && (
                      <>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-0.5 h-6 bg-purple-600" />
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-purple-600" />
                      </>
                    )}
                  </div>
                  {idx < (gatesByQubit[qubit]?.length || 0) - 1 && (
                    <div className="h-px w-6 bg-slate-700" />
                  )}
                </React.Fragment>
              ))}
              {!gatesByQubit[qubit] && (
                <div className="text-slate-600 text-[10px] px-2">No gates</div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{circuit.gates.length} gates</span>
          <span>{circuit.numQubits} qubits</span>
        </div>
      </div>
    </div>
  )
}

export default OracleCircuit

