import React from 'react'

type Props = {
  quantumComplexity?: string
  classicalComplexity?: string
  algorithmName: string
}

export default function ComplexityComparison({ quantumComplexity, classicalComplexity, algorithmName }: Props) {
  if (!quantumComplexity && !classicalComplexity) return null

  const getComplexityValue = (complexity: string): number => {
    // Maps complexity notation to numeric value for bar chart scaling
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
    <div className="p-4 rounded bg-bg-card border border-theme-border">
      <h4 className="text-sm font-medium mb-3 text-theme-text">Complexity Comparison</h4>
      <div className="space-y-3">
        {quantumComplexity && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-theme-text-muted">Quantum</span>
              <span className="text-xs font-mono text-primary">{quantumComplexity}</span>
            </div>
            <div className="h-3 bg-theme-surface rounded overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${Math.min(100, (quantumValue / Math.max(quantumValue, classicalValue)) * 100)}%` }}
              />
            </div>
          </div>
        )}
        {classicalComplexity && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-theme-text-muted">Classical</span>
              <span className="text-xs font-mono text-theme-text-muted">{classicalComplexity}</span>
            </div>
            <div className="h-3 bg-theme-surface rounded overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (classicalValue / Math.max(quantumValue, classicalValue)) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
      {quantumValue > 0 && classicalValue > 0 && quantumValue < classicalValue && (
        <div className="mt-3 pt-3 border-t border-theme-border">
          <div className="flex items-center gap-2 text-xs text-green-400">
            <span>✓</span>
            <span>Quantum advantage: {((1 - quantumValue / classicalValue) * 100).toFixed(0)}% faster</span>
          </div>
        </div>
      )}
    </div>
  )
}

