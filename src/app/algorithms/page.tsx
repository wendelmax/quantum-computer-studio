import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faFilter, faDownload, faPlay, faExternalLinkAlt, faMicrochip, faBrain, faCommentDots } from '@fortawesome/free-solid-svg-icons'
import { getPreset } from './services/presets'
import AlgorithmCard from './components/AlgorithmCard'
import AlgorithmRunner from './components/AlgorithmRunner'
import ResultChart from './components/ResultChart'
import ComplexityComparison from './components/ComplexityComparison'
import AlgorithmCircuits from './components/AlgorithmCircuits'
import ExecutionHistory from './components/ExecutionHistory'
import TrainingChart from '../../components/TrainingChart'
import { runSimulation } from '../circuits/services/simulator'
import type { Algorithm } from 'quantum-computer-js'
import { QUANTUM_ALGORITHM_EXECUTION } from '../../lib/events'
import { useQuantumStore } from '../../store/quantumStore'
import { useTranslation } from 'react-i18next'
import type { Circuit } from 'quantum-computer-js'
import list from './data/algorithms-list.json'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { downloadFile, probabilitiesToCSV } from '../../lib/exportUtils'

const difficulties = ['all', 'beginner', 'intermediate', 'advanced']

export default function AlgorithmsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setCircuit = useQuantumStore(state => state.setCircuit)
  const [current, setCurrent] = useState<string | null>(null)
  const [chart, setChart] = useState<Record<string, number> | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [showResultExport, setShowResultExport] = useState(false)
  const [trainingData, setTrainingData] = useState<{ iteration: number, cost: number }[]>([])
  const resultExportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showResultExport) return
    const handleClickOutside = (e: MouseEvent) => {
      if (resultExportRef.current && !resultExportRef.current.contains(e.target as Node)) setShowResultExport(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showResultExport])

  const categoriesKeys: Record<string, string> = {
    'Search': 'search',
    'Deutsch Family': 'deutsch',
    'Hidden Subgroup': 'hidden',
    'Cryptography': 'crypto',
    'Transform': 'transform',
    'Phase Estimation': 'phase',
    'Optimization': 'optimization',
    'Chemistry': 'chemistry'
  }

  const categories = useMemo(() => ['all', ...Array.from(new Set(list.map((a: Algorithm) => a.category).filter(Boolean)))] as string[], [])

  const filteredAlgorithms = useMemo(() => {
    return list.filter((alg: Algorithm) => {
      const matchesSearch = !searchTerm || alg.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || alg.category === selectedCategory
      const matchesDifficulty = selectedDifficulty === 'all' || alg.difficulty?.toLowerCase() === selectedDifficulty
      return matchesSearch && matchesCategory && matchesDifficulty
    }) as Algorithm[]
  }, [searchTerm, selectedCategory, selectedDifficulty])

  function loadIntoStudio(id: string) {
    const preset = getPreset(id)
    setCurrent(id)
    setCircuit(preset as Circuit, true)

    const startTime = performance.now()

    if (id === 'vqe' || id === 'qaoa') {
      const data = Array.from({ length: 20 }, (_, i) => ({
        iteration: i + 1,
        cost: Math.exp(-i / 5) * (id === 'vqe' ? -1.5 : 2.0) + (Math.random() - 0.5) * 0.1
      }))
      setTrainingData(data)
    } else {
      setTrainingData([])
    }

    runSimulation(preset).then(res => {
      setChart(res.probabilities)
      const endTime = performance.now()
      const executionTime = endTime - startTime
      const states = Object.keys(res.probabilities).length
      window.dispatchEvent(new CustomEvent(QUANTUM_ALGORITHM_EXECUTION, {
        detail: { algorithm: id, executionTime, states }
      }))
    }).catch(() => setChart(undefined))
  }

  function openInStudio(id: string) {
    const preset = getPreset(id)
    setCircuit(preset as Circuit, true)
    navigate('/circuits')
  }

  return (
    <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="lg:col-span-8 flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                   <FontAwesomeIcon icon={faPlay} className="text-xl text-primary" />
                </div>
                <h2 className="text-3xl font-black text-theme-text tracking-tight uppercase">{t('algorithms.title')}</h2>
            </div>
            <p className="text-sm font-medium text-theme-text-muted opacity-60 ml-1">
               {t('algorithms.library_desc')}
            </p>
          </div>
          <Button onClick={() => navigate('/circuits')} variant="primary" className="rounded-2xl px-8 shadow-2xl shadow-primary/30 border border-primary/40">
             <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-2 text-xs" />
             {t('algorithms.open_studio')}
          </Button>
        </div>

        <Card className="p-2 bg-theme-surface/30 border-primary/5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative group">
              <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-muted group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder={t('algorithms.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-theme-border/10 border border-theme-border/30 focus:border-primary/50 focus:ring-8 focus:ring-primary/5 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-theme-text outline-none transition-all"
              />
            </div>
            
            <div className="flex gap-2 p-1 bg-theme-border/20 rounded-2xl border border-theme-border/50">
              {difficulties.map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                    selectedDifficulty === diff
                      ? 'bg-theme-surface text-primary shadow-sm border border-primary/10'
                      : 'text-theme-text-muted hover:text-theme-text'
                  }`}
                >
                  {diff === 'all' ? t('gates_lib.categories.all') : t(`algorithms.difficulty_${diff}`)}
                </button>
              ))}
            </div>

            <div className="relative min-w-[200px]">
              <FontAwesomeIcon icon={faFilter} className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-muted" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-full bg-theme-border/10 border border-theme-border/30 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-theme-text appearance-none outline-none focus:border-primary/50 uppercase tracking-tighter"
              >
                <option value="all">{t('gates_lib.categories.all')}</option>
                {categories.filter(c => c !== 'all').map(cat => (
                  <option key={cat} value={cat} className="bg-bg text-theme-text">{t(`algorithms.categories.${categoriesKeys[cat] || cat.toLowerCase()}`)}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredAlgorithms.map((a) => (
            <AlgorithmCard key={a.id} algorithm={a} onRun={() => loadIntoStudio(a.id)} onOpenInStudio={openInStudio} />
          ))}
        </div>

        <div className="mt-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/5" />
            <h3 className="text-xs font-black text-theme-text-muted uppercase tracking-[0.3em]">{t('algorithms.specialized_title')}</h3>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'oracles', path: '/oracles', icon: faMicrochip, color: 'text-blue-400', bg: 'bg-blue-400/10' },
              { id: 'qml', path: '/qml-hub', icon: faBrain, color: 'text-purple-400', bg: 'bg-purple-400/10' },
              { id: 'qnlp', path: '/qnlp', icon: faCommentDots, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => navigate(m.path)}
                className="group flex flex-col items-center justify-center p-6 rounded-3xl bg-theme-surface/40 border border-theme-border/30 hover:border-primary/50 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className={`w-14 h-14 rounded-2xl ${m.bg} ${m.color} flex items-center justify-center mb-4 border border-current/10 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <FontAwesomeIcon icon={m.icon} className="text-xl" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-theme-text mb-1">{t(`nav.${m.id === 'qml' ? 'qml_hub' : m.id}`)}</span>
                <p className="text-[9px] text-theme-text-muted font-medium opacity-60 leading-tight">
                  {t(`algorithms.specialized_${m.id}_desc`)}
                </p>
              </button>
            ))}
          </div>
        </div>

        </div>

      <div className="lg:col-span-4 flex flex-col gap-8">
        <Card title={t('algorithms.details_title')} className="sticky top-6">
          {current ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="p-5 rounded-2xl bg-theme-border/20 border border-theme-border/50 shadow-inner">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-theme-text-muted mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  {t('algorithms.desc_title')}
                </h3>
                <p className="text-sm text-theme-text leading-relaxed italic opacity-80">
                  {t(`algorithms.items.${current}`, { defaultValue: 'Quantum algorithm template for advanced research and simulation.' })}
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => openInStudio(current)} variant="primary" className="flex-1 py-3 rounded-2xl shadow-xl shadow-primary/20">
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-2 text-xs" />
                  {t('algorithms.open_studio_btn')}
                </Button>
                <Button variant="secondary" onClick={() => navigate('/docs')} className="px-6 rounded-2xl opacity-60 hover:opacity-100 border-theme-border/50">
                  {t('algorithms.view_docs')}
                </Button>
              </div>

              <div className="space-y-8 pt-4 border-t border-white/5">
                <AlgorithmRunner algorithm={current} />
                {trainingData.length > 0 && (
                  <TrainingChart data={trainingData} title={`${current.toUpperCase()} ${t('qml.stats_title')}`} />
                )}
                <ComplexityComparison
                  algorithmName={current}
                  quantumComplexity={list.find((a: any) => a.id === current)?.complexity}
                  classicalComplexity={list.find((a: any) => a.id === current)?.classicalComplexity}
                />
                <AlgorithmCircuits algorithmId={current} />
              </div>
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 opacity-40 grayscale">
              <div className="w-20 h-20 rounded-3xl bg-theme-border/30 flex items-center justify-center mb-2 border border-theme-border/20">
                <FontAwesomeIcon icon={faPlay} className="text-3xl" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest max-w-[200px] leading-relaxed">
                {t('algorithms.select_to_view')}
              </p>
            </div>
          )}
        </Card>

        <div className="relative group" ref={resultExportRef}>
          <ResultChart data={chart} />
          {chart && Object.keys(chart).length > 0 && (
            <div className="absolute top-6 right-6 group-hover:block transition-all">
              <Button variant="secondary" className="text-[10px] py-1.5 px-4 bg-theme-surface/90 backdrop-blur border-theme-border/50 font-bold uppercase tracking-wider" onClick={() => setShowResultExport(!showResultExport)}>
                <FontAwesomeIcon icon={faDownload} className="mr-2 opacity-70" />
                {t('studio.export_btn')}
              </Button>
              {showResultExport && (
                <div className="absolute right-0 top-full mt-2 z-10 bg-theme-surface border border-theme-border/50 rounded-2xl p-2 shadow-2xl min-w-[160px] animate-in zoom-in-95 duration-200">
                  <button onClick={() => { downloadFile(JSON.stringify(chart, null, 2), 'algorithm-result.json', 'application/json'); setShowResultExport(false) }} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider hover:bg-primary/10 hover:text-primary rounded-xl transition-colors">JSON Format</button>
                  <button onClick={() => { downloadFile(probabilitiesToCSV(chart), 'algorithm-result.csv', 'text/csv'); setShowResultExport(false) }} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider hover:bg-primary/10 hover:text-primary rounded-xl transition-colors">CSV Spreadsheet</button>
                </div>
              )}
            </div>
          )}
        </div>

        <ExecutionHistory />

        <Card className="p-6 border-theme-border/20 bg-theme-surface/20">
           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-theme-text-muted flex items-center gap-2">
              <span className="w-1 h-3 bg-primary rounded-full" />
              {t('algorithms.about_title')}
           </h4>
           <div className="text-xs text-theme-text-muted space-y-4 font-medium leading-relaxed">
            <p>
              {t('algorithms.about_desc1')}
            </p>
            <div className="p-4 rounded-2xl bg-theme-border/20 border border-theme-border/50 shadow-inner">
              <strong className="text-theme-text block mb-3 text-[9px] font-black uppercase tracking-widest opacity-60">{t('algorithms.complexity_title')}</strong>
              <div className="flex justify-between mt-2 border-b border-theme-border/20 pb-2">
                 <span className="font-bold">{t('algorithms.classical_label')}</span>
                 <span className="font-mono text-[10px] text-theme-text font-bold uppercase tracking-tighter">O(N)</span>
              </div>
              <div className="flex justify-between pt-2">
                 <span className="font-bold">{t('algorithms.quantum_label')}</span>
                 <span className="font-mono text-[10px] text-primary font-black uppercase tracking-tighter">O(√N)</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
