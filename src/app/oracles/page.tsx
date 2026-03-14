import React, { useState, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faFilter, faMicrochip, faTerminal, faPlay, faChartBar, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { runSimulation } from '../circuits/services/simulator'
import { getOracle } from './services/oracles'
import { useTranslation } from 'react-i18next'
import { useQuantumStore } from '../../store/quantumStore'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Card from '../../components/Card'
import list from './data/oracles.json'

type Oracle = {
  id: string
  name: string
  type: 'constant' | 'balanced' | 'custom'
  qubits: number
  description: string
}

export default function OraclesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setCircuit = useQuantumStore(state => state.setCircuit)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedOracle, setSelectedOracle] = useState<Oracle | null>(null)
  const [results, setResults] = useState<{ type: string, probability: number } | null>(null)
  const [running, setRunning] = useState(false)

  const oracles = list as Oracle[]

  const filteredOracles = useMemo(() => {
    return oracles.filter(o => {
      const matchesSearch = o.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === 'all' || o.type === selectedType
      return matchesSearch && matchesType
    })
  }, [searchTerm, selectedType, oracles])

  async function testOracle(oracle: Oracle) {
    setRunning(true)
    setSelectedOracle(oracle)
    try {
      const circuit = getOracle(oracle.id)
      const res = await runSimulation(circuit)
      const outcomes = Object.keys(res.probabilities)
      const isBalanced = outcomes.length > 1 || (outcomes.length === 1 && res.probabilities[outcomes[0]] < 0.99)
      
      setResults({
        type: isBalanced ? 'balanced' : 'constant',
        probability: 100
      })
    } catch (err) {
      console.error(err)
      setResults(null)
    } finally {
      setRunning(false)
    }
  }

  function loadIntoStudio(id: string) {
    const circuit = getOracle(id)
    setCircuit(circuit as any, true)
    navigate('/circuits')
  }

  return (
    <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                   <FontAwesomeIcon icon={faMicrochip} className="text-xl text-primary" />
                </div>
                <h2 className="text-3xl font-black text-theme-text tracking-tight uppercase">{t('oracles.title')}</h2>
            </div>
            <p className="text-sm font-medium text-theme-text-muted opacity-60 ml-1">
               {t('oracles.desc')}
            </p>
          </div>
          <Button onClick={() => navigate('/circuits')} variant="secondary" className="px-6 py-2.5 rounded-xl border-theme-border/50 hover:border-primary/50 transition-all font-semibold">
             {t('studio.title')}
          </Button>
        </div>

        <Card className="p-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative group">
              <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-muted group-focus-within:text-primary transition-colors duration-200" />
              <input
                type="text"
                placeholder={t('oracles.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-theme-border/20 border border-theme-border/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-theme-text placeholder:text-theme-text-muted transition-all duration-300 outline-none"
              />
            </div>
            <div className="flex gap-2 p-1 bg-theme-border/20 rounded-2xl border border-theme-border/50">
              {['all', 'constant', 'balanced'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    selectedType === type
                      ? 'bg-theme-surface text-primary shadow-sm'
                      : 'text-theme-text-muted hover:text-theme-text'
                  }`}
                >
                  {type === 'all' ? t('gates_lib.categories.all') : t(`oracles.${type}`)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredOracles.map((oracle) => (
            <Card 
              key={oracle.id} 
              className={`group hover:border-primary/50 transition-all duration-300 relative overflow-hidden ${
                selectedOracle?.id === oracle.id ? 'ring-2 ring-primary/30 border-primary' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 transition-transform group-hover:scale-110 duration-500">
                  <FontAwesomeIcon icon={faTerminal} />
                </div>
                <div className={`px-2 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold shadow-sm ${
                    oracle.type === 'constant' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                    oracle.type === 'balanced' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 
                    'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}>
                    {t(`oracles.${oracle.type}`)}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-theme-text mb-1 tracking-tight">
                {oracle.name}
              </h3>
              <p className="text-xs text-theme-text-muted mb-6 leading-relaxed line-clamp-2 h-8">
                {oracle.description}
              </p>

              <div className="flex gap-2">
                <Button 
                    variant="primary" 
                    className="flex-1 text-xs py-2.5 shadow-lg shadow-primary/10" 
                    onClick={() => testOracle(oracle)}
                >
                  <FontAwesomeIcon icon={faPlay} className="mr-2 text-[10px]" />
                  {t('common.start_now')}
                </Button>
                <Button 
                    variant="secondary" 
                    className="flex-1 text-xs py-2.5 bg-theme-border/20 border-theme-border/50 hover:border-primary/50" 
                    onClick={() => loadIntoStudio(oracle.id)}
                >
                  {t('home.open_studio')}
                </Button>
              </div>

              {/* Decorative background element */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
            </Card>
          ))}
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <Card title={t('oracles.details_title')} className="sticky top-6">
          {selectedOracle ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="p-4 rounded-2xl bg-theme-border/20 border border-theme-border/50">
                 <div className="text-xs font-bold text-theme-text-muted uppercase tracking-widest mb-1">{t('common.docs')}</div>
                 <div className="text-lg font-bold text-theme-text">{selectedOracle.name}</div>
                 <div className="text-sm text-theme-text-muted mt-2 leading-relaxed">{selectedOracle.description}</div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-theme-text-muted uppercase tracking-widest">
                  <FontAwesomeIcon icon={faChartBar} className="text-primary/60" />
                  {t('oracles.test_results')}
                </div>
                
                {running ? (
                  <div className="flex items-center justify-center py-12 gap-3 text-theme-text-muted animate-pulse">
                    <FontAwesomeIcon icon={faTerminal} className="animate-bounce" />
                    <span className="text-sm font-medium">{t('oracles.running')}</span>
                  </div>
                ) : results ? (
                  <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-theme-text-muted">{t('oracles.details_title')}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary uppercase tracking-tighter">
                            {results.probability}% Accuracy
                        </span>
                    </div>
                    <div className="text-xl font-bold text-theme-text text-center py-4 border-y border-theme-border/50">
                        {results.type === 'constant' ? t('oracles.result_constant') : t('oracles.result_balanced')}
                    </div>
                    <div className="flex justify-center">
                        <Button 
                            variant="primary" 
                            className="bg-primary/20 text-primary hover:bg-primary hover:text-white border-primary/20 text-xs py-2 px-6 rounded-xl"
                            onClick={() => loadIntoStudio(selectedOracle.id)}
                        >
                            Open in Sandbox
                        </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center justify-center text-center opacity-60">
                    <FontAwesomeIcon icon={faPlay} className="text-2xl text-theme-text-muted mb-3" />
                    <p className="text-xs text-theme-text-muted">{t('oracles.select_to_test')}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 opacity-60 font-medium">
               <div className="w-16 h-16 rounded-full bg-theme-border/30 flex items-center justify-center">
                  <FontAwesomeIcon icon={faMicrochip} className="text-2xl" />
               </div>
               <p className="text-xs text-theme-text-muted max-w-[180px]">
                  {t('oracles.select_to_test')}
               </p>
            </div>
          )}
        </Card>

        <Card title={t('oracles.about_title')}>
           <div className="space-y-4">
              <div className="flex gap-3 items-start">
                 <FontAwesomeIcon icon={faInfoCircle} className="text-primary mt-1" />
                 <p className="text-xs leading-relaxed text-theme-text-muted">
                    {t('oracles.about_desc')}
                 </p>
              </div>
              <div className="p-3 rounded-xl bg-theme-border/20 border border-theme-border/50 text-[10px] font-mono text-theme-text-muted leading-relaxed italic">
                 "Oracles are essential in quantum speedups, allowing us to identify properties of functions with fewer queries than classical bits."
              </div>
           </div>
        </Card>
      </div>
    </div>
  )
}
