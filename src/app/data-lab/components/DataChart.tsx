import React, { useState } from 'react'

interface DataChartProps {
  data: number[][]
  selectedColumns?: number[]
}

const DataChart = ({ data, selectedColumns = [0] }: DataChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const containerHeight = 192
  
  if (data.length === 0) {
    return (
      <div className="p-8 bg-slate-900/20 border border-slate-800 rounded text-center text-slate-500">
        No data to display
      </div>
    )
  }

  const maxValues = selectedColumns.map(col => {
    const values = data.map(row => Math.abs((row[col] !== undefined && row[col] !== null) ? row[col] : 0))
    return values.length > 0 ? Math.max(...values) : 0
  })
  const maxValue = Math.max(...maxValues, 1)

  const colors = ['bg-sky-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500']

  return (
    <div className="p-4 bg-bg-card border border-slate-800 rounded">
      <h4 className="text-sm font-medium mb-3">Data Visualization</h4>
      {selectedColumns.length > 0 ? (
        <>
          <div className="mb-2 flex flex-wrap gap-2">
            {selectedColumns.map((col, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded ${colors[idx % colors.length]}`} />
                <span className="text-xs text-slate-400">Col {col + 1}</span>
              </div>
            ))}
          </div>
          
          <div className="bg-slate-900/20 rounded overflow-hidden relative" style={{ height: `${containerHeight}px` }}>
            <div className="absolute inset-0 flex items-end gap-px p-2">
              {data.slice(0, 100).map((row, i) => (
                <div 
                  key={i} 
                  className="flex-1 flex items-end gap-0.5 relative group" 
                  style={{ minWidth: '1px' }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {selectedColumns.map((col, ci) => {
                    const value = row[col] || 0
                    const absValue = Math.abs(value)
                    const heightPercent = (absValue / maxValue) * 100
                    const availableHeight = containerHeight - 32
                    const pixelHeight = (heightPercent / 100) * availableHeight
                    return (
                      <div
                        key={ci}
                        className={`flex-1 ${colors[ci % colors.length]} transition-all ${
                          hoveredIndex === i ? 'opacity-100 scale-x-125' : 'opacity-60'
                        }`}
                        style={{ 
                          height: `${Math.max(2, pixelHeight)}px`
                        }}
                        title={`Row ${i}, Col ${col + 1}: ${value.toFixed(3)}`}
                      />
                    )
                  })}
                  
                  {hoveredIndex === i && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs whitespace-nowrap z-10">
                      <div className="font-medium text-slate-200">Row {i}</div>
                      {selectedColumns.map((col, ci) => (
                        <div key={ci} className="text-slate-400">
                          Col {col + 1}: {(row[col] || 0).toFixed(3)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-700" />
            <div className="absolute top-0 right-0 p-2">
              <div className="text-xs text-slate-500">{maxValue.toFixed(2)}</div>
            </div>
            <div className="absolute bottom-0 left-0 p-2">
              <div className="text-xs text-slate-500">0</div>
            </div>
          </div>
          
          <div className="mt-2 text-xs text-slate-400">
            Showing {Math.min(100, data.length)} of {data.length} rows
          </div>
        </>
      ) : (
        <div className="p-8 bg-slate-900/20 rounded text-center text-amber-400">
          Select at least one column to visualize
        </div>
      )}
    </div>
  )
}

export default DataChart

