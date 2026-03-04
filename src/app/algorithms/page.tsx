import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faFilter, faDownload } from '@fortawesome/free-solid-svg-icons'
import { getPreset } from './services/presets'
import AlgorithmCard from './components/AlgorithmCard'
import AlgorithmRunner from './components/AlgorithmRunner'
import ResultChart from './components/ResultChart'
import ComplexityComparison from './components/ComplexityComparison'
import AlgorithmCircuits from './components/AlgorithmCircuits'
import ExecutionHistory from './components/ExecutionHistory'
import TrainingChart from '../../components/TrainingChart'
import { runSimulation } from '../circuits/services/simulator'
import type { Algorithm } from '../../types/Algorithm'
import { setItem } from '../../lib/safeStorage'
import { QUANTUM_SET_CIRCUIT, QUANTUM_ALGORITHM_EXECUTION } from '../../lib/events'
import list from './data/algorithms-list.json'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { downloadFile, probabilitiesToCSV } from '../../lib/exportUtils'

export default function AlgorithmsPage() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState<string | null>(null)
  const [chart, setChart] = useState<Record<string, number> | undefined>(undefined)
  const [description, setDescription] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All')
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

  const categories = useMemo(() => ['All', ...Array.from(new Set(list.map((a: Algorithm) => a.category).filter(Boolean)))] as string[], [])
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
    setItem('quantum:loadCircuit', JSON.stringify(preset))
    setItem('quantum:circuit', JSON.stringify(preset))
    setItem('quantum:prefs:numQubits', String(preset.numQubits))
    setItem('quantum:autoRun', '1')
    window.dispatchEvent(new CustomEvent(QUANTUM_SET_CIRCUIT, { detail: { circuit: preset, autoRun: true } }))

    const startTime = performance.now()

    // Simulate training data for variational algorithms
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
    setItem('quantum:loadCircuit', JSON.stringify(preset))
    setItem('quantum:circuit', JSON.stringify(preset))
    setItem('quantum:prefs:numQubits', String(preset.numQubits))
    setItem('quantum:autoRun', '1')
    window.dispatchEvent(new CustomEvent(QUANTUM_SET_CIRCUIT, { detail: { circuit: preset, autoRun: true } }))
    navigate('/circuits')
  }

  return (
    <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-theme-text">Quantum Algorithms</h2>
          <Button onClick={() => navigate('/circuits')}>Open Quantum Studio</Button>
        </div>

        <Card>
          <div className="mb-4 relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted text-sm" />
            <input
              type="text"
              placeholder="Search algorithms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-10 rounded text-sm"
            />
          </div>
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted text-sm" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 pl-10 rounded text-sm appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 relative">
              <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted text-sm" />
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 pl-10 rounded text-sm appearance-none"
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card title={`Algorithm Library (${filteredAlgorithms.length})`} description="Select an algorithm to run and visualize">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredAlgorithms.map((a) => (
              <AlgorithmCard key={a.id} algorithm={a} onRun={() => loadIntoStudio(a.id)} onOpenInStudio={openInStudio} />
            ))}
          </div>
        </Card>

        {current && description && (
          <Card title="Algorithm Description">
            <p className="text-sm text-theme-text">{description}</p>
            <div className="mt-3 flex gap-2">
              <Button onClick={() => navigate('/circuits')}>
                Open in Studio
              </Button>
              <Button variant="secondary" onClick={() => navigate('/docs')}>
                View Documentation
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div className="lg:col-span-4 flex flex-col gap-4">
        {current ? (
          <>
            <AlgorithmRunner algorithm={current} />
            {trainingData.length > 0 && (
              <TrainingChart data={trainingData} title={`${current.toUpperCase()} Training Progress`} />
            )}
            <ComplexityComparison
              algorithmName={current}
              quantumComplexity={list.find((a: Algorithm) => a.id === current)?.complexity}
              classicalComplexity={list.find((a: Algorithm) => a.id === current)?.classicalComplexity}
            />
            <AlgorithmCircuits algorithmId={current} />
          </>
        ) : null}
        <div className="relative" ref={resultExportRef}>
          <ResultChart data={chart} />
          {chart && Object.keys(chart).length > 0 && (
            <div className="absolute top-2 right-2">
              <Button variant="secondary" className="text-xs" onClick={() => setShowResultExport(!showResultExport)}>
                <FontAwesomeIcon icon={faDownload} className="mr-1" />
                Export
              </Button>
              {showResultExport && (
                <div className="absolute right-0 top-full mt-1 z-10 bg-theme-surface border border-theme-border rounded-lg p-2 shadow-lg min-w-32">
                  <button onClick={() => { downloadFile(JSON.stringify(chart, null, 2), 'algorithm-result.json', 'application/json'); setShowResultExport(false) }} className="w-full text-left px-3 py-2 text-xs hover:bg-theme-border/50 rounded text-theme-text">JSON</button>
                  <button onClick={() => { downloadFile(probabilitiesToCSV(chart), 'algorithm-result.csv', 'text/csv'); setShowResultExport(false) }} className="w-full text-left px-3 py-2 text-xs hover:bg-theme-border/50 rounded text-theme-text">CSV</button>
                </div>
              )}
            </div>
          )}
        </div>

        <ExecutionHistory />

        <Card title="About Quantum Algorithms">
          <div className="text-xs text-theme-text space-y-2">
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
