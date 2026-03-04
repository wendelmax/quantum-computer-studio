import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFlask, faChartLine, faBox, faCommentDots } from '@fortawesome/free-solid-svg-icons'
import Button from '../components/Button'
import { getPreset } from './algorithms/services/presets'
import { runSimulation } from './circuits/services/simulator'
import { useTranslation } from 'react-i18next'
import { useQuantumStore } from '../store/quantumStore'
import type { Circuit } from 'quantum-computer-js'

export default function QuantumHome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setCircuit = useQuantumStore(state => state.setCircuit)
  const [demoProbabilities, setDemoProbabilities] = useState<Record<string, number>>({})
  const [isRunningDemo, setIsRunningDemo] = useState(false)

  useEffect(() => {
    runDemoSimulation()
    const interval = setInterval(runDemoSimulation, 5000)
    return () => clearInterval(interval)
  }, [])

  const runDemoSimulation = async () => {
    setIsRunningDemo(true)
    try {
      const demoCircuit = getPreset('grover')
      const result = await runSimulation(demoCircuit as Circuit)
      setDemoProbabilities(result.probabilities)
    } catch (error) {
      console.error('Demo simulation failed:', error)
    }
    setTimeout(() => setIsRunningDemo(false), 300)
  }

  const loadAlgorithm = (id: string) => {
    const preset = getPreset(id)
    setCircuit(preset as Circuit, true)
    navigate('/circuits')
  }



  const getMaxProbKey = () => {
    if (Object.keys(demoProbabilities).length === 0) return '000'
    return Object.entries(demoProbabilities).reduce((a, b) => a[1] > b[1] ? a : b)[0]
  }

  const maxProbKey = getMaxProbKey()

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="relative overflow-hidden rounded-3xl p-6 border border-white/10 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-accent/20 rounded-full blur-[120px]" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              {t('common.new_frontier')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Quantum AI</span>
            </h1>
            <p className="text-lg text-theme-text-muted mb-6 leading-relaxed">
              {t('common.explore_convergence')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => navigate('/circuits')} className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                {t('common.start_now')}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/docs')} className="px-8 py-3 rounded-xl glass border-white/10 text-white font-bold hover:bg-white/5 transition-all">
                {t('common.docs')}
              </Button>
            </div>
          </div>

          <div className="w-64 h-64 md:w-80 md:h-80 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <svg width="100%" height="100%" viewBox="0 0 200 200" className="relative drop-shadow-2xl">
              <defs>
                <radialGradient id="sphereGrad" cx="50%" cy="50%" r="50%" fx="25%" fy="25%">
                  <stop offset="0%" style={{ stopColor: '#0ea5e9', stopOpacity: 0.6 }} />
                  <stop offset="100%" style={{ stopColor: '#0c4a6e', stopOpacity: 0.2 }} />
                </radialGradient>
              </defs>
              <circle cx="100" cy="100" r="80" fill="url(#sphereGrad)" className="animate-pulse" style={{ animationDuration: '4s' }} />
              <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <ellipse cx="100" cy="100" rx="80" ry="25" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" transform="rotate(-15 100 100)" />
              <ellipse cx="100" cy="100" rx="25" ry="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" transform="rotate(-15 100 100)" />

              <line x1="100" y1="20" x2="100" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 4" />

              <circle cx="140" cy="70" r="4" fill="#60a5fa" className="animate-ping" style={{ animationDuration: '3s' }} />
              <circle cx="140" cy="70" r="3" fill="#60a5fa" />
              <line x1="100" y1="100" x2="140" y2="70" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 hover:border-primary group">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
            <FontAwesomeIcon icon={faFlask} className="text-xl" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t('home.studio_title')}</h3>
          <p className="text-sm text-theme-text-muted mb-4">{t('home.studio_desc')}</p>
          <button onClick={() => navigate('/circuits')} className="text-primary font-bold text-sm hover:underline">{t('home.studio_link')} →</button>
        </div>

        <div className="glass-card p-6 hover:border-green-500 group">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 mb-4 group-hover:scale-110 transition-transform">
            <FontAwesomeIcon icon={faChartLine} className="text-xl" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t('home.algorithms_title')}</h3>
          <p className="text-sm text-theme-text-muted mb-4">{t('home.algorithms_desc')}</p>
          <button onClick={() => navigate('/algorithms')} className="text-green-500 font-bold text-sm hover:underline">{t('home.algorithms_link')} →</button>
        </div>

        <div className="glass-card p-6 hover:border-purple-500 group">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4 group-hover:scale-110 transition-transform">
            <FontAwesomeIcon icon={faCommentDots} className="text-xl" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t('home.qnlp_title')}</h3>
          <p className="text-sm text-theme-text-muted mb-4">{t('home.qnlp_desc')}</p>
          <button onClick={() => navigate('/qnlp')} className="text-purple-500 font-bold text-sm hover:underline">{t('home.qnlp_link')} →</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 glass-card p-6 border-white/5 space-y-6">
          <header className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <h2 className="text-base font-bold text-white/90">{t('home.real_time_sim')}</h2>
            </div>
            <div className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">{t('home.demo_tag', 'Grover')}</div>
          </header>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(demoProbabilities).slice(0, 8).map(([state, prob]) => (
              <div key={state} className={`p-2 rounded-xl border transition-all duration-700 ${state === maxProbKey ? 'bg-primary/5 border-primary/20 shadow-lg shadow-primary/5' : 'bg-white/[0.01] border-transparent'} `}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-mono text-theme-text-muted opacity-40">|{state}⟩</span>
                  <span className={`text-[10px] font-mono font-black ${state === maxProbKey ? 'text-primary' : 'text-white/60'}`}>{(prob * 100).toFixed(0)}%</span>
                </div>
                <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(14,165,233,0.3)]"
                    style={{ width: `${prob * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 px-4 py-2.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[9px] font-black text-orange-500/60 uppercase tracking-tighter">{t('home.insights')}</span>
            </div>
            <p className="text-[10px] text-theme-text-muted leading-tight italic truncate">
              {t('home.grover_insight', { key: maxProbKey })}
            </p>
          </div>
        </section>

        <section className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 bg-gradient-to-br from-indigo-950/20 to-blue-950/20 border-white/5">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-6">{t('home.execution_engine')}</h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-green-500/5 flex items-center justify-center text-green-500/80 text-[10px] font-black border border-green-500/10">99</div>
                  <span className="text-[10px] font-bold text-theme-text-muted/80 uppercase tracking-wider">{t('home.reliability')}</span>
                </div>
                <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[99.9%] bg-green-500/60" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center text-primary/80 text-[10px] font-black border border-primary/10">ms</div>
                  <span className="text-[10px] font-bold text-theme-text-muted/80 uppercase tracking-wider">{t('home.latency')}</span>
                </div>
                <span className="text-[11px] font-mono text-white/80 font-bold">0.42ms</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/5 flex items-center justify-center text-purple-500/80 text-[10px] font-black border border-purple-500/10">16</div>
                  <span className="text-[10px] font-bold text-theme-text-muted/80 uppercase tracking-wider">{t('home.capacity')}</span>
                </div>
                <span className="text-[11px] font-mono text-white/80 font-bold">{t('home.qubits_count', { count: 16, defaultValue: '16 Qubits' })}</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5">
              <Link to="/execution" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-xs font-bold text-white">
                <span>{t('home.resource_monitor')}</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          <div className="glass-card p-0 overflow-hidden relative group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faBox} className="text-primary" />
                {t('home.lib_highlight')}
              </h3>
              <div className="text-left py-2 border-l-2 border-primary pl-4">
                <div className="text-white font-bold text-sm">{t('home.shor_title')}</div>
                <p className="text-[11px] text-theme-text-muted mt-1 leading-relaxed">{t('home.shor_desc')}</p>
              </div>
              <Button onClick={() => loadAlgorithm('shor')} className="mt-6 w-full py-3 rounded-xl bg-white/5 hover:bg-primary hover:text-white border-white/10 text-white font-bold transition-all">
                {t('home.open_studio')}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

