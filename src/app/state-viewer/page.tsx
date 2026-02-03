import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faExchangeAlt, faDownload } from '@fortawesome/free-solid-svg-icons'
import { runSimulation } from '../circuits/services/simulator'
import { getPreset } from '../algorithms/services/presets'
import StateViewer from '../circuits/components/StateViewer'
import ProbabilityHistogram from './components/ProbabilityHistogram'
import PhaseDiagram from './components/PhaseDiagram'
import StateAnalysis from './components/StateAnalysis'
import AmplitudeTable from './components/AmplitudeTable'
import Button from '../../components/Button'
import Card from '../../components/Card'
import { downloadFile, probabilitiesToCSV } from '../../lib/exportUtils'
import list from '../algorithms/data/algorithms-list.json'

type Algorithm = {
  id: string
  name: string
}

export default function StateViewerPage() {
  const [probabilities, setProbabilities] = useState<Record<string, number> | undefined>(undefined)
  const [stateVector, setStateVector] = useState<number[] | undefined>(undefined)
  const [numQubits, setNumQubits] = useState(2)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('detailed')
  const [showExport, setShowExport] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  const algorithms = (list as Algorithm[]).slice(0, 9)

  useEffect(() => {
    if (!showExport) return
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setShowExport(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showExport])

  const loadFromStorage = () => {
    try {
      const raw = localStorage.getItem('quantum:circuit')
      if (raw) {
        const circuit = JSON.parse(raw)
        setNumQubits(circuit.numQubits)
        setSelectedAlgorithm(null)
      }
    } catch {}
  }

  useEffect(() => {
    loadFromStorage()
    const handler = () => loadFromStorage()
    window.addEventListener('storage', handler)
    window.addEventListener('quantum:set-circuit', () => loadFromStorage())
    return () => {
      window.removeEventListener('storage', handler)
      window.removeEventListener('quantum:set-circuit', () => loadFromStorage())
    }
  }, [])

  async function runAlgorithm(id: string) {
    setSelectedAlgorithm(id)
    setProcessing(true)
    try {
      const preset = getPreset(id)
      const result = await runSimulation(preset as any)
      setProbabilities(result.probabilities)
      setStateVector(result.stateVector)
      setNumQubits(preset.numQubits)
    } catch (err) {
      console.error(err)
      setProbabilities(undefined)
      setStateVector(undefined)
    } finally {
      setProcessing(false)
    }
  }

  async function runFromStorage() {
    setProcessing(true)
    try {
      const raw = localStorage.getItem('quantum:circuit')
      if (!raw) {
        setProcessing(false)
        return
      }
      const circuit = JSON.parse(raw)
      const result = await runSimulation(circuit)
      setProbabilities(result.probabilities)
      setStateVector(result.stateVector)
      setNumQubits(circuit.numQubits)
      setSelectedAlgorithm(null)
    } catch (err) {
      console.error(err)
      setProbabilities(undefined)
      setStateVector(undefined)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-theme-text">State Viewer</h2>
            <p className="text-xs text-theme-text-muted mt-1">
              Visualize amplitudes, phases, and probabilities for any circuit or algorithm. Use &quot;View Current Circuit&quot; to load from Studio.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={runFromStorage} disabled={processing}>
              {processing ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-1.5" />
                  Running...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faExchangeAlt} className="mr-1.5" />
                  View Current Circuit
                </>
              )}
            </Button>
            <button
              onClick={() => setViewMode(viewMode === 'compact' ? 'detailed' : 'compact')}
              className="px-3 py-2 text-xs bg-theme-input-bg border border-theme-border rounded hover:border-primary transition-colors flex items-center gap-1.5 text-theme-text"
            >
              <FontAwesomeIcon icon={faExchangeAlt} className="text-xs" />
              {viewMode === 'compact' ? 'Detailed' : 'Compact'}
            </button>
            {(probabilities || stateVector) && (
              <div className="relative" ref={exportRef}>
                <button
                  onClick={() => setShowExport(!showExport)}
                  className="px-3 py-2 text-xs bg-theme-input-bg border border-theme-border rounded hover:border-primary transition-colors flex items-center gap-1.5 text-theme-text"
                >
                  <FontAwesomeIcon icon={faDownload} className="text-xs" />
                  Export
                </button>
                {showExport && (
                  <div className="absolute right-0 top-full mt-1 z-10 bg-theme-surface border border-theme-border rounded-lg p-2 shadow-lg min-w-40">
                    {probabilities && Object.keys(probabilities).length > 0 && (
                      <>
                        <button onClick={() => { downloadFile(JSON.stringify(probabilities, null, 2), 'state-probabilities.json', 'application/json'); setShowExport(false) }} className="w-full text-left px-3 py-2 text-xs hover:bg-theme-border/50 rounded text-theme-text">Probabilities (JSON)</button>
                        <button onClick={() => { downloadFile(probabilitiesToCSV(probabilities), 'state-probabilities.csv', 'text/csv'); setShowExport(false) }} className="w-full text-left px-3 py-2 text-xs hover:bg-theme-border/50 rounded text-theme-text">Probabilities (CSV)</button>
                      </>
                    )}
                    {stateVector && stateVector.length > 0 && (
                      <button onClick={() => { downloadFile(JSON.stringify(stateVector), 'state-vector.json', 'application/json'); setShowExport(false) }} className="w-full text-left px-3 py-2 text-xs hover:bg-theme-border/50 rounded text-theme-text">State vector (JSON)</button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {viewMode === 'detailed' && probabilities && (
          <ProbabilityHistogram probabilities={probabilities} numQubits={numQubits} />
        )}

        {viewMode === 'compact' && (
          <StateViewer
            probabilities={probabilities}
            stateVector={stateVector}
            numQubits={numQubits}
            processing={processing}
          />
        )}

        {stateVector && stateVector.length > 0 && (
          <PhaseDiagram stateVector={stateVector} numQubits={numQubits} />
        )}

        {stateVector && stateVector.length > 0 && (
          <StateAnalysis 
            stateVector={stateVector} 
            probabilities={probabilities || {}} 
            numQubits={numQubits}
          />
        )}

        <Card title="Circuit Statistics">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-theme-text-muted">Qubits</div>
              <div className="text-2xl font-semibold text-theme-text">{numQubits}</div>
            </div>
            <div>
              <div className="text-theme-text-muted">States</div>
              <div className="text-2xl font-semibold text-theme-text">
                {probabilities ? Object.keys(probabilities).length : 0}
              </div>
            </div>
            <div>
              <div className="text-theme-text-muted">Max Probability</div>
              <div className="text-2xl font-semibold text-theme-text">
                {probabilities ? (Math.max(...Object.values(probabilities)) * 100).toFixed(1) : 0}%
              </div>
            </div>
            <div>
              <div className="text-theme-text-muted">Dimension</div>
              <div className="text-2xl font-semibold text-theme-text">
                {2 ** numQubits}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-4">
        <Card title="Quick Algorithms" description="Click to visualize states">
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
            {algorithms.map(a => (
              <button
                key={a.id}
                onClick={() => runAlgorithm(a.id)}
                className={`w-full text-left p-3 rounded transition-colors text-xs ${
                  selectedAlgorithm === a.id
                    ? 'bg-primary text-white'
                    : 'bg-theme-surface/50 border border-theme-border hover:border-primary text-theme-text'
                }`}
              >
                {a.name}
              </button>
            ))}
          </div>
        </Card>

        {stateVector && stateVector.length > 0 && (
          <AmplitudeTable stateVector={stateVector} numQubits={numQubits} />
        )}

        {stateVector && stateVector.length > 0 && (
          <Card title="State Vector Info">
            <div className="text-xs text-theme-text space-y-2">
              <div>
                <span className="text-theme-text-muted">Components:</span> {stateVector.length / 2}
              </div>
              <div>
                <span className="text-theme-text-muted">Format:</span> Real/Imaginary pairs
              </div>
              <div>
                <span className="text-theme-text-muted">Dimension:</span> {2 ** numQubits}D Hilbert space
              </div>
            </div>
          </Card>
        )}

        <Card title="About State Viewer">
          <div className="text-xs text-theme-text space-y-2">
            <p>
              Visualize quantum states, amplitudes, probabilities, and phases.
            </p>
            <p>
              <strong>Compact mode:</strong> Simple bars
              <br />
              <strong>Detailed mode:</strong> Full analysis
              <br />
              <strong>Phase diagram:</strong> Argand plot
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
