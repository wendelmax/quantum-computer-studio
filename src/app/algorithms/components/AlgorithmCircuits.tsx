import React from 'react'
import { getPreset } from '../services/presets'
import type { Circuit, CircuitGate } from 'quantum-computer-js'
import Card from '../../../components/Card'
import { useTranslation } from 'react-i18next'

interface AlgorithmCircuitsProps {
  algorithmId: string
  selectedGate?: number
}

const AlgorithmCircuits = ({ algorithmId, selectedGate }: AlgorithmCircuitsProps) => {
  const { t } = useTranslation()
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
      'CNOT': '⊕', 'RX': 'Rx', 'RY': 'Ry', 'RZ': 'Rz'
    }
    return symbols[type] || type
  }

  return (
    <Card className="p-5">
      <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 text-theme-text-muted flex items-center gap-2">
         <span className="w-1.5 h-1.5 rounded-full bg-accent" />
         {t('studio.view_visual')}
      </h4>
      <div className="space-y-4 overflow-x-auto pb-2 scrollbar-none">
        {Array.from({ length: circuit.numQubits }, (_, i) => i).map(qubit => (
          <div key={qubit} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-theme-border/10 border border-theme-border/30 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-black text-theme-text-muted font-mono tracking-tighter">Q{qubit}</span>
            </div>
            <div className="flex-1 h-10 flex items-center relative">
              <div className="absolute left-0 right-0 h-px bg-theme-border/50 z-0" />
              <div className="relative z-10 flex items-center gap-4 px-2">
                {gatesByQubit[qubit]?.map((gate: CircuitGate, idx: number) => (
                  <div key={idx} className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-theme-surface border border-primary/20 flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                      {gate.type === 'CNOT' ? (
                        <div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center">
                           <div className="w-px h-2 bg-primary absolute" />
                           <div className="h-px w-2 bg-primary absolute" />
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-theme-text">{gateSymbol(gate.type)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-5 border-t border-theme-border/50 flex items-center justify-between">
          <div className="flex gap-4">
              <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase text-theme-text-muted opacity-50">{t('studio.gates')}</span>
                  <span className="text-[10px] font-black text-primary">{circuit.gates.length}</span>
              </div>
              <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase text-theme-text-muted opacity-50">{t('studio.qubits')}</span>
                  <span className="text-[10px] font-black text-theme-text">{circuit.numQubits}</span>
              </div>
          </div>
          <span className="text-[9px] font-bold text-theme-text-muted italic opacity-40">Preview Mode</span>
      </div>
    </Card>
  )
}

export default AlgorithmCircuits
