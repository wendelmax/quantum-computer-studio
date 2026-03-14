import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCube, faInfoCircle, faPlus, faMicrochip, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import Button from '../../components/Button'
import Card from '../../components/Card'
import { useQuantumStore } from '../../store/quantumStore'

type GateInfo = {
  id: string
  symbol: string
  category: 'Pauli' | 'Rotation' | 'Two-qubit'
  matrix: string
}

const GATES_DATA: GateInfo[] = [
  { id: 'hadamard', symbol: 'H', category: 'Pauli', matrix: '½[1 1; 1 -1]' },
  { id: 'pauli_x', symbol: 'X', category: 'Pauli', matrix: '[0 1; 1 0]' },
  { id: 'pauli_y', symbol: 'Y', category: 'Pauli', matrix: '[0 -i; i 0]' },
  { id: 'pauli_z', symbol: 'Z', category: 'Pauli', matrix: '[1 0; 0 -1]' },
  { id: 'cnot', symbol: 'CNOT', category: 'Two-qubit', matrix: '[1 0 0 0; 0 1 0 0; 0 0 0 1; 0 0 1 0]' },
  { id: 'rx', symbol: 'RX', category: 'Rotation', matrix: '[cos(θ/2) -isin(θ/2); -isin(θ/2) cos(θ/2)]' },
  { id: 'ry', symbol: 'RY', category: 'Rotation', matrix: '[cos(θ/2) -sin(θ/2); sin(θ/2) cos(θ/2)]' },
  { id: 'rz', symbol: 'RZ', category: 'Rotation', matrix: '[exp(-iθ/2) 0; 0 exp(iθ/2)]' }
]

export default function GatesLibraryPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedGateId, setSelectedGateId] = useState<string | null>(null)
  
  const storeCircuit = useQuantumStore(state => state.circuit)
  const setStoreCircuit = useQuantumStore(state => state.setCircuit)

  const categories = ['all', 'pauli', 'rotation', 'two_qubit']

  const filteredGates = useMemo(() => {
    return selectedCategory === 'all'
      ? GATES_DATA
      : GATES_DATA.filter(g => g.id === selectedCategory || (g.category.toLowerCase().includes(selectedCategory.replace('_', ''))))
  }, [selectedCategory])

  // Improved filtering logic to match internal category strings
  const displayGates = useMemo(() => {
    if (selectedCategory === 'all') return GATES_DATA
    return GATES_DATA.filter(g => {
        const cat = g.category.toLowerCase()
        if (selectedCategory === 'two_qubit') return cat === 'two-qubit'
        return cat === selectedCategory
    })
  }, [selectedCategory])

  const selectedGateInfo = useMemo(() => 
    selectedGateId ? GATES_DATA.find(g => g.id === selectedGateId) : null
  , [selectedGateId])

  const addToStudio = (symbol: string) => {
    try {
      let circuit
      if (storeCircuit) {
        circuit = JSON.parse(JSON.stringify(storeCircuit))
      } else {
        const rawPrefs = localStorage.getItem('quantum:prefs:numQubits')
        const numQubits = rawPrefs ? parseInt(rawPrefs) : 2
        circuit = { numQubits, gates: [] }
      }

      const newGate: any = { type: symbol, target: 0 }

      if (symbol === 'CNOT') {
        newGate.control = 0
        if (!circuit.numQubits || circuit.numQubits < 2) {
          circuit.numQubits = 2
        }
      }

      circuit.gates.push(newGate)
      setStoreCircuit(circuit as any, false)
      navigate('/circuits')
    } catch {
      navigate('/circuits')
    }
  }

  return (
    <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                   <FontAwesomeIcon icon={faCube} className="text-xl text-primary" />
                </div>
                <h2 className="text-3xl font-black text-theme-text tracking-tight uppercase">{t('gates_lib.title')}</h2>
            </div>
            <p className="text-sm font-medium text-theme-text-muted opacity-60 ml-1">
               {t('gallery.empty_state')}
            </p>
          </div>
          <Button onClick={() => navigate('/circuits')} variant="secondary" className="px-6 py-2.5 rounded-xl border-theme-border/50 hover:border-primary/50 transition-all font-semibold">
             <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-2 text-xs" />
             {t('studio.title')}
          </Button>
        </div>

        <Card className="p-1">
          <div className="flex gap-2 p-1 overflow-x-auto scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-md'
                    : 'text-theme-text-muted hover:text-theme-text hover:bg-theme-border/30'
                }`}
              >
                {t(`gates_lib.categories.${cat}`)}
              </button>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayGates.map(gate => (
            <Card
              key={gate.id}
              className={`group hover:border-primary/50 transition-all duration-300 relative overflow-hidden ${
                selectedGateId === gate.id ? 'ring-2 ring-primary/30 border-primary' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border border-primary/20">
                  {gate.symbol}
                </div>
                <div className="px-2 py-1 rounded-lg bg-theme-border/30 text-[10px] uppercase tracking-wider font-bold text-theme-text-muted">
                  {t(`gates_lib.categories.${gate.category.toLowerCase().replace('-', '_')}`)}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-theme-text mb-1">
                {t(`gates.${gate.id}.title`, { defaultValue: gate.id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') })}
              </h3>
              <p className="text-xs text-theme-text-muted mb-4 line-clamp-2 leading-relaxed h-8">
                {t(`gates.${gate.id}.desc`, { defaultValue: 'Quantum operator' })}
              </p>

              <div className="flex gap-2">
                <Button 
                    variant="secondary" 
                    className="flex-1 text-xs py-2" 
                    onClick={() => setSelectedGateId(gate.id)}
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="mr-1.5 opacity-70" />
                  {t('gates_lib.view_details')}
                </Button>
                <Button 
                    variant="primary" 
                    className="flex-1 text-xs py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white border-primary/20" 
                    onClick={() => addToStudio(gate.symbol)}
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-1.5 opacity-70" />
                  {t('gates_lib.add_to_circuit')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <Card title={t('gates_lib.selected_gate')} className="sticky top-6">
          {selectedGateInfo ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="relative py-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />
                <div className="w-24 h-24 rounded-3xl bg-theme-surface border-2 border-primary/30 shadow-2xl flex items-center justify-center text-4xl font-bold text-primary relative z-10">
                  {selectedGateInfo.symbol}
                </div>
              </div>

              <div className="space-y-2 text-center">
                <h4 className="text-xl font-bold text-theme-text">
                    {t(`gates.${selectedGateInfo.id}.title`)}
                </h4>
                <p className="text-sm text-theme-text-muted leading-relaxed">
                    {t(`gates.${selectedGateInfo.id}.desc`)}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-theme-text-muted uppercase tracking-widest">
                  <FontAwesomeIcon icon={faMicrochip} className="text-primary/60" />
                  {t('gates_lib.matrix_label')}
                </div>
                <div className="p-4 rounded-2xl bg-theme-border/20 border border-theme-border/50 font-mono text-[11px] text-theme-text overflow-x-auto">
                    {selectedGateInfo.matrix}
                </div>
              </div>

              <Button 
                onClick={() => addToStudio(selectedGateInfo.symbol)} 
                className="w-full py-4 rounded-2xl shadow-xl shadow-primary/20"
              >
                {t('gates_lib.add_to_circuit')}
              </Button>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 opacity-60">
              <div className="w-16 h-16 rounded-full bg-theme-border/30 flex items-center justify-center">
                <FontAwesomeIcon icon={faCube} className="text-2xl" />
              </div>
              <p className="text-sm text-theme-text-muted max-w-[200px]">
                {t('gates_lib.click_for_details')}
              </p>
            </div>
          )}
        </Card>

        <Card title={t('gates_lib.quick_ref')}>
          <div className="space-y-4">
            {[
              { s: 'H', d: 'Superposition' },
              { s: 'X/Y/Z', d: 'Pauli gates' },
              { s: 'CNOT', d: 'Control target' },
              { s: 'RX/RY/RZ', d: 'Parametric' }
            ].map((ref, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                 <span className="font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">{ref.s}</span>
                 <span className="text-theme-text-muted">{ref.d}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
