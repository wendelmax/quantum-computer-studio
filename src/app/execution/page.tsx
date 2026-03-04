import React, { useState, useEffect } from 'react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import { runSimulation } from '../circuits/services/simulator'
import ExecutionMonitor from './components/ExecutionMonitor'
import PerformanceStats from './components/PerformanceStats'
import QubitStateViewer from './components/QubitStateViewer'
import { useTranslation } from 'react-i18next'
import { useQuantumStore } from '../../store/quantumStore'

export default function ExecutionPage() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle')
  const [ms, setMs] = useState<number>(0)
  const [summary, setSummary] = useState<string>('')
  const [probabilities, setProbabilities] = useState<Record<string, number> | undefined>(undefined)
  const [startTime, setStartTime] = useState<number>(0)
  const [progress, setProgress] = useState(0)
  const circuit = useQuantumStore(state => state.circuit)

  const [history, setHistory] = useState<Array<{ time: number, states: number, ms: number }>>([])

  useEffect(() => {
    if (status === 'running') {
      const interval = setInterval(() => {
        if (startTime) {
          const elapsed = Date.now() - startTime
          setProgress(Math.min(95, (elapsed / 1000) * 10))
        }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [status, startTime])

  async function runCurrent() {
    try {
      if (!circuit) {
        setSummary(t('execution.no_circuit'))
        return
      }

      setStatus('running')
      setProgress(0)
      setProbabilities(undefined)
      setStartTime(Date.now())

      const t0 = performance.now()
      const res = await runSimulation(circuit)
      const t1 = performance.now()

      const executionTime = t1 - t0
      setMs(executionTime)
      setSummary(t('execution.states_count', { count: Object.keys(res.probabilities).length }))
      setProbabilities(res.probabilities)
      setStatus('done')
      setProgress(100)

      setHistory(prev => [{ time: Date.now(), states: Object.keys(res.probabilities).length, ms: executionTime }, ...prev].slice(0, 10))

      setTimeout(() => {
        setStatus('idle')
        setProgress(0)
      }, 2000)
    } catch (err: any) {
      setSummary(`${t('execution.sim_failed')}: ${err.message || ''}`)
      setStatus('idle')
      setProgress(0)
    }
  }

  return (
    <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-theme-text">{t('execution.monitor_title')}</h2>
          <Button onClick={runCurrent} disabled={status === 'running'}>
            {status === 'running' ? t('execution.running') : t('execution.run_circuit')}
          </Button>
        </div>

        <ExecutionMonitor
          isRunning={status === 'running'}
          progress={progress}
          startTime={startTime}
        />

        <PerformanceStats
          stats={status === 'done' ? {
            executionTime: ms,
            numStates: probabilities ? Object.keys(probabilities).length : 0,
            numGates: 0
          } : undefined}
        />

        <Card title={t('execution.summary_title')}>
          <div className="text-sm text-theme-text">
            {summary || (status === 'idle' ? t('execution.no_execution') : t('execution.ready'))}
          </div>
        </Card>

        {history.length > 0 && (
          <Card title={t('execution.history_title')}>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
              {history.map((run, i) => (
                <div key={i} className="flex justify-between items-center text-xs border-b border-theme-border pb-2">
                  <span className="text-theme-text">{t('execution.run_label')} {i + 1}</span>
                  <div className="flex gap-4 text-theme-text-muted">
                    <span>{t('execution.states_count', { count: run.states })}</span>
                    <span>{run.ms.toFixed(2)}ms</span>
                    <span>{new Date(run.time).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <div className="lg:col-span-4 flex flex-col gap-4">
        <QubitStateViewer probabilities={probabilities} />

        <Card title={t('execution.load_circuit_title')}>
          <div className="text-xs text-theme-text mb-3">
            {t('execution.load_circuit_desc')}
          </div>
          <Button variant="secondary" className="w-full" onClick={() => window.location.href = '/circuits'}>
            {t('execution.open_studio_btn')}
          </Button>
        </Card>

        <Card title={t('execution.about_title')}>
          <div className="text-xs text-theme-text space-y-2">
            <p>
              {t('execution.about_desc')}
            </p>
            <p>
              <strong>{t('execution.perf_indicators')}</strong>
              <br />
              • {t('execution.exec_time')}
              <br />
              • {t('execution.states_discovered')}
              <br />
              • {t('execution.gates_processed')}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
