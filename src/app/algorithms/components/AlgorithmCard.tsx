import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faBook } from '@fortawesome/free-solid-svg-icons'
import Button from '../../../components/Button'

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

interface AlgorithmCardProps {
  algorithm: Algorithm
  onRun?: () => void
}

function getDifficultyColor(difficulty?: string): string {
  switch (difficulty) {
    case 'Beginner': return 'text-green-400'
    case 'Intermediate': return 'text-yellow-400'
    case 'Advanced': return 'text-red-400'
    default: return 'text-slate-400'
  }
}

export default function AlgorithmCard({ algorithm, onRun }: AlgorithmCardProps) {
  return (
    <div
      className="p-4 rounded bg-bg-card border border-slate-800 hover:border-primary cursor-pointer transition-colors"
      onClick={onRun}
      role="button"
      tabIndex={0}
      onKeyDown={(e)=> { if (e.key === 'Enter' || e.key === ' ') onRun?.() }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-sm">{algorithm.name}</h3>
        {algorithm.year && (
          <span className="text-xs text-slate-500">{algorithm.year}</span>
        )}
      </div>
      
      {algorithm.category && (
        <div className="mb-2">
          <span className="text-xs px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-400">
            {algorithm.category}
          </span>
        </div>
      )}

      <div className="space-y-1.5 mb-3 text-xs">
        {algorithm.appliedTo && (
          <div className="text-slate-400">
            <span className="text-slate-500">Applied to:</span> {algorithm.appliedTo}
          </div>
        )}
        {algorithm.complexity && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Quantum:</span>
            <span className="text-sky-400 font-mono">{algorithm.complexity}</span>
          </div>
        )}
        {algorithm.classicalComplexity && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Classical:</span>
            <span className="text-slate-400 font-mono text-[10px]">{algorithm.classicalComplexity}</span>
          </div>
        )}
        {algorithm.difficulty && (
          <div className={`font-medium ${getDifficultyColor(algorithm.difficulty)}`}>
            {algorithm.difficulty}
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <Button className="flex-1" onClick={(e) => { e.stopPropagation(); onRun?.() }}>
          <FontAwesomeIcon icon={faPlay} className="mr-1.5" />
          Run
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => window.location.href = '/docs'}>
          <FontAwesomeIcon icon={faBook} className="mr-1.5" />
          Docs
        </Button>
      </div>
    </div>
  )
}
