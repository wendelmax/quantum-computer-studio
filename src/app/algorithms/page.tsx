import React, { useState, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faFilter } from '@fortawesome/free-solid-svg-icons'
import { getPreset } from './services/presets'
import AlgorithmCard from './components/AlgorithmCard'
import AlgorithmRunner from './components/AlgorithmRunner'
import ResultChart from './components/ResultChart'
import ComplexityComparison from './components/ComplexityComparison'
import AlgorithmCircuits from './components/AlgorithmCircuits'
import ExecutionHistory from './components/ExecutionHistory'
import { runSimulation } from '../circuits/services/simulator'
import list from './data/algorithms-list.json'
import Card from '../../components/Card'
import Button from '../../components/Button'

type Algorithm = {
  id: string
  name: string
  category?: string
  complexity?: string
  classicalComplexity?: string
  appliedTo?: string
  difficulty?: string
  year?: number
}

export default function AlgorithmsPage() {
  const [current, setCurrent] = useState<string | null>(null)
  const [chart, setChart] = useState<Record<string, number> | undefined>(undefined)
  const [description, setDescription] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All')
  
  const algorithmDescriptions: Record<string, string> = {
    grover: "Grover's algorithm is a quantum search algorithm that finds a target item in an unstructured database in O(√N) queries. Classical algorithms require O(N) queries.",
    'deutsch-jozsa': "The Deutsch-Jozsa algorithm determines if a function is constant or balanced with just one query, demonstrating quantum advantage over classical computing.",
    shor: "Shor's algorithm is designed to factor large integers exponentially faster than classical algorithms, with implications for cryptography.",
    qft: "Quantum Fourier Transform (QFT) is a linear transformation that takes a quantum state and converts it into the frequency domain, fundamental to many algorithms.",
    qpe: "Quantum Phase Estimation is used to estimate the eigenvalue of a unitary operator, crucial for algorithms like Shor's and HHL.",
    'bernstein-vazirani': "The Bernstein-Vazirani algorithm identifies a hidden string using a single query, demonstrating exponential speedup over classical methods for oracle problems.",
    simon: "Simon's algorithm solves the hidden subgroup problem efficiently, providing exponential advantage for finding periodic functions and inspiring Shor's algorithm.",
    qaoa: "Quantum Approximate Optimization Algorithm is a hybrid classical-quantum algorithm for solving combinatorial optimization problems using variational methods.",
    vqe: "Variational Quantum Eigensolver is a quantum-classical hybrid algorithm for finding the ground state energy of molecular systems using quantum circuits."
  }

  const categories = useMemo(() => ['All', ...Array.from(new Set(list.map((a: Algorithm) => a.category)))] as string[], [])
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']

  const filteredAlgorithms = useMemo(() => {
    return list.filter((alg: Algorithm) => {
      const matchesSearch = !searchTerm || alg.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || alg.category === selectedCategory
      const matchesDifficulty = selectedDifficulty === 'All' || alg.difficulty === selectedDifficulty
      return matchesSearch && matchesCategory && matchesDifficulty
    }) as Algorithm[]
  }, [searchTerm, selectedCategory, selectedDifficulty])

  function loadIntoStudio(id: string) {
    const preset = getPreset(id)
    setCurrent(id)
    setDescription(algorithmDescriptions[id] || '')
    try {
      localStorage.setItem('quantum:loadCircuit', JSON.stringify(preset))
      localStorage.setItem('quantum:circuit', JSON.stringify(preset))
      localStorage.setItem('quantum:prefs:numQubits', String(preset.numQubits))
    } catch {}
    try { localStorage.setItem('quantum:autoRun', '1') } catch {}
    try {
      window.dispatchEvent(new CustomEvent('quantum:set-circuit', { detail: { circuit: preset, autoRun: true } }))
    } catch {}
    
    const startTime = performance.now()
    runSimulation(preset as any).then(res => {
      setChart(res.probabilities)
      const endTime = performance.now()
      const executionTime = endTime - startTime
      const states = Object.keys(res.probabilities).length
      
      try {
        window.dispatchEvent(new CustomEvent('quantum:algorithm-execution', { 
          detail: { 
            algorithm: id, 
            executionTime, 
            states 
          } 
        }))
      } catch {}
    }).catch(()=> setChart(undefined))
  }

  return (
    <div className="p-6 grid grid-cols-12 gap-4">
      <div className="col-span-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Quantum Algorithms</h2>
          <Button onClick={() => window.location.href = '/circuits'}>Open Quantum Studio</Button>
        </div>

        <Card>
          <div className="mb-4 relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search algorithms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-10 bg-slate-900 border border-slate-700 rounded text-sm"
            />
          </div>
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 pl-10 bg-slate-900 border border-slate-700 rounded text-sm appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 relative">
              <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 pl-10 bg-slate-900 border border-slate-700 rounded text-sm appearance-none"
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card title={`Algorithm Library (${filteredAlgorithms.length})`} description="Select an algorithm to run and visualize">
          <div className="grid grid-cols-2 gap-4">
            {filteredAlgorithms.map((a) => (
              <AlgorithmCard key={a.id} algorithm={a} onRun={() => loadIntoStudio(a.id)} />
            ))}
          </div>
        </Card>

        {current && description && (
          <Card title="Algorithm Description">
            <p className="text-sm text-slate-300">{description}</p>
            <div className="mt-3 flex gap-2">
              <Button onClick={() => window.location.href = '/circuits'}>
                Open in Studio
              </Button>
              <Button variant="secondary" onClick={() => window.location.href = '/docs'}>
                View Documentation
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div className="col-span-4 flex flex-col gap-4">
        {current ? (
          <>
            <AlgorithmRunner algorithm={current} />
            <ComplexityComparison
              algorithmName={current}
              quantumComplexity={list.find((a: Algorithm) => a.id === current)?.complexity}
              classicalComplexity={list.find((a: Algorithm) => a.id === current)?.classicalComplexity}
            />
            <AlgorithmCircuits algorithmId={current} />
          </>
        ) : null}
        <ResultChart data={chart} />
        
        <ExecutionHistory />
        
        <Card title="About Quantum Algorithms">
          <div className="text-xs text-slate-300 space-y-2">
            <p>
              Quantum algorithms leverage superposition and entanglement to solve problems 
              exponentially faster than classical computers for specific tasks.
            </p>
            <p>
              <strong>Time Complexity:</strong>
              <br />
              • Classical: O(N)
              <br />
              • Quantum: O(√N) for search
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
