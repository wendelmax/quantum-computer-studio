import React from 'react'

interface StatsProps {
  data: number[][]
}

// FIXME: Performance could be improved for large datasets
const AdvancedStats = ({ data }: StatsProps) => {
  if (data.length === 0) return null

  const numCols = data[0]?.length || 0
  if (numCols === 0) return null

  const stats = Array.from({ length: numCols }, (_, col) => {
    const values = data.map(row => row[col]).filter(v => !isNaN(v))
    const n = values.length
    if (n === 0) return null

    const sorted = [...values].sort((a, b) => a - b)
    const sum = values.reduce((a, b) => a + b, 0)
    const mean = sum / n
    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n
    const stdDev = Math.sqrt(variance)
    
    const q1 = sorted[Math.floor(n * 0.25)]
    const median = sorted[Math.floor(n * 0.5)]
    const q3 = sorted[Math.floor(n * 0.75)]

    let correlation = 0
    if (numCols > 1 && col < numCols - 1) {
      const col2Values = data.map(row => row[col + 1]).filter(v => !isNaN(v))
      if (col2Values.length === n) {
        const mean2 = col2Values.reduce((a, b) => a + b, 0) / n
        const stdDev2 = Math.sqrt(col2Values.reduce((acc, v) => acc + Math.pow(v - mean2, 2), 0) / n)
        
        if (stdDev > 0 && stdDev2 > 0) {
          const covariance = values.reduce((acc, v, i) => acc + (v - mean) * (col2Values[i] - mean2), 0) / n
          correlation = covariance / (stdDev * stdDev2)
        }
      }
    }

    return {
      min: sorted[0],
      q1,
      median,
      q3,
      max: sorted[n - 1],
      mean,
      stdDev,
      variance,
      correlation: col < numCols - 1 ? correlation : null
    }
  })

  return (
    <div className="p-4 bg-bg-card border border-theme-border rounded">
      <h4 className="text-sm font-medium mb-3 text-theme-text">Advanced Statistics</h4>
      
      <div className="space-y-4">
        {stats.map((stat, col) => {
          if (!stat) return null
          
          return (
            <div key={col} className="space-y-2">
              <div className="text-xs font-medium text-theme-text">
                Column {col + 1}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-theme-text-muted">Min:</span>
                  <span className="text-theme-text font-mono">{stat.min.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-muted">Max:</span>
                  <span className="text-theme-text font-mono">{stat.max.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-muted">Q1:</span>
                  <span className="text-theme-text font-mono">{stat.q1.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-muted">Q3:</span>
                  <span className="text-theme-text font-mono">{stat.q3.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-muted">Median:</span>
                  <span className="text-theme-text font-mono">{stat.median.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-muted">Mean:</span>
                  <span className="text-theme-text font-mono">{stat.mean.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-muted">Std Dev:</span>
                  <span className="text-theme-text font-mono">{stat.stdDev.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-muted">Variance:</span>
                  <span className="text-theme-text font-mono">{stat.variance.toFixed(3)}</span>
                </div>
              </div>

              {stat.correlation !== null && (
                <div className="mt-2 pt-2 border-t border-theme-border">
                  <div className="flex justify-between items-center">
                    <span className="text-theme-text-muted text-xs">Correlation with next column:</span>
                    <span className="text-xs font-mono text-primary">
                      {stat.correlation.toFixed(3)}
                    </span>
                  </div>
                </div>
              )}
              
              {col < stats.length - 1 && <div className="border-t border-theme-border" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AdvancedStats

