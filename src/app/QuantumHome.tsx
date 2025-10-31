import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFlask, faChartLine, faChartBar, faHashtag, faCircle, faBook, faTerminal, faBox, faDesktop, faLayerGroup, faUndo } from '@fortawesome/free-solid-svg-icons'
import { getPreset } from './algorithms/services/presets'
import { runSimulation } from './circuits/services/simulator'

export default function QuantumHome() {
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
    } catch {}
    setTimeout(() => setIsRunningDemo(false), 300)
  }

  const loadAlgorithm = (id: string) => {
    const preset = getPreset(id)
    try {
      localStorage.setItem('quantum:loadCircuit', JSON.stringify(preset))
      localStorage.setItem('quantum:circuit', JSON.stringify(preset))
      localStorage.setItem('quantum:prefs:numQubits', String(preset.numQubits))
    } catch {}
    window.dispatchEvent(new CustomEvent('quantum:set-circuit', { detail: { circuit: preset, autoRun: true } }))
    window.location.href = '/circuits'
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
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8 space-y-4">
        <section className="rounded-xl p-0 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 overflow-hidden">
          <header className="h-12 px-4 border-b border-slate-700 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-sky-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Welcome to Quantum Computer JS</h3>
              <p className="text-xs text-slate-400">Interactive quantum computing simulator</p>
            </div>
          </header>
          <div className="p-4 grid grid-cols-3 gap-3">
            <Link to="/circuits" className="group p-4 rounded-lg bg-slate-900/40 border border-slate-700 hover:border-sky-500 hover:bg-sky-500/10 transition-all cursor-pointer">
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform"><FontAwesomeIcon icon={faFlask} /></div>
              <div className="font-medium text-sm mb-1">Quantum Studio</div>
              <div className="text-xs text-slate-400">Build & simulate</div>
            </Link>
            <Link to="/algorithms" className="group p-4 rounded-lg bg-slate-900/40 border border-slate-700 hover:border-green-500 hover:bg-green-500/10 transition-all cursor-pointer">
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform"><FontAwesomeIcon icon={faChartLine} /></div>
              <div className="font-medium text-sm mb-1">Algorithms</div>
              <div className="text-xs text-slate-400">Run algorithms</div>
            </Link>
            <Link to="/data-lab" className="group p-4 rounded-lg bg-slate-900/40 border border-slate-700 hover:border-purple-500 hover:bg-purple-500/10 transition-all cursor-pointer">
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform"><FontAwesomeIcon icon={faChartBar} /></div>
              <div className="font-medium text-sm mb-1">Data Lab</div>
              <div className="text-xs text-slate-400">Explore data</div>
            </Link>
          </div>
        </section>

        <section className="rounded-xl p-0 bg-bg-card border border-slate-800/60 overflow-hidden">
          <header className="h-10 px-4 border-b border-slate-800 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2"><span className="text-sky-300">◦</span> <span className="font-medium">Live Demo: Grover's Algorithm</span></div>
            {isRunningDemo && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
          </header>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2 mb-3">
              {Object.entries(demoProbabilities).slice(0, 8).map(([state, prob]) => (
                <div 
                  key={state}
                  className={`p-3 rounded border-2 transition-all ${
                    state === maxProbKey 
                      ? 'border-cyan-500 bg-cyan-500/10 scale-105' 
                      : 'border-slate-700 bg-slate-900/20'
                  }`}
                >
                  <div className="text-xs text-slate-400 mb-1">|{state}⟩</div>
                  <div className="text-lg font-mono text-sky-300">{prob > 0.01 ? (prob * 100).toFixed(0) : '0'}%</div>
                  <div className="h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-cyan-400 transition-all duration-500"
                      style={{ width: `${prob * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-slate-500 italic">Algorithm successfully finds the target state |{maxProbKey}⟩</div>
          </div>
        </section>

        <section className="rounded-xl p-0 bg-bg-card border border-slate-800/60 overflow-hidden">
          <header className="h-10 px-4 border-b border-slate-800 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2"><span className="text-sky-300">◦</span> <span className="font-medium">Quantum vs Classical</span></div>
          </header>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="border border-red-700/50 rounded-lg p-3 bg-red-950/20">
                <div className="text-xs font-medium text-red-400 mb-2">CLASSICAL</div>
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span>•</span>
                    <span>1 bit = 0 or 1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>•</span>
                    <span>Sequential processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>•</span>
                    <span>Copy & measure freely</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>•</span>
                    <span>Stable states</span>
                  </div>
                </div>
              </div>
              <div className="border border-cyan-700/50 rounded-lg p-3 bg-cyan-950/20">
                <div className="text-xs font-medium text-cyan-400 mb-2">QUANTUM</div>
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span>•</span>
                    <span>1 qubit = both 0 & 1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>•</span>
                    <span>Parallel processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>•</span>
                    <span>Cannot clone (no-clone)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>•</span>
                    <span>Fragile superposition</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-3">
              <div className="text-xs text-slate-400 mb-2">Exponential Advantage:</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-slate-900/30 rounded text-center hover:bg-slate-900/50 transition-colors">
                  <div className="text-slate-500">10 qubits</div>
                  <div className="text-sky-300 font-mono text-base">1,024</div>
                  <div className="text-slate-500 text-[10px]">states</div>
                </div>
                <div className="p-2 bg-slate-900/30 rounded text-center hover:bg-slate-900/50 transition-colors">
                  <div className="text-slate-500">20 qubits</div>
                  <div className="text-sky-300 font-mono text-base">1.05M</div>
                  <div className="text-slate-500 text-[10px]">states</div>
                </div>
                <div className="p-2 bg-slate-900/30 rounded text-center hover:bg-slate-900/50 transition-colors">
                  <div className="text-slate-500">30 qubits</div>
                  <div className="text-sky-300 font-mono text-base">1.07B</div>
                  <div className="text-slate-500 text-[10px]">states</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl p-0 bg-bg-card border border-slate-800/60 overflow-hidden">
          <header className="h-10 px-4 border-b border-slate-800 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2"><span className="text-sky-300">◦</span> <span className="font-medium">Popular Algorithms</span></div>
            <Link to="/algorithms" className="text-xs text-sky-400 hover:text-sky-300">View all →</Link>
          </header>
          <div className="divide-y divide-slate-800">
            {algorithms.map((item, idx) => (
              <button
                key={item.id}
                className="w-full px-4 py-3 text-sm flex items-center justify-between hover:bg-slate-900/20 cursor-pointer group transition-colors"
                onClick={() => loadAlgorithm(item.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-8 rounded-full ${item.color} group-hover:scale-y-125 transition-transform`} />
                  <div className="text-left">
                    <div className="text-slate-200 font-medium group-hover:text-sky-300 transition-colors">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.description}</div>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:translate-x-1 transition-transform">›</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl p-3 bg-bg-card border border-slate-800/60">
          <div className="flex items-center gap-3 text-slate-300 flex-wrap">
            <Link to="/circuits" className="px-3 py-2 rounded hover:bg-slate-800/40 hover:text-sky-300 transition-colors"><FontAwesomeIcon icon={faDesktop} className="inline mr-1" /> Studio</Link>
            <Link to="/algorithms" className="px-3 py-2 rounded hover:bg-slate-800/40 hover:text-sky-300 transition-colors"><FontAwesomeIcon icon={faLayerGroup} className="inline mr-1" /> Algorithms</Link>
            <Link to="/state-viewer" className="px-3 py-2 rounded hover:bg-slate-800/40 hover:text-sky-300 transition-colors"><FontAwesomeIcon icon={faUndo} className="inline mr-1" /> States</Link>
            <Link to="/gates" className="px-3 py-2 rounded hover:bg-slate-800/40 hover:text-sky-300 transition-colors"><FontAwesomeIcon icon={faHashtag} className="inline mr-1" /> Gates</Link>
            <Link to="/oracles" className="px-3 py-2 rounded hover:bg-slate-800/40 hover:text-sky-300 transition-colors"><FontAwesomeIcon icon={faCircle} className="inline mr-1" /> Oracles</Link>
            <Link to="/docs" className="px-3 py-2 rounded hover:bg-slate-800/40 hover:text-sky-300 transition-colors"><FontAwesomeIcon icon={faBook} className="inline mr-1" /> Docs</Link>
            <Link to="/api" className="px-3 py-2 rounded hover:bg-slate-800/40 hover:text-sky-300 transition-colors"><FontAwesomeIcon icon={faTerminal} className="inline mr-1" /> API</Link>
          </div>
        </section>
      </div>

      <div className="col-span-4 space-y-4">
        <section className="rounded-xl p-0 bg-bg-card border border-slate-800/60 overflow-hidden">
          <header className="h-10 px-4 border-b border-slate-800 flex items-center text-sm">
            <div className="flex items-center gap-2"><span className="text-sky-300">◦</span> <span className="font-medium">Bloch Sphere</span></div>
          </header>
          <div className="p-4">
            <div className="h-48 rounded-md bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center relative overflow-hidden">
              <svg width="160" height="160" viewBox="0 0 200 200" className="absolute">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#475569" strokeWidth="2" opacity="0.3" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="#475569" strokeWidth="1" opacity="0.2" />
                <circle cx="100" cy="100" r="40" fill="none" stroke="#475569" strokeWidth="1" opacity="0.1" />
                <line x1="100" y1="20" x2="100" y2="180" stroke="#64748b" strokeWidth="1" opacity="0.3" />
                <line x1="20" y1="100" x2="180" y2="100" stroke="#64748b" strokeWidth="1" opacity="0.3" />
                <circle cx="100" cy="100" r="3" fill="#06b6d4">
                  <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
                </circle>
                <line x1="100" y1="100" x2="140" y2="70" stroke="#06b6d4" strokeWidth="2" opacity="0.6">
                  <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
                </line>
              </svg>
            </div>
            <div className="mt-2 text-center">
              <div className="text-slate-300 text-sm font-medium">Superposition State</div>
              <div className="text-xs text-slate-500 mt-1">|Ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)·sin(θ/2)|1⟩</div>
            </div>
          </div>
        </section>

        <section className="rounded-xl p-0 bg-bg-card border border-slate-800/60 overflow-hidden">
          <header className="h-10 px-4 border-b border-slate-800 flex items-center text-sm">
            <div className="flex items-center gap-2"><span className="text-sky-300">◦</span> <span className="font-medium">Statistics</span></div>
          </header>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-500 mb-1">Total Gates</div>
                <div className="text-xl font-mono text-sky-300">8</div>
              </div>
              <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-500 mb-1">Algorithms</div>
                <div className="text-xl font-mono text-green-300">9</div>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-700/30">
              <div className="text-xs text-purple-400 mb-1">Max Qubits</div>
              <div className="text-xl font-mono text-purple-300">16</div>
            </div>
          </div>
        </section>

        <section className="rounded-xl p-0 bg-bg-card border border-slate-800/60 overflow-hidden">
          <header className="h-10 px-4 border-b border-slate-800 flex items-center text-sm">
            <div className="flex items-center gap-2"><span className="text-sky-300">◦</span> <span className="font-medium">Quick Links</span></div>
          </header>
          <div className="p-4 space-y-2">
            <a href="https://github.com/wendelmax/quantum-computer-js" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800/40 transition-colors text-sm text-slate-300 hover:text-sky-300">
              <FontAwesomeIcon icon={faBox} />
              <span>GitHub Repository</span>
              <span className="ml-auto text-xs">→</span>
            </a>
            <Link to="/docs" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800/40 transition-colors text-sm text-slate-300 hover:text-sky-300">
              <FontAwesomeIcon icon={faBook} />
              <span>Documentation</span>
              <span className="ml-auto text-xs">→</span>
            </Link>
            <Link to="/api" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800/40 transition-colors text-sm text-slate-300 hover:text-sky-300">
              <FontAwesomeIcon icon={faTerminal} />
              <span>API Terminal</span>
              <span className="ml-auto text-xs">→</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

