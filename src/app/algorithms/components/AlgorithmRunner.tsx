import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faGauge, faTerminal, faWaveSquare } from '@fortawesome/free-solid-svg-icons'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import { getPreset } from '../services/presets'
import { runSimulation } from '../../circuits/services/simulator'
import type { Circuit } from 'quantum-computer-js'
import { useTranslation } from 'react-i18next'

type Props = {
  algorithm: string
}

export default function AlgorithmRunner({ algorithm }: Props) {
  const { t } = useTranslation()
  const [ms, setMs] = useState<number>(0)
  const [summary, setSummary] = useState<string>('')
  const [running, setRunning] = useState(false)

  async function runPreview() {
    setRunning(true)
    const preset = getPreset(algorithm)
    const t0 = performance.now()
    try {
      const res = await runSimulation(preset as Circuit)
      const t1 = performance.now()
      setMs(t1 - t0)
      setSummary(`${Object.keys(res.probabilities).length}`)
      window.dispatchEvent(new CustomEvent('quantum:set-circuit', { detail: { circuit: preset, autoRun: true } }))
    } catch (err) {
      console.error(err)
    } finally {
      setRunning(false)
    }
  }

  return (
    <Card className="p-5 border-primary/20 bg-primary/5">
      <div className="flex items-center gap-3 mb-6">
         <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <FontAwesomeIcon icon={faTerminal} />
         </div>
         <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-theme-text-muted">{t('algorithms.runner_title')}</h3>
            <p className="text-sm font-bold text-theme-text tracking-tight">{algorithm.toUpperCase()}</p>
         </div>
      </div>

      <Button 
        onClick={runPreview} 
        disabled={running} 
        className="w-full shadow-lg shadow-primary/20 py-2.5 text-xs font-bold uppercase tracking-wider"
      >
        <FontAwesomeIcon icon={running ? faWaveSquare : faPlay} className={`mr-2 ${running ? 'animate-pulse' : ''}`} />
        {running ? t('studio.running') : t('algorithms.run_btn')}
      </Button>

      {summary && !running && (
        <div className="mt-5 grid grid-cols-2 gap-px bg-theme-border/20 rounded-xl border border-theme-border/30 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
           <div className="bg-theme-surface/40 p-3 flex flex-col items-center justify-center text-center">
              <span className="text-[8px] font-black text-theme-text-muted uppercase tracking-tighter mb-1">{t('algorithms.states_label')}</span>
              <span className="text-sm font-black text-primary font-mono">{summary}</span>
           </div>
           <div className="bg-theme-surface/40 p-3 flex flex-col items-center justify-center text-center">
              <span className="text-[8px] font-black text-theme-text-muted uppercase tracking-tighter mb-1">Latency</span>
              <span className="text-sm font-black text-theme-text font-mono">{ms.toFixed(1)}ms</span>
           </div>
        </div>
      )}
    </Card>
  )
}
