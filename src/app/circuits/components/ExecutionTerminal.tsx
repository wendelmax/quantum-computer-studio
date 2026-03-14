import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faDownload, faChartBar, faListUl, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import Card from '../../../components/Card'
import Button from '../../../components/Button'
import { useTranslation } from 'react-i18next'
import { downloadFile } from '../../../lib/exportUtils'
import { QuantumMetrics } from 'quantum-computer-js'
import type { Circuit } from 'quantum-computer-js'

type Props = {
  circuit: Circuit
  probabilities?: Record<string, number>
  processing?: boolean
  stateVector?: number[]
}

function formatComplex(r: number, i: number): string {
  if (Math.abs(i) < 1e-6) return r.toFixed(3)
  if (Math.abs(r) < 1e-6) return `${i.toFixed(3)}i`
  return `${r.toFixed(3)}${i >= 0 ? '+' : ''}${i.toFixed(3)}i`
}

export default function ExecutionTerminal({ circuit, probabilities, processing, stateVector }: Props) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'metrics' | 'vector' | 'logs'>('metrics')

  const numQubits = circuit.numQubits
  const hasResults = !processing && probabilities && Object.keys(probabilities).length > 0
  const hasVector = !processing && stateVector && stateVector.length > 0

  const entries = probabilities ? Object.entries(probabilities).sort((a, b) => b[1] - a[1]).slice(0, 16) : []

  const vectorEntries = stateVector && numQubits ? (() => {
    const items: Array<{ state: string; amp: string; prob: number }> = []
    for (let i = 0; i < stateVector.length; i += 2) {
      const r = stateVector[i]
      const im = stateVector[i + 1] ?? 0
      const prob = r * r + im * im
      if (prob > 1e-6) {
        const state = (i / 2).toString(2).padStart(numQubits, '0')
        items.push({ state, amp: formatComplex(r, im), prob })
      }
    }
    return items.sort((a, b) => b.prob - a.prob)
  })() : []

  const handleExport = () => {
    if (!probabilities || !stateVector) return
    const payload = {
      circuit: circuit,
      probabilities: probabilities,
      stateVector: stateVector,
    }
    downloadFile(JSON.stringify(payload, null, 2), 'circuit-result.json', 'application/json')
  }

  const calculateEntropy = () => {
    if (!stateVector) return '0.0000'
    try {
      const complexSV = []
      for (let i = 0; i < stateVector.length; i += 2) complexSV.push({ r: stateVector[i], i: stateVector[i + 1] })
      const dm = QuantumMetrics.partialTrace(complexSV, numQubits, Array.from({ length: Math.max(0, numQubits - 1) }, (_, i) => i + 1))
      return QuantumMetrics.calculateEntropy(dm).toFixed(4)
    } catch {
      return 'N/A'
    }
  }

  if (processing) {
    return (
      <div className="bg-theme-surface/30 rounded-xl border border-theme-border/50 shadow-sm p-4 h-64 flex flex-col items-center justify-center animate-pulse">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-primary text-3xl mb-3" />
        <span className="text-theme-text-muted">{t('studio.computing', 'Computing state vector and probabilities...')}</span>
      </div>
    )
  }

  if (!hasResults && !hasVector) {
    return (
      <div className="bg-theme-surface/30 rounded-xl border border-theme-border/50 shadow-sm p-4 h-64 flex flex-col items-center justify-center text-center">
        <FontAwesomeIcon icon={faInfoCircle} className="text-theme-text-muted text-2xl mb-2 opacity-50" />
        <span className="text-theme-text-muted">{t('studio.no_results', 'No execution results to display. Run the circuit to view metrics.')}</span>
      </div>
    )
  }

  return (
    <div className="bg-theme-surface/30 rounded-xl border border-theme-border/50 shadow-sm flex flex-col h-full animate-fade-in overflow-hidden">
      {/* Terminal Header Tabs */}
      <div className="flex items-center gap-1 px-2 pt-2 bg-bg-card border-b border-theme-border/50">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all ${activeTab === 'metrics' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-theme-text-muted hover:text-theme-text hover:bg-theme-surface/50'} rounded-t-lg`}
        >
          <FontAwesomeIcon icon={faChartBar} />
          {t('studio.metrics_tabs_metrics', 'Metrics & Probabilities')}
        </button>
        {hasVector && (
          <button
            onClick={() => setActiveTab('vector')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all ${activeTab === 'vector' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-theme-text-muted hover:text-theme-text hover:bg-theme-surface/50'} rounded-t-lg`}
          >
            <FontAwesomeIcon icon={faListUl} />
            {t('studio.metrics_tabs_vector', 'State Vector')}
          </button>
        )}
        <div className="flex-1" />
        {/* Quick Actions in Header */}
        <div className="px-2">
          <Button variant="secondary" className="text-xs py-1 px-3 bg-theme-surface/50 border-theme-border/50 hover:border-primary/50" onClick={handleExport}>
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            {t('studio.export_btn', 'Export')}
          </Button>
        </div>
      </div>

      {/* Terminal Content Area */}
      <div className="flex-1 p-4 bg-[#0d1117] min-h-[250px] overflow-y-auto custom-scrollbar">
        {activeTab === 'metrics' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Top Metrics Row */}
            <div className="flex gap-4">
              <div className="px-4 py-3 rounded-lg bg-primary/10 border border-primary/20 flex flex-col min-w-[150px]">
                <span className="text-[10px] uppercase text-primary font-bold tracking-widest mb-1">{t('studio.von_neumann', 'Von Neumann Entropy')}</span>
                <span className="text-2xl font-mono text-theme-text">{calculateEntropy()}</span>
              </div>
              <div className="px-4 py-3 rounded-lg bg-accent/10 border border-accent/20 flex flex-col min-w-[150px]">
                <span className="text-[10px] uppercase text-accent font-bold tracking-widest mb-1">{t('studio.state_purity', 'State Purity')}</span>
                <span className="text-2xl font-mono text-theme-text">100%</span>
              </div>
            </div>

            {/* Probability Distribution */}
            <div>
              <h4 className="text-sm font-medium text-theme-text mb-3">{t('studio.top_probabilities', 'Top Probabilities')}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {entries.map(([state, prob], i) => (
                  <div
                    key={state}
                    className="flex flex-col items-center p-2 rounded bg-bg-card/50 border border-theme-border/50 transition-smooth hover:border-primary/50"
                  >
                    <div className="text-xs font-mono text-theme-text">|{state}⟩</div>
                    <div className="mt-2 w-10 h-20 bg-theme-surface rounded overflow-hidden flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-primary to-accent animate-bar-grow"
                        style={{ height: `${(prob as number) * 100}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-primary font-semibold">{((prob as number) * 100).toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vector' && (
          <div className="animate-fade-in">
            <h4 className="text-sm font-medium text-theme-text mb-3">{t('studio.raw_amplitudes', 'Raw State Vector Amplitudes')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {vectorEntries.map(({ state, amp, prob }) => (
                <div key={state} className="flex items-center justify-between p-3 rounded-lg bg-bg-card/50 border border-theme-border/50 font-mono text-sm">
                  <div className="text-theme-text font-bold">|{state}⟩</div>
                  <div className="text-theme-text-muted text-xs mx-3">{amp}</div>
                  <div className="text-primary">{(prob * 100).toFixed(2)}%</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
