import React from 'react'

type Props = {
  truthTable: Record<string, string>
  category: string
}

export default function OracleAnalysis({ truthTable, category }: Props) {
  const outputs = Object.values(truthTable)
  const zeros = outputs.filter(o => o === '0').length
  const ones = outputs.filter(o => o === '1').length
  
  const isConstant = zeros === 0 || ones === 0
  const isBalanced = zeros === ones && outputs.length === zeros + ones

  const getCategoryColor = (): string => {
    switch (category) {
      case 'Constant': return 'text-green-400 bg-green-900/20'
      case 'Balanced': return 'text-blue-400 bg-blue-900/20'
      case 'Phase': return 'text-purple-400 bg-purple-900/20'
      case 'Custom': return 'text-orange-400 bg-orange-900/20'
      default: return 'text-theme-text-muted bg-theme-surface/50'
    }
  }

  return (
    <div className="p-4 rounded bg-bg-card border border-theme-border">
      <h4 className="text-sm font-medium mb-3 text-theme-text">Oracle Analysis</h4>
      
      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-theme-text-muted">Category:</span>
            <span className={`text-xs px-2 py-1 rounded ${getCategoryColor()}`}>
              {category}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-theme-text-muted">Output Distribution:</div>
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-theme-text">0</span>
                <span className="text-xs text-theme-text-muted">{zeros}</span>
              </div>
              <div className="h-4 bg-theme-surface rounded overflow-hidden">
                <div 
                  className="h-full bg-green-600" 
                  style={{ width: `${(zeros / outputs.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-theme-text">1</span>
                <span className="text-xs text-theme-text-muted">{ones}</span>
              </div>
              <div className="h-4 bg-theme-surface rounded overflow-hidden">
                <div 
                  className="h-full bg-blue-600" 
                  style={{ width: `${(ones / outputs.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-theme-border space-y-1">
          <div className="flex items-center gap-2 text-xs">
            {isConstant && (
              <>
                <span className="text-green-400">✓</span>
                <span className="text-theme-text">Constant Oracle</span>
              </>
            )}
            {isBalanced && (
              <>
                <span className="text-blue-400">✓</span>
                <span className="text-theme-text">Balanced Oracle</span>
              </>
            )}
            {!isConstant && !isBalanced && (
              <>
                <span className="text-orange-400">!</span>
                <span className="text-theme-text">Custom Oracle</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

