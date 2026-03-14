import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faExchangeAlt, faDownload, faWaveSquare, faChartBar, faMicrochip, faHistory, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
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
    <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-theme-text tracking-tight flex items-center gap-3">
              <FontAwesomeIcon icon={faWaveSquare} className="text-primary" />
              {t('stateviewer.title')}
            </h2>
            <p className="text-sm text-theme-text-muted mt-1 font-medium">
              {t('stateviewer.desc')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={runFromStorage} disabled={processing} variant="primary" className="shadow-lg shadow-primary/20">
              {processing ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  {t('execution.running')}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faExchangeAlt} className="mr-2" />
                  {t('stateviewer.view_current_btn')}
                </>
              )}
            </Button>
            
            <div className="relative" ref={exportRef}>
               <Button variant="secondary" onClick={() => setShowExport(!showExport)} className="px-4">
                  <FontAwesomeIcon icon={faDownload} className="mr-2" />
                  Export
               </Button>
               {showExport && (probabilities || stateVector) && (
                  <div className="absolute right-0 top-full mt-2 z-20 bg-theme-surface/95 backdrop-blur-xl border border-theme-border/50 rounded-xl p-2 shadow-2xl min-w-[200px] animate-in zoom-in-95 duration-200">
                    {probabilities && Object.keys(probabilities).length > 0 && (
                      <>
                        <button onClick={() => { downloadFile(JSON.stringify(probabilities, null, 2), 'state-probabilities.json', 'application/json'); setShowExport(false) }} className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">{t('stateviewer.prob_json')}</button>
                        <button onClick={() => { downloadFile(probabilitiesToCSV(probabilities), 'state-probabilities.csv', 'text/csv'); setShowExport(false) }} className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">{t('stateviewer.prob_csv')}</button>
                      </>
                    )}
                    {stateVector && stateVector.length > 0 && (
                      <button onClick={() => { downloadFile(JSON.stringify(stateVector), 'state-vector.json', 'application/json'); setShowExport(false) }} className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">State vector (JSON)</button>
                    )}
                  </div>
               )}
            </div>
          </div>
        </div>

        <Card className="p-2">
           <div className="flex p-1 bg-theme-border/20 rounded-xl">
              <button 
                 onClick={() => setViewMode('detailed')}
                 className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'detailed' ? 'bg-theme-surface text-primary shadow-sm' : 'text-theme-text-muted hover:text-theme-text'}`}
              >
                 <FontAwesomeIcon icon={faChartBar} className="text-[10px]" />
                 {t('stateviewer.detailed')}
              </button>
              <button 
                 onClick={() => setViewMode('compact')}
                 className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'compact' ? 'bg-theme-surface text-primary shadow-sm' : 'text-theme-text-muted hover:text-theme-text'}`}
              >
                 <FontAwesomeIcon icon={faWaveSquare} className="text-[10px]" />
                 {t('stateviewer.compact')}
              </button>
           </div>
        </Card>

        <div className="space-y-6">
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
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PhaseDiagram stateVector={stateVector} numQubits={numQubits} />
                <StateAnalysis
                  stateVector={stateVector}
                  probabilities={probabilities || {}}
                  numQubits={numQubits}
                />
             </div>
           )}
        </div>

        <Card className="overflow-hidden border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-6 px-6 pt-6">
             <FontAwesomeIcon icon={faCheckCircle} className="text-primary text-xs" />
             <h3 className="text-sm font-black text-theme-text uppercase tracking-widest">{t('stateviewer.stats_title')}</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-theme-border/30 border-t border-theme-border/30">
            {[
               { label: t('shell.qubits'), val: numQubits },
               { label: t('shell.states'), val: probabilities ? Object.keys(probabilities).length : 0 },
               { label: t('stateviewer.max_prob'), val: probabilities ? (Math.max(...Object.values(probabilities)) * 100).toFixed(1) + '%' : '0%' },
               { label: t('stateviewer.dimension'), val: 2 ** numQubits }
            ].map((s, i) => (
              <div key={i} className="bg-theme-surface p-6 flex flex-col items-center justify-center text-center">
                <div className="text-[9px] font-black text-theme-text-muted uppercase tracking-[0.2em] mb-1">{s.label}</div>
                <div className="text-2xl font-black text-theme-text tracking-tighter">{s.val}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <Card className="p-6">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                 <FontAwesomeIcon icon={faHistory} />
              </div>
              <div>
                 <h3 className="text-sm font-bold text-theme-text">{t('stateviewer.quick_algorithms_title')}</h3>
                 <p className="text-[10px] text-theme-text-muted uppercase tracking-wider">{t('stateviewer.quick_algorithms_desc')}</p>
              </div>
           </div>
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin pr-1">
            {algorithms.map(a => (
              <button
                key={a.id}
                onClick={() => runAlgorithm(a.id)}
                className={`group w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between ${selectedAlgorithm === a.id
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-theme-surface border-theme-border/50 hover:border-primary/50 text-theme-text'
                  }`}
              >
                <span className="text-xs font-bold">{a.name}</span>
                <FontAwesomeIcon icon={faExchangeAlt} className={`text-[10px] opacity-0 group-hover:opacity-100 transition-opacity ${selectedAlgorithm === a.id ? 'opacity-100' : ''}`} />
              </button>
            ))}
          </div>
        </Card>

        {stateVector && stateVector.length > 0 && (
          <AmplitudeTable stateVector={stateVector} numQubits={numQubits} />
        )}

        {stateVector && stateVector.length > 0 && (
          <Card className="p-6 bg-theme-border/10 border-theme-border/30">
            <div className="flex items-center gap-2 mb-6 text-primary">
               <FontAwesomeIcon icon={faMicrochip} className="text-xs" />
               <h3 className="text-xs font-black uppercase tracking-[0.2em]">{t('stateviewer.state_vector_title')}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-theme-text-muted font-bold uppercase tracking-tighter">{t('stateviewer.components_label')}</span>
                <span className="font-black text-theme-text">{stateVector.length / 2}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-theme-text-muted font-bold uppercase tracking-tighter">{t('stateviewer.format_label')}</span>
                <span className="font-black text-theme-text">{t('stateviewer.format_desc')}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-theme-text-muted font-bold uppercase tracking-tighter">{t('stateviewer.dimension')}</span>
                <span className="font-black text-primary">2^{numQubits}D HILBERT</span>
              </div>
            </div>
          </Card>
        )}

        <Card title={t('stateviewer.about_title')} className="p-6">
          <div className="space-y-4">
            <p className="text-xs text-theme-text-muted leading-relaxed italic">
              {t('stateviewer.about_desc')}
            </p>
            <div className="pt-4 border-t border-theme-border/50 space-y-3">
               <div className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <p className="text-[10px] text-theme-text-muted font-medium">
                     <strong>{t('stateviewer.compact')}:</strong> {t('stateviewer.compact_desc')}
                  </p>
               </div>
               <div className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <p className="text-[10px] text-theme-text-muted font-medium">
                     <strong>{t('stateviewer.detailed')}:</strong> {t('stateviewer.detailed_desc')}
                  </p>
               </div>
               <div className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-theme-text shrink-0 opacity-20" />
                  <p className="text-[10px] text-theme-text-muted font-medium">
                     <strong>{t('stateviewer.phase_diagram')}</strong> {t('stateviewer.argand_plot')}
                  </p>
               </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
