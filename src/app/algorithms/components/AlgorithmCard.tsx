import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faBook, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
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
  onOpenInStudio?: (id: string) => void
}

function getDifficultyColor(difficulty?: string): string {
  switch (difficulty) {
    case 'Beginner': return 'text-green-400'
    case 'Intermediate': return 'text-yellow-400'
    case 'Advanced': return 'text-red-400'
    default: return 'text-theme-text-muted'
  }
}

export default function AlgorithmCard({ algorithm, onRun, onOpenInStudio }: AlgorithmCardProps) {
  return (
    <div
      className="p-4 rounded bg-bg-card border border-theme-border hover:border-primary cursor-pointer transition-colors"
      onClick={onRun}
      role="button"
      tabIndex={0}
      onKeyDown={(e)=> { if (e.key === 'Enter' || e.key === ' ') onRun?.() }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-sm text-theme-text">{algorithm.name}</h3>
        {algorithm.year && (
          <span className="text-xs text-theme-text-muted">{algorithm.year}</span>
        )}
      </div>
      
      {algorithm.category && (
        <div className="mb-2">
          <span className="text-xs px-2 py-0.5 bg-theme-surface border border-theme-border rounded text-theme-text-muted">
            {algorithm.category}
          </span>
        </div>
      )}

      <div className="space-y-1.5 mb-3 text-xs">
        {algorithm.appliedTo && (
          <div className="text-theme-text-muted">
            <span className="text-theme-text-muted">Applied to:</span> {algorithm.appliedTo}
          </div>
        )}
        {algorithm.complexity && (
          <div className="flex items-center gap-2">
            <span className="text-theme-text-muted">Quantum:</span>
            <span className="text-primary font-mono">{algorithm.complexity}</span>
          </div>
        )}
        {algorithm.classicalComplexity && (
          <div className="flex items-center gap-2">
            <span className="text-theme-text-muted">Classical:</span>
            <span className="text-theme-text font-mono text-[10px]">{algorithm.classicalComplexity}</span>
          </div>
        )}
        {algorithm.difficulty && (
          <div className={`font-medium ${getDifficultyColor(algorithm.difficulty)}`}>
            {algorithm.difficulty}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button className="flex-1 min-w-0" onClick={(e) => { e.stopPropagation(); onRun?.() }}>
          <FontAwesomeIcon icon={faPlay} className="mr-1.5" />
          Run
        </Button>
        {onOpenInStudio && (
          <Button variant="secondary" className="flex-1 min-w-0" onClick={(e) => { e.stopPropagation(); onOpenInStudio(algorithm.id) }}>
            <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-1.5" />
            Open in Studio
          </Button>
        )}
        <Link to="/docs" className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
          <Button variant="secondary" className="w-full">
            <FontAwesomeIcon icon={faBook} className="mr-1.5" />
            Docs
          </Button>
        </Link>
      </div>
    </div>
  )
}
