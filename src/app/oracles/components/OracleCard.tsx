import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFlask, faExternalLink } from '@fortawesome/free-solid-svg-icons'
import Button from '../../../components/Button'
import type { Oracle } from '../data/oracles'

type Props = {
  oracle: Oracle
  onTest: (id: string) => void
  onLoad: (id: string) => void
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'Constant': return 'border-green-700 bg-green-900/10'
    case 'Balanced': return 'border-blue-700 bg-blue-900/10'
    case 'Phase': return 'border-purple-700 bg-purple-900/10'
    case 'Custom': return 'border-orange-700 bg-orange-900/10'
    default: return 'border-slate-700 bg-slate-900/10'
  }
}

export default function OracleCard({ oracle, onTest, onLoad }: Props) {
  return (
    <div
      className={`p-4 rounded border-2 ${getCategoryColor(oracle.category)} hover:border-opacity-60 transition-all cursor-pointer`}
      onClick={() => onTest(oracle.id)}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-sm">{oracle.name}</h3>
        <span className="text-xs px-2 py-0.5 bg-slate-900 border border-slate-700 rounded">
          {oracle.algorithm}
        </span>
      </div>
      
      <p className="text-xs text-slate-300 mb-3 line-clamp-2">
        {oracle.description}
      </p>

      <div className="flex items-center gap-3 mb-3 text-xs text-slate-400">
        <span>{oracle.numQubits} qubits</span>
        <span>•</span>
        <span>{oracle.circuit.gates.length} gates</span>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1" onClick={(e) => { e.stopPropagation(); onTest(oracle.id) }}>
          <FontAwesomeIcon icon={faFlask} className="mr-1.5" />
          Test
        </Button>
        <Button 
          variant="secondary" 
          className="flex-1" 
          onClick={(e) => { e.stopPropagation(); onLoad(oracle.id) }}
        >
          <FontAwesomeIcon icon={faExternalLink} className="mr-1.5" />
          Studio
        </Button>
      </div>
    </div>
  )
}

