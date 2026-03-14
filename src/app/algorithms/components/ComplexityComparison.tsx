import React from 'react'
import { useTranslation } from 'react-i18next'
import Card from '../../../components/Card'

type Props = {
  quantumComplexity?: string
  classicalComplexity?: string
  algorithmName: string
}

export default function ComplexityComparison({ quantumComplexity, classicalComplexity, algorithmName }: Props) {
  const { t } = useTranslation()
  if (!quantumComplexity && !classicalComplexity) return null

  const getComplexityValue = (complexity: string): number => {
    if (complexity.includes('O(1)') || complexity.includes('O(√N)')) return 1
    if (complexity.includes('O(n)') || complexity.includes('O(log')) return 2
    if (complexity.includes('O(n²)')) return 3
    if (complexity.includes('2ⁿ') || complexity.includes('Exponential')) return 10
    if (complexity.includes('NP-hard')) return 15
    return 5
  }

  const quantumValue = quantumComplexity ? getComplexityValue(quantumComplexity) : 0
  const classicalValue = classicalComplexity ? getComplexityValue(classicalComplexity) : 0

  return (
    <Card className="p-5 border-primary/10">
      <h4 className="text-[10px] font-black uppercase tracking-widest mb-5 text-theme-text-muted flex items-center gap-2">
         <span className="w-1.5 h-1.5 rounded-full bg-primary" />
         {t('algorithms.comparison_title')}
      </h4>
      <div className="space-y-6">
        {quantumComplexity && (
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-black uppercase text-primary/80 tracking-tighter">{t('algorithms.quantum_label')}</span>
              <span className="text-xs font-black font-mono text-primary">{quantumComplexity}</span>
            </div>
            <div className="h-2 bg-theme-border/20 rounded-full overflow-hidden border border-theme-border/10">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, (quantumValue / Math.max(quantumValue, classicalValue)) * 100)}%` }}
              />
            </div>
          </div>
        )}
        {classicalComplexity && (
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-black uppercase text-theme-text-muted tracking-tighter">{t('algorithms.classical_label')}</span>
              <span className="text-xs font-black font-mono text-theme-text-muted opacity-80">{classicalComplexity}</span>
            </div>
            <div className="h-2 bg-theme-border/20 rounded-full overflow-hidden border border-theme-border/10">
              <div 
                className="h-full bg-gradient-to-r from-theme-text-muted to-theme-border transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, (classicalValue / Math.max(quantumValue, classicalValue)) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
      {quantumValue > 0 && classicalValue > 0 && quantumValue < classicalValue && (
        <div className="mt-6 pt-5 border-t border-theme-border/50">
          <div className="flex items-center gap-2 text-[10px] font-bold text-green-400 uppercase tracking-tighter">
            <span className="w-5 h-5 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">✓</span>
            <span>{t('algorithms.advantage_label')} {((1 - quantumValue / classicalValue) * 100).toFixed(0)}% {t('algorithms.faster')}</span>
          </div>
        </div>
      )}
    </Card>
  )
}
