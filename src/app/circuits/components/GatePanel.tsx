import React, { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { useCircuitPrefs } from '../../../app/CircuitPrefs'
import Button from '../../../components/Button'

const GATES = ['H','X','Y','Z','CNOT','RX','RY','RZ']

type Props = {
  numQubits: number
  onAdd: (gate: string, target: number, angle?: number, control?: number) => void
  onSelect?: (gate: string) => void
  initialStates?: Record<number, '0' | '1'>
  onSetInitialState?: (qubit: number, state: '0' | '1') => void
}

export default function GatePanel({ numQubits, onAdd, onSelect, initialStates, onSetInitialState }: Props) {
  const prefs = useCircuitPrefs()
  const [selected, setSelected] = useState<string>('H')
  const [target, setTarget] = useState<number>(0)
  const [angle, setAngle] = useState<number>(0)
  const [control, setControl] = useState<number>(0)
  const requiresAngle = useMemo(() => ['RX','RY','RZ'].includes(selected), [selected])
  const requiresControl = selected === 'CNOT'

  return (
    <div className="rounded-lg p-4 bg-[#021825] border border-slate-800">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium">Gates</h3>
        <label className="text-xs text-slate-300 flex items-center gap-2">
          Qubits
          <select value={prefs.numQubits} onChange={(e)=> prefs.setNumQubits(parseInt(e.target.value))} className="bg-bg border border-slate-700 rounded px-2 py-1">
            {Array.from({length:16},(_,i)=> i+1).map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {GATES.map(g => (
          <Button key={g} variant={selected===g? 'primary':'secondary'} onClick={()=> { setSelected(g); onSelect?.(g) }}>{g}</Button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-slate-300">Target qubit</span>
          <select value={target} onChange={(e)=> setTarget(parseInt(e.target.value))} className="bg-bg border border-slate-700 rounded px-2 py-1">
            {Array.from({length:numQubits},(_,i)=> i).map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </label>
        {requiresControl ? (
          <label className="flex flex-col gap-1">
            <span className="text-slate-300">Control qubit</span>
            <select value={control} onChange={(e)=> setControl(parseInt(e.target.value))} className="bg-bg border border-slate-700 rounded px-2 py-1">
              {Array.from({length:numQubits},(_,i)=> i).filter(i => i !== target).map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </label>
        ) : <div />}
        {requiresAngle ? (
          <label className="flex flex-col gap-1">
            <span className="text-slate-300">Angle (rad)</span>
            <input 
              type="range" 
              min="-3.14" 
              max="3.14" 
              step="0.01" 
              value={angle} 
              onChange={(e)=> setAngle(parseFloat(e.target.value))} 
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <span className="text-xs text-slate-400">{angle.toFixed(2)}</span>
          </label>
        ) : <div />}
      </div>
      <div className="mt-3">
        <Button onClick={()=> onAdd(selected, target, requiresAngle ? angle : undefined, requiresControl ? control : undefined)}>
          <FontAwesomeIcon icon={faPlus} className="mr-1.5" />
          Add
        </Button>
      </div>
      {onSetInitialState && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <h4 className="text-xs text-slate-300 mb-2">Initial States</h4>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({length:numQubits},(_,i)=> i).map(q => (
              <label key={q} className="flex flex-col gap-1 text-xs">
                <span className="text-slate-400">q{q}</span>
                <select
                  value={initialStates?.[q] || '0'}
                  onChange={(e)=> onSetInitialState(q, e.target.value as '0' | '1')}
                  className="bg-bg border border-slate-700 rounded px-2 py-1"
                >
                  <option value="0">|0⟩</option>
                  <option value="1">|1⟩</option>
                </select>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


