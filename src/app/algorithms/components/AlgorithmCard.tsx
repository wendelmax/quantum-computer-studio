import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faBook, faExternalLinkAlt, faMicrochip, faCalendarAlt, faLayerGroup } from '@fortawesome/free-solid-svg-icons'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import { useTranslation } from 'react-i18next'

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

export default function AlgorithmCard({ algorithm, onRun, onOpenInStudio }: AlgorithmCardProps) {
  const { t } = useTranslation()

  const getDifficultyColor = (difficulty?: string) => {
    const diff = difficulty?.toLowerCase()
    if (diff === 'beginner') return 'text-green-400 bg-green-500/10 border-green-500/20'
    if (diff === 'intermediate') return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    if (diff === 'advanced') return 'text-red-400 bg-red-500/10 border-red-500/20'
    return 'text-theme-text-muted bg-theme-border/20 border-theme-border/50'
  }

  const getCategoryKey = (cat?: string) => {
    if (!cat) return ''
    const mapping: Record<string, string> = {
      'Search': 'search',
      'Deutsch Family': 'deutsch',
      'Hidden Subgroup': 'hidden',
      'Cryptography': 'crypto',
      'Transform': 'transform',
      'Phase Estimation': 'phase',
      'Optimization': 'optimization',
      'Chemistry': 'chemistry'
    }
    return mapping[cat] || cat.toLowerCase()
  }

  return (
    <div onClick={onRun} className="cursor-pointer contents">
      <Card
        className={`group hover:border-primary/50 transition-all duration-300 relative overflow-hidden ${
          algorithm.id === algorithm.id ? '' : '' // Placeholder for active state if needed?
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 transition-transform group-hover:scale-110 duration-500">
            <FontAwesomeIcon icon={faMicrochip} />
          </div>
          {algorithm.difficulty && (
            <div className={`px-2 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold shadow-sm ${getDifficultyColor(algorithm.difficulty)}`}>
              {t(`algorithms.difficulty_${algorithm.difficulty.toLowerCase()}`)}
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-theme-text mb-1 tracking-tight group-hover:text-primary transition-colors">
          {algorithm.name}
        </h3>
        
        {algorithm.category && (
          <div className="mb-4 flex items-center gap-2">
             <FontAwesomeIcon icon={faLayerGroup} className="text-[10px] text-primary/40" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-text-muted">
               {t(`algorithms.categories.${getCategoryKey(algorithm.category)}`)}
             </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          {algorithm.complexity && (
            <div className="flex flex-col p-2 rounded-xl bg-theme-border/10 border border-theme-border/30">
              <span className="text-[8px] font-black uppercase text-theme-text-muted opacity-50">{t('algorithms.quantum_label')}</span>
              <span className="text-xs font-black text-primary font-mono tracking-tighter">{algorithm.complexity}</span>
            </div>
          )}
          {algorithm.classicalComplexity && (
            <div className="flex flex-col p-2 rounded-xl bg-theme-surface/30 border border-theme-border/30">
              <span className="text-[8px] font-black uppercase text-theme-text-muted opacity-50">{t('algorithms.classical_label')}</span>
              <span className="text-[10px] font-bold text-theme-text truncate font-mono opacity-80">{algorithm.classicalComplexity}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 relative z-10">
          <Button 
            variant="primary" 
            className="flex-1 py-2.5 text-xs shadow-lg shadow-primary/10" 
            onClick={(e) => { e.stopPropagation(); onRun?.() }}
          >
            <FontAwesomeIcon icon={faPlay} className="mr-2 text-[10px]" />
            {t('common.start_now')}
          </Button>
          {onOpenInStudio && (
            <Button 
              variant="secondary" 
              className="flex-1 py-2.5 text-xs bg-theme-border/20 border-theme-border/50 hover:border-primary/50" 
              onClick={(e) => { e.stopPropagation(); onOpenInStudio(algorithm.id) }}
            >
              {t('algorithms.open_studio_btn')}
            </Button>
          )}
        </div>

        {/* Decorative background element */}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
      </Card>
    </div>
  )
}
