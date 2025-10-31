import React, { useState, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faFilter } from '@fortawesome/free-solid-svg-icons'
import Button from '../../components/Button'
import Card from '../../components/Card'
import { runSimulation } from '../circuits/services/simulator'
import { oracles } from './data/oracles'
import OracleCard from './components/OracleCard'
import TruthTable from './components/TruthTable'
import OracleCircuit from './components/OracleCircuit'
import OracleAnalysis from './components/OracleAnalysis'
import type { Oracle } from './data/oracles'

export default function OraclesPage() {
  const [selectedOracle, setSelectedOracle] = useState<string | null>(null)
  const [result, setResult] = useState<Record<string, number> | undefined>(undefined)
  const [processing, setProcessing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('All')

  const oracleInfo = selectedOracle ? oracles.find(o => o.id === selectedOracle) : null

  const categories = useMemo(() => ['All', ...Array.from(new Set(oracles.map(o => o.category)))] as string[], [])
  const algorithms = useMemo(() => ['All', ...Array.from(new Set(oracles.map(o => o.algorithm)))] as string[], [])

  const filteredOracles = useMemo(() => {
    return oracles.filter(alg => {
      const matchesSearch = !searchTerm || alg.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || alg.category === selectedCategory
      const matchesAlgorithm = selectedAlgorithm === 'All' || alg.algorithm === selectedAlgorithm
      return matchesSearch && matchesCategory && matchesAlgorithm
    })
  }, [searchTerm, selectedCategory, selectedAlgorithm])

  async function testOracle(id: string) {
    setSelectedOracle(id)
    setProcessing(true)
    const oracle = oracles.find(o => o.id === id)
    if (!oracle) {
      setProcessing(false)
      return
    }

    const deutschJozsa = {
      numQubits: oracle.numQubits,
      gates: [
        { type: 'X', target: oracle.numQubits - 1 },
        ...Array.from({ length: oracle.numQubits }, (_, i) => ({ type: 'H', target: i })),
        ...oracle.circuit.gates,
        { type: 'H', target: 0 }
      ]
    }

    try {
      const res = await runSimulation(deutschJozsa)
      setResult(res.probabilities)
    } catch (err) {
      console.error(err)
      setResult(undefined)
    } finally {
      setProcessing(false)
    }
  }

  const loadToStudio = (id: string) => {
    const oracle = oracles.find(o => o.id === id)
    if (!oracle) return
    
    try {
      localStorage.setItem('quantum:loadCircuit', JSON.stringify(oracle.circuit))
      localStorage.setItem('quantum:circuit', JSON.stringify(oracle.circuit))
      localStorage.setItem('quantum:prefs:numQubits', String(oracle.numQubits))
      window.dispatchEvent(new CustomEvent('quantum:set-circuit', { detail: { circuit: oracle.circuit, autoRun: false } }))
      window.location.href = '/circuits'
    } catch {}
  }

  return (
    <div className="p-6 grid grid-cols-12 gap-4">
      <div className="col-span-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Quantum Oracles</h2>
          <Button onClick={() => window.location.href = '/circuits'}>Open Quantum Studio</Button>
        </div>

        <Card>
          <p className="text-sm text-slate-300 mb-4">
            Oracles are black-box functions used in quantum algorithms like Deutsch–Jozsa, Grover, and Bernstein-Vazirani. 
            An oracle can be <strong>constant</strong> (returns same value for all inputs), <strong>balanced</strong> (returns 0 for half and 1 for other half), 
            or <strong>custom</strong> (phase-oracles for Grover search).
          </p>
        </Card>

        <Card>
          <div className="mb-4 relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search oracles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-10 bg-slate-900 border border-slate-700 rounded text-sm"
            />
          </div>
          <div className="flex gap-2">
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
                value={selectedAlgorithm}
                onChange={(e) => setSelectedAlgorithm(e.target.value)}
                className="w-full px-3 py-2 pl-10 bg-slate-900 border border-slate-700 rounded text-sm appearance-none"
              >
                {algorithms.map(alg => (
                  <option key={alg} value={alg}>{alg}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card title={`Oracle Library (${filteredOracles.length})`}>
          <div className="grid grid-cols-2 gap-4">
            {filteredOracles.map(oracle => (
              <OracleCard
                key={oracle.id}
                oracle={oracle}
                onTest={testOracle}
                onLoad={loadToStudio}
              />
            ))}
          </div>
        </Card>
      </div>

      <div className="col-span-4 flex flex-col gap-4">
        {oracleInfo && (
          <>
            <Card title="Oracle Details">
              <div className="space-y-3">
                <div className="text-lg font-semibold">{oracleInfo.name}</div>
                <div className="text-sm text-slate-300">{oracleInfo.description}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Algorithm:</span>
                  <span className="text-xs px-2 py-1 bg-slate-900 border border-slate-700 rounded">
                    {oracleInfo.algorithm}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Application:</span>
                  <span className="text-xs text-slate-300">{oracleInfo.application}</span>
                </div>
                <Button className="w-full" onClick={() => loadToStudio(oracleInfo.id)}>
                  Open in Studio
                </Button>
              </div>
            </Card>

            <OracleAnalysis
              truthTable={oracleInfo.truthTable}
              category={oracleInfo.category}
            />

            <TruthTable
              truthTable={oracleInfo.truthTable}
              numInputs={oracleInfo.numQubits - 1}
            />

            <OracleCircuit circuit={oracleInfo.circuit} />
          </>
        )}

        <Card title="Test Results">
          {processing ? (
            <div className="text-sm text-slate-300">Running simulation...</div>
          ) : result ? (
            <div className="space-y-2">
              {Object.entries(result)
                .filter(([_, prob]) => prob > 0.01)
                .map(([state, prob]) => (
                  <div key={state} className="flex justify-between items-center text-sm">
                    <span className="font-mono text-slate-200">|{state}⟩</span>
                    <span className="text-slate-400">{(prob * 100).toFixed(1)}%</span>
                  </div>
                ))}
              {result['00'] === 1 && (
                <div className="text-xs text-green-400 mt-2 p-2 bg-green-900/20 rounded">
                  ✓ Result: CONSTANT function
                </div>
              )}
              {result['00'] !== 1 && result['00'] !== undefined && (
                <div className="text-xs text-blue-400 mt-2 p-2 bg-blue-900/20 rounded">
                  ✓ Result: BALANCED function
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-400">Select an oracle to test</div>
          )}
        </Card>

        <Card title="About Oracles">
          <div className="text-xs text-slate-300 space-y-2">
            <p>
              The Deutsch–Jozsa algorithm determines if an oracle is constant or balanced 
              in just one query, while classical computers need 2^n queries.
            </p>
            <p>
              <strong>Constant:</strong> Same output for all inputs
              <br />
              <strong>Balanced:</strong> Half inputs → 0, half inputs → 1
              <br />
              <strong>Phase:</strong> Flips phase of target states (Grover)
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
