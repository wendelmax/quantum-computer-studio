import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFlask, faChartLine, faChartBar, faHashtag, faCircle, faBook, faTerminal, faBox, faDesktop, faLayerGroup, faUndo, faImages, faCode, faTachometerAlt, faSlidersH, faCommentDots } from '@fortawesome/free-solid-svg-icons'
import Button from '../components/Button'
import { getPreset } from './algorithms/services/presets'
import { runSimulation } from './circuits/services/simulator'
import { setItem } from '../lib/safeStorage'
import { QUANTUM_SET_CIRCUIT } from '../lib/events'
import { useTranslation } from 'react-i18next'

export default function QuantumHome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
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
      const result = await runSimulation(demoCircuit as any)
      setDemoProbabilities(result.probabilities)
    } catch { }
    setTimeout(() => setIsRunningDemo(false), 300)
  }

  const loadAlgorithm = (id: string) => {
    const preset = getPreset(id)
    setItem('quantum:loadCircuit', JSON.stringify(preset))
    setItem('quantum:circuit', JSON.stringify(preset))
    setItem('quantum:prefs:numQubits', String(preset.numQubits))
    setItem('quantum:autoRun', '1')
    window.dispatchEvent(new CustomEvent(QUANTUM_SET_CIRCUIT, { detail: { circuit: preset, autoRun: true } }))
    navigate('/circuits')
  }

  const algorithms = [
    { id: 'grover', name: "Grover's algorithm", description: 'Quantum search O(√N)', color: 'border-blue-600' },
    { id: 'deutsch-jozsa', name: "Deutsch–Jozsa", description: 'Constant vs balanced', color: 'border-green-600' },
    { id: 'shor', name: "Shor's algorithm", description: 'Integer factorization', color: 'border-purple-600' },
    { id: 'qft', name: 'Quantum Fourier Transform', description: 'Frequency domain', color: 'border-cyan-600' },
    { id: 'qpe', name: 'Quantum Phase Estimation', description: 'Eigenvalue estimation', color: 'border-orange-600' }
  ]

  const getMaxProbKey = () => {
    if (Object.keys(demoProbabilities).length === 0) return '000'
    return Object.entries(demoProbabilities).reduce((a, b) => a[1] > b[1] ? a : b)[0]
  }

  const maxProbKey = getMaxProbKey()

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="relative overflow-hidden rounded-3xl p-8 border border-white/10 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 shadow-2xl">
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
        <div className="glass-card hover:border-primary group">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
            <FontAwesomeIcon icon={faFlask} className="text-xl" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t('home.studio_title')}</h3>
          <p className="text-sm text-theme-text-muted mb-4">{t('home.studio_desc')}</p>
          <button onClick={() => navigate('/circuits')} className="text-primary font-bold text-sm hover:underline">{t('home.studio_link')} →</button>
        </div>

        <div className="glass-card hover:border-green-500 group">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 mb-4 group-hover:scale-110 transition-transform">
            <FontAwesomeIcon icon={faChartLine} className="text-xl" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t('home.algorithms_title')}</h3>
          <p className="text-sm text-theme-text-muted mb-4">{t('home.algorithms_desc')}</p>
          <button onClick={() => navigate('/algorithms')} className="text-green-500 font-bold text-sm hover:underline">{t('home.algorithms_link')} →</button>
        </div>

        <div className="glass-card hover:border-purple-500 group">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4 group-hover:scale-110 transition-transform">
            <FontAwesomeIcon icon={faCommentDots} className="text-xl" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t('home.qnlp_title')}</h3>
          <p className="text-sm text-theme-text-muted mb-4">{t('home.qnlp_desc')}</p>
          <button onClick={() => navigate('/qnlp')} className="text-purple-500 font-bold text-sm hover:underline">{t('home.qnlp_link')} →</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 glass-card border-white/5 space-y-6">
          <header className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <h2 className="text-lg font-bold text-white">Resultados de Simulação (Live)</h2>
            </div>
            <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">Grover Search</div>
          </header>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(demoProbabilities).slice(0, 8).map(([state, prob]) => (
              <div key={state} className={`p - 4 rounded - 2xl border transition - all duration - 500 ${state === maxProbKey ? 'bg-primary/10 border-primary/50 scale-105 shadow-lg shadow-primary/10' : 'bg-black/20 border-white/5'} `}>
                <div className="text-[10px] font-black text-theme-text-muted mb-2 tracking-tighter opacity-50 font-mono">|{state}⟩</div>
                <div className="text-2xl font-mono text-white leading-none mb-3 font-bold">{(prob * 100).toFixed(0)}%</div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(14,165,233,0.5)]"
                    style={{ width: `${prob * 100}% ` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-theme-surface/30 border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
              <FontAwesomeIcon icon={faTachometerAlt} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-white uppercase tracking-widest leading-none mb-1">Dica Quântica</div>
              <p className="text-[11px] text-theme-text-muted">Grover acelera buscas em bancos de dados não estruturados de O(N) para O(√N), permitindo encontrar |{maxProbKey}⟩ exponencialmente mais rápido.</p>
            </div>
          </div>
        </section>

        <section className="lg:col-span-4 space-y-6">
          <div className="glass-card bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border-white/10">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Motor de Execução</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 text-xs">99.9</div>
                  <span className="text-xs font-bold text-theme-text-muted uppercase">Confiabilidade</span>
                </div>
                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[99.9%] bg-green-500" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs">ms</div>
                  <span className="text-xs font-bold text-theme-text-muted uppercase">Latência</span>
                </div>
                <span className="text-xs font-mono text-white">0.42ms</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 text-xs">2^16</div>
                  <span className="text-xs font-bold text-theme-text-muted uppercase">Capacidade</span>
                </div>
                <span className="text-xs font-mono text-white">16 Qubits</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5">
              <Link to="/execution" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-xs font-bold text-white">
                <span>Monitor de Recursos</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          <div className="glass-card p-0 overflow-hidden relative group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faBox} className="text-primary" />
                Destaque da Biblioteca
              </h3>
              <div className="text-left py-2 border-l-2 border-primary pl-4">
                <div className="text-white font-bold text-sm">Algoritmo de Shor</div>
                <p className="text-[11px] text-theme-text-muted mt-1 leading-relaxed">Capaz de fatorar números inteiros exponencialmente mais rápido que qualquer algoritmo clássico conhecido.</p>
              </div>
              <Button onClick={() => loadAlgorithm('shor')} className="mt-6 w-full py-3 rounded-xl bg-white/5 hover:bg-primary hover:text-white border-white/10 text-white font-bold transition-all">
                Abrir no Studio
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

