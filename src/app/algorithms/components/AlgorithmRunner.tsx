import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faGauge } from '@fortawesome/free-solid-svg-icons'
import Button from '../../../components/Button'
import { getPreset } from '../services/presets'
import { runSimulation } from '../../circuits/services/simulator'
import type { Circuit } from 'quantum-computer-js'

type Props = {
  algorithm: string
}

export default function AlgorithmRunner({ algorithm }: Props) {
  const [ms, setMs] = useState<number>(0)
  const [summary, setSummary] = useState<string>('')
  async function runPreview() {
    const preset = getPreset(algorithm)
    const t0 = performance.now()
    const res = await runSimulation(preset as Circuit)
    const t1 = performance.now()
    setMs(t1 - t0)
    setSummary(`states=${Object.keys(res.probabilities).length}`)
    try {
      window.dispatchEvent(new CustomEvent('quantum:set-circuit', { detail: { circuit: preset, autoRun: true } }))
    } catch { }
  }
  return (
    <div className="p-4 rounded bg-bg-card border border-theme-border">
      <div className="text-sm text-theme-text mb-2">Runner: <span className="text-theme-text">{algorithm}</span></div>
      <Button onClick={runPreview}>
        <FontAwesomeIcon icon={faPlay} className="mr-1.5" />
        Run
      </Button>
      {summary && (
        <div className="mt-2 flex items-center gap-2 text-xs text-theme-text-muted">
          <FontAwesomeIcon icon={faGauge} />
          <span>{summary} • {ms.toFixed(2)}ms</span>
        </div>
      )}
    </div>
  )
}
