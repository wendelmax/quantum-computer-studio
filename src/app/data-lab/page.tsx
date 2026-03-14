import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDatabase, faUpload, faChartLine, faMicrochip, faCogs, faEye, faFileExport, faPlus, faTable, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import DataUploader from './components/DataUploader'
import DatasetViewer from './components/DatasetViewer'
import QuantumMappingPanel from './components/QuantumMappingPanel'
import DataChart from './components/DataChart'
import AdvancedStats from './components/AdvancedStats'
import QuantumStatePreview from './components/QuantumStatePreview'
import SampleDatasetSelector from './components/SampleDatasetSelector'
import DataExporter from './components/DataExporter'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { useTranslation } from 'react-i18next'
import { useQuantumStore } from '../../store/quantumStore'

export default function DataLabPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [rows, setRows] = useState<string[][]>([])
  const [normRows, setNormRows] = useState<number[][]>([])
  const [stats, setStats] = useState<{ min: number, max: number, mean: number } | null>(null)
  const [numQubits, setNumQubits] = useState(2)
  const [mappingMode, setMappingMode] = useState<'amplitude' | 'angle'>('amplitude')
  const [selectedColumns, setSelectedColumns] = useState<number[]>([0])
  const [showAdvanced, setShowAdvanced] = useState(true)
  const setStoreCircuit = useQuantumStore(state => state.setCircuit)

  React.useEffect(() => {
    try { localStorage.setItem('quantum:datalab:raw', JSON.stringify(rows)) } catch { }
  }, [rows])

  React.useEffect(() => {
    if (normRows.length > 0 && selectedColumns.length > 0) {
      const selectedValues = normRows.flatMap(row =>
        selectedColumns.map(col => row[col] || 0)
      )
      const min = Math.min(...selectedValues)
      const max = Math.max(...selectedValues)
      const mean = selectedValues.reduce((a, b) => a + b, 0) / selectedValues.length
      setStats({ min, max, mean })
    }
  }, [normRows, selectedColumns])

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('quantum:datalab:raw')
      if (raw) setRows(JSON.parse(raw))
    } catch { }
  }, [])

  async function normalizeInWorker(input: string[][]) {
    const w = new Worker(new URL('../../workers/dataWorker.ts', import.meta.url), { type: 'module' })
    const out: number[][] = await new Promise((resolve, reject) => {
      const onMsg = (e: MessageEvent) => {
        const d = e.data
        if (d && d.ok) { w.removeEventListener('message', onMsg); resolve(d.rows) }
        else if (d && d.error) { w.removeEventListener('message', onMsg); reject(new Error(d.error)) }
      }
      w.addEventListener('message', onMsg)
      w.postMessage({ type: 'normalize', rows: input })
    })
    setNormRows(out)
    if (out.length > 0 && out[0].length > 0) {
      const availableCols = Array.from({ length: out[0].length }, (_, i) => i)
      if (selectedColumns.length === 0 || !selectedColumns.some(col => availableCols.includes(col))) {
        setSelectedColumns([0])
      }
    }
  }

  const exportToQuantum = () => {
    if (normRows.length === 0) return
    try {
      const circuit = {
        numQubits: Math.max(2, Math.ceil(Math.log2(normRows.length))),
        gates: normRows.slice(0, 20).map((row, i) => ({
          type: mappingMode === 'amplitude' ? 'H' : 'RY',
          target: i % numQubits,
          angle: mappingMode === 'angle' ? (row[0] || 0) * Math.PI : undefined
        }))
      }
      setStoreCircuit(circuit as any, false)
      navigate('/circuits')
    } catch { }
  }

  return (
    <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500 font-sans">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                   <FontAwesomeIcon icon={faDatabase} className="text-xl text-primary" />
                </div>
                <h2 className="text-3xl font-black text-theme-text tracking-tight uppercase">{t('datalab.title')}</h2>
            </div>
            <p className="text-sm font-medium text-theme-text-muted opacity-60 ml-1">
               {t('datalab.instructions_title')}
            </p>
          </div>
          <div className="flex gap-2">
            <DataExporter rawData={rows} normalizedData={normRows} />
            <Button onClick={() => navigate('/circuits')} variant="secondary" className="px-6 py-2.5 rounded-xl border-theme-border/50 hover:border-primary/50 transition-all font-semibold">
               <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-2 text-xs" />
               {t('studio.title')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="hover:border-primary/30 transition-all group p-6">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                   <FontAwesomeIcon icon={faUpload} />
                </div>
                <div>
                   <h3 className="text-sm font-bold text-theme-text">{t('datalab.upload_title')}</h3>
                   <p className="text-[10px] text-theme-text-muted uppercase tracking-wider">{t('datalab.upload_desc')}</p>
                </div>
             </div>
             <DataUploader onLoad={(r) => { setRows(r); normalizeInWorker(r) }} />
          </Card>

          <SampleDatasetSelector onLoad={(data) => { setRows(data); normalizeInWorker(data) }} />
        </div>

        {rows.length > 0 && (
          <Card 
            title={t('datalab.preview_title')} 
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-primary uppercase tracking-[0.2em] bg-primary/5 p-2 rounded-lg border border-primary/10">
               <FontAwesomeIcon icon={faEye} />
               {t('datalab.preview_desc', { count: Math.min(20, rows.length) })}
            </div>
            <DatasetViewer data={rows} />
          </Card>
        )}

        {normRows.length > 0 && (
          <>
            <DataChart data={normRows} selectedColumns={selectedColumns} />

            <Card className="overflow-hidden">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                     <FontAwesomeIcon icon={faTable} className="text-primary text-xs" />
                     <h3 className="text-sm font-bold text-theme-text">{t('datalab.column_selection_title')}</h3>
                  </div>
                  <span className="text-[10px] text-theme-text-muted font-bold px-2 py-0.5 rounded-full bg-theme-border/30">
                     {selectedColumns.length} SELECTED
                  </span>
               </div>
              <div className="flex flex-wrap gap-2">
                {normRows[0] && Array.from({ length: normRows[0].length }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedColumns(prev =>
                        prev.includes(i)
                          ? prev.filter(col => col !== i)
                          : [...prev, i]
                      )
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedColumns.includes(i)
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                      : 'bg-theme-surface border-theme-border text-theme-text-muted hover:border-primary/50'
                      }`}
                  >
                    {t('datalab.column')} {i + 1}
                  </button>
                ))}
              </div>
              {selectedColumns.length === 0 && (
                <div className="mt-3 text-[10px] font-bold text-red-400 uppercase tracking-widest animate-pulse">
                  {t('datalab.column_selection_warning')}
                </div>
              )}
            </Card>

            {stats && selectedColumns.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: t('datalab.stats.min'), val: stats.min, color: 'text-blue-500' },
                  { label: t('datalab.stats.mean'), val: stats.mean, color: 'text-primary' },
                  { label: t('datalab.stats.max'), val: stats.max, color: 'text-accent' }
                ].map((s, i) => (
                  <Card key={i} className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="text-[10px] font-black text-theme-text-muted uppercase tracking-[0.3em] mb-2">{s.label}</div>
                    <div className={`text-3xl font-black ${s.color} tracking-tighter`}>{s.val.toFixed(4)}</div>
                  </Card>
                ))}
              </div>
            )}

            {showAdvanced && <AdvancedStats data={normRows} />}

            <div className="flex justify-center">
               <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="px-6 py-2 rounded-full border border-theme-border/50 text-xs font-bold text-theme-text-muted hover:text-primary hover:border-primary/30 transition-all flex items-center gap-2 bg-theme-surface/50 backdrop-blur-sm"
               >
                  <FontAwesomeIcon icon={showAdvanced ? faCogs : faChartLine} className="text-[10px]" />
                  {showAdvanced ? t('datalab.hide_advanced') : t('datalab.show_advanced')}
               </button>
            </div>
          </>
        )}
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <QuantumMappingPanel
          numQubits={numQubits}
          mappingMode={mappingMode}
          onNumQubitsChange={setNumQubits}
          onMappingModeChange={setMappingMode}
        />

        {normRows.length > 0 ? (
          <>
            <QuantumStatePreview
              data={normRows}
              numQubits={numQubits}
              mappingMode={mappingMode}
            />

            <Card className="sticky top-6 p-6 border-primary/20 bg-primary/5">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                     <FontAwesomeIcon icon={faMicrochip} />
                  </div>
                  <div>
                     <h3 className="text-sm font-black text-theme-text uppercase tracking-widest">{t('datalab.quantum_integration_title')}</h3>
                     <p className="text-[10px] text-theme-text-muted">{t('datalab.quantum_integration_desc')}</p>
                  </div>
               </div>
               
              <div className="space-y-4 mb-6 p-4 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-theme-text-muted font-medium">Encoding Mode</span>
                  <span className="font-bold text-primary uppercase tracking-tighter">{mappingMode}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-theme-text-muted font-medium">Available States</span>
                  <span className="font-bold text-theme-text">{2 ** numQubits}</span>
                </div>
                <div className="h-px bg-white/5" />
                <p className="text-[10px] text-theme-text-muted leading-relaxed italic">
                  {mappingMode === 'amplitude'
                    ? t('datalab.amplitude_desc', { count: normRows.length })
                    : t('datalab.angle_desc', { count: normRows.length })}
                </p>
              </div>

              <Button onClick={exportToQuantum} className="w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]">
                 <FontAwesomeIcon icon={faPlus} className="mr-2" />
                 {t('datalab.create_circuit_btn')}
              </Button>
            </Card>
          </>
        ) : (
          <Card title={t('datalab.instructions_title')}>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                 <div key={i} className="flex gap-4 items-start group">
                    <div className="w-6 h-6 rounded-lg bg-theme-border/20 flex items-center justify-center text-[10px] font-bold text-theme-text-muted group-hover:bg-primary/20 group-hover:text-primary transition-colors flex-none mt-1">
                       {i}
                    </div>
                    <p className="text-xs text-theme-text-muted font-medium leading-relaxed">
                       {t(`datalab.step${i}`)}
                    </p>
                 </div>
              ))}
            </div>
          </Card>
        )}

        <Card title={t('datalab.about_title')} className="p-6">
          <div className="space-y-4">
            <p className="text-xs text-theme-text-muted leading-relaxed italic">
              {t('datalab.about_desc')}
            </p>
            <div className="pt-4 border-t border-theme-border/50 grid grid-cols-2 gap-4">
               <div>
                  <div className="text-[9px] font-black text-theme-text-muted uppercase tracking-widest mb-1">{t('datalab.formats')}</div>
                  <div className="text-xs font-bold text-theme-text">CSV, TSV, JSON</div>
               </div>
               <div>
                  <div className="text-[9px] font-black text-theme-text-muted uppercase tracking-widest mb-1">{t('datalab.processing')}</div>
                  <div className="text-xs font-bold text-theme-text font-mono">NORM_L2_AUTO</div>
               </div>
            </div>
            <div className="w-full py-2 px-3 rounded-lg bg-theme-surface/50 border border-theme-border/30 flex items-center justify-between">
               <span className="text-[10px] text-theme-text-muted font-bold tracking-widest uppercase">{t('datalab.mapping')}</span>
               <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
               </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
