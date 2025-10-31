import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartBar, faBolt } from '@fortawesome/free-solid-svg-icons'
import CircuitCanvas from './components/CircuitCanvas'
import GatePanel from './components/GatePanel'
import { getPreset } from '../algorithms/services/presets'
import AlgorithmsInline from './components/AlgorithmsInline'
import StateViewer from './components/StateViewer'
import CircuitControls from './components/CircuitControls'
import QubitTimeline from './components/QubitTimeline'
import { useCircuitEngine } from './hooks/useCircuitEngine'
import { useCircuitPrefs } from '../CircuitPrefs'
import Card from '../../components/Card'

export default function CircuitsPage() {
  const { numQubits } = useCircuitPrefs()
  const engine = useCircuitEngine(numQubits)
  const [selectedGate, setSelectedGate] = React.useState<string | undefined>(undefined)
  React.useEffect(() => {
    const loadCircuit = async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
      try {
        const raw = localStorage.getItem('quantum:loadCircuit')
        if (raw) {
          const parsed = JSON.parse(raw)
            engine.replaceCircuit(parsed)
          localStorage.removeItem('quantum:loadCircuit')
          const ar = localStorage.getItem('quantum:autoRun')
          if (ar === '1') {
            engine.execute()
            localStorage.removeItem('quantum:autoRun')
          }
        }
      } catch {}
    }
    loadCircuit()
  }, [])

  React.useEffect(() => {
    let isMounted = true
    const handler = (e: any) => {
      const detail = e?.detail
      if (detail?.circuit && isMounted) {
        engine.replaceCircuit(detail.circuit)
        if (detail.autoRun) engine.execute()
      }
    }
    window.addEventListener('quantum:set-circuit' as any, handler)
    return () => {
      isMounted = false
      window.removeEventListener('quantum:set-circuit' as any, handler)
    }
  }, [])
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Quantum Studio</h2>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <span className="font-mono">{engine.circuit.gates.length}</span>
            <span>gates</span>
          </div>
          <div className="w-px h-4 bg-slate-700" />
          <div className="flex items-center gap-1">
            <span className="font-mono">{numQubits}</span>
            <span>qubits</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8 flex flex-col gap-4">
          <CircuitCanvas circuit={engine.circuit} selectedGate={selectedGate} onPlace={(g, target)=> engine.addGate(g, target)} onRemove={(target, idx)=> engine.removeGateAt(target, idx)} onMove={(fromTarget, fromIdx, toTarget, toIdx)=> engine.moveGate(fromTarget, fromIdx, toTarget, toIdx)} />
          <QubitTimeline circuit={engine.circuit} />
          {engine.result?.probabilities && Object.keys(engine.result.probabilities).length > 0 && (
            <Card title="Results" description="Probabilities distribution">
              <div className="grid grid-cols-4 gap-3 mt-3">
                {Object.entries(engine.result.probabilities)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([state, prob]) => (
                    <div key={state} className="flex flex-col items-center p-2 rounded bg-slate-900/30 border border-slate-800">
                      <div className="text-xs font-mono text-slate-300">|{state}⟩</div>
                      <div className="mt-1 w-12 h-16 bg-slate-900/50 rounded overflow-hidden flex items-end">
                        <div 
                          className="w-full bg-gradient-to-t from-sky-600 to-sky-400 transition-all" 
                          style={{ height: `${prob * 100}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-sky-400 font-semibold">{(prob * 100).toFixed(1)}%</div>
                    </div>
                  ))}
              </div>
            </Card>
          )}
          <StateViewer
            probabilities={engine.result?.probabilities}
            processing={engine.isProcessing}
            stateVector={engine.result?.stateVector}
            numQubits={numQubits}
          />
        </div>
        <div className="col-span-4 flex flex-col gap-4">
          <GatePanel
            numQubits={numQubits}
            onAdd={(g, target, angle, control)=> engine.addGate(g, target, angle, control)}
            onSelect={(g)=> setSelectedGate(g)}
            initialStates={engine.circuit.initialStates}
            onSetInitialState={engine.setInitialState}
          />
          <AlgorithmsInline onLoadAlgorithm={(id, autoRun)=> {
            const preset = getPreset(id)
            engine.replaceCircuit(preset)
            try {
              localStorage.setItem('quantum:circuit', JSON.stringify(preset))
              localStorage.setItem('quantum:prefs:numQubits', String(preset.numQubits))
            } catch {}
            if (autoRun) engine.execute()
          }} />
          <CircuitControls onRun={engine.execute} onReset={engine.reset} circuitJSON={JSON.stringify(engine.circuit)} onImport={(txt)=> {
            try { const parsed = JSON.parse(txt); engine.replaceCircuit(parsed) } catch {}
          }} />
        </div>
      </div>
    </div>
  )
}
