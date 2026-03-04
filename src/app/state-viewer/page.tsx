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
import { useTranslation } from 'react-i18next'
import { useQuantumStore } from '../../store/quantumStore'

type Algorithm = {
  id: string
  name: string
}

export default function StateViewerPage() {
  const { t } = useTranslation()
  const [probabilities, setProbabilities] = useState<Record<string, number> | undefined>(undefined)
  const [stateVector, setStateVector] = useState<number[] | undefined>(undefined)
  const [numQubits, setNumQubits] = useState(2)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('detailed')
  const [showExport, setShowExport] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)
  const circuit = useQuantumStore(state => state.circuit)

  const algorithms = (list as Algorithm[]).slice(0, 9)

  useEffect(() => {
    if (!showExport) return
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setShowExport(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showExport])

  useEffect(() => {
    if (circuit) {
      setNumQubits(circuit.numQubits)
      setSelectedAlgorithm(null)
    }
  }, [circuit])

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
      if (!circuit) {
        setProcessing(false)
        return
      }
      const result = await runSimulation(circuit as any)
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
            <h2 className="text-2xl font-semibold text-theme-text">{t('stateviewer.title')}</h2>
            <p className="text-xs text-theme-text-muted mt-1">
              {t('stateviewer.desc')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={runFromStorage} disabled={processing}>
              {processing ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-1.5" />
                  {t('execution.running')}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faExchangeAlt} className="mr-1.5" />
                  {t('stateviewer.view_current_btn')}
                </>
              )}
            </Button>
            <button
              onClick={() => setViewMode(viewMode === 'compact' ? 'detailed' : 'compact')}
              className="px-3 py-2 text-xs bg-theme-input-bg border border-theme-border rounded hover:border-primary transition-colors flex items-center gap-1.5 text-theme-text"
            >
              <FontAwesomeIcon icon={faExchangeAlt} className="text-xs" />
              {viewMode === 'compact' ? t('stateviewer.detailed') : t('stateviewer.compact')}
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
                        <button onClick={() => { downloadFile(JSON.stringify(probabilities, null, 2), 'state-probabilities.json', 'application/json'); setShowExport(false) }} className="w-full text-left px-3 py-2 text-xs hover:bg-theme-border/50 rounded text-theme-text">{t('stateviewer.prob_json', { defaultValue: 'Probabilities (JSON)' })}</button>
                        <button onClick={() => { downloadFile(probabilitiesToCSV(probabilities), 'state-probabilities.csv', 'text/csv'); setShowExport(false) }} className="w-full text-left px-3 py-2 text-xs hover:bg-theme-border/50 rounded text-theme-text">{t('stateviewer.prob_csv', { defaultValue: 'Probabilities (CSV)' })}</button>
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

        <Card title={t('stateviewer.stats_title')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-theme-text-muted">{t('shell.qubits')}</div>
              <div className="text-2xl font-semibold text-theme-text">{numQubits}</div>
            </div>
            <div>
              <div className="text-theme-text-muted">{t('shell.states')}</div>
              <div className="text-2xl font-semibold text-theme-text">
                {probabilities ? Object.keys(probabilities).length : 0}
              </div>
            </div>
            <div>
              <div className="text-theme-text-muted">{t('stateviewer.max_prob')}</div>
              <div className="text-2xl font-semibold text-theme-text">
                {probabilities ? (Math.max(...Object.values(probabilities)) * 100).toFixed(1) : 0}%
              </div>
            </div>
            <div>
              <div className="text-theme-text-muted">{t('stateviewer.dimension')}</div>
              <div className="text-2xl font-semibold text-theme-text">
                {2 ** numQubits}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-4">
        <Card title={t('stateviewer.quick_algorithms_title')} description={t('stateviewer.quick_algorithms_desc')}>
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
            {algorithms.map(a => (
              <button
                key={a.id}
                onClick={() => runAlgorithm(a.id)}
                className={`w-full text-left p-3 rounded transition-colors text-xs ${selectedAlgorithm === a.id
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
          <Card title={t('stateviewer.state_vector_title')}>
            <div className="text-xs text-theme-text space-y-2">
              <div>
                <span className="text-theme-text-muted">{t('stateviewer.components_label')}</span> {stateVector.length / 2}
              </div>
              <div>
                <span className="text-theme-text-muted">{t('stateviewer.format_label')}</span> {t('stateviewer.format_desc')}
              </div>
              <div>
                <span className="text-theme-text-muted">{t('stateviewer.dimension')}:</span> {2 ** numQubits}D Hilbert space
              </div>
            </div>
          </Card>
        )}

        <Card title={t('stateviewer.about_title')}>
          <div className="text-xs text-theme-text space-y-2">
            <p>
              {t('stateviewer.about_desc')}
            </p>
            <p>
              <strong>{t('stateviewer.compact')}:</strong> {t('stateviewer.compact_desc', { defaultValue: 'Simple bars' })}
              <br />
              <strong>{t('stateviewer.detailed')}:</strong> {t('stateviewer.detailed_desc', { defaultValue: 'Full analysis' })}
              <br />
              <strong>{t('stateviewer.phase_diagram')}</strong> {t('stateviewer.argand_plot')}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
