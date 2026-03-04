import React, { useState } from 'react'
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
      window.location.href = '/circuits'
    } catch { }
  }

  return (
    <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-theme-text">{t('datalab.title')}</h2>
          <div className="flex gap-2">
            <DataExporter rawData={rows} normalizedData={normRows} />
            <Button onClick={() => window.location.href = '/circuits'}>{t('qnlp.open_studio')}</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card title={t('datalab.upload_title')} description={t('datalab.upload_desc')}>
            <DataUploader onLoad={(r) => { setRows(r); normalizeInWorker(r) }} />
          </Card>

          <SampleDatasetSelector onLoad={(data) => { setRows(data); normalizeInWorker(data) }} />
        </div>

        {rows.length > 0 && (
          <Card title={t('datalab.preview_title')} description={t('datalab.preview_desc', { count: Math.min(20, rows.length) })}>
            <DatasetViewer data={rows} />
          </Card>
        )}

        {normRows.length > 0 && (
          <>
            <DataChart data={normRows} selectedColumns={selectedColumns} />

            <Card
              title={t('datalab.column_selection_title')}
              description={t('datalab.column_selection_desc')}
            >
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
                    className={`px-3 py-1.5 rounded text-sm transition-all ${selectedColumns.includes(i)
                      ? 'bg-primary text-white'
                      : 'bg-theme-surface text-theme-text hover:bg-theme-border/50'
                      }`}
                  >
                    Col {i + 1}
                  </button>
                ))}
              </div>
              {selectedColumns.length === 0 && (
                <div className="mt-2 text-xs text-amber-400">
                  {t('datalab.column_selection_warning')}
                </div>
              )}
            </Card>

            {stats && selectedColumns.length > 0 && (
              <Card
                title={t('datalab.stats_title')}
                description={t('datalab.stats_desc')}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-theme-text-muted">Min</div>
                    <div className="text-2xl font-semibold text-theme-text">{stats.min.toFixed(3)}</div>
                  </div>
                  <div>
                    <div className="text-theme-text-muted">Mean</div>
                    <div className="text-2xl font-semibold text-theme-text">{stats.mean.toFixed(3)}</div>
                  </div>
                  <div>
                    <div className="text-theme-text-muted">Max</div>
                    <div className="text-2xl font-semibold text-theme-text">{stats.max.toFixed(3)}</div>
                  </div>
                </div>
              </Card>
            )}

            {showAdvanced && <AdvancedStats data={normRows} />}

            {normRows.length > 0 && (
              <Card>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-primary hover:text-accent transition-colors"
                >
                  {showAdvanced ? '▼' : '▶'} {showAdvanced ? t('datalab.hide_advanced') : t('datalab.show_advanced')}
                </button>
              </Card>
            )}
          </>
        )}
      </div>

      <div className="lg:col-span-4 flex flex-col gap-4">
        <QuantumMappingPanel
          numQubits={numQubits}
          mappingMode={mappingMode}
          onNumQubitsChange={setNumQubits}
          onMappingModeChange={setMappingMode}
        />

        {normRows.length > 0 && (
          <>
            <QuantumStatePreview
              data={normRows}
              numQubits={numQubits}
              mappingMode={mappingMode}
            />

            <Card title={t('datalab.quantum_integration_title')}>
              <div className="text-xs text-theme-text mb-3">
                {t('datalab.quantum_integration_desc')}
              </div>
              <div className="space-y-2 mb-3">
                <div className="text-xs text-theme-text-muted">
                  {mappingMode === 'amplitude'
                    ? t('datalab.amplitude_desc', { count: normRows.length })
                    : t('datalab.angle_desc', { count: normRows.length })}
                </div>
                <div className="text-xs text-theme-text-muted">
                  {t('datalab.qubits_desc', { count: numQubits, states: 2 ** numQubits })}
                </div>
              </div>
              <Button className="w-full" onClick={exportToQuantum}>
                {t('datalab.create_circuit_btn')}
              </Button>
            </Card>
          </>
        )}

        {!normRows.length && (
          <Card title={t('datalab.instructions_title')}>
            <div className="text-xs text-theme-text space-y-2">
              <p>{t('datalab.step1')}</p>
              <p>{t('datalab.step2')}</p>
              <p>{t('datalab.step3')}</p>
              <p>{t('datalab.step4')}</p>
              <p>{t('datalab.step5')}</p>
            </div>
          </Card>
        )}

        <Card title={t('datalab.about_title')}>
          <div className="text-xs text-theme-text space-y-2">
            <p>
              {t('datalab.about_desc')}
            </p>
            <p>
              <strong>{t('datalab.formats')}</strong> CSV, TSV
              <br />
              <strong>{t('datalab.processing')}</strong> Automatic normalization
              <br />
              <strong>{t('datalab.mapping')}</strong> Amplitude or Angle encoding
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
