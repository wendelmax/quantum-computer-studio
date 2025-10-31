import React, { useState } from 'react'

export default function DatasetViewer({ data }: { data: string[][] }) {
  const [displayCount, setDisplayCount] = useState(20)
  
  if (data.length === 0) {
    return (
      <div className="rounded-lg p-4 bg-bg-card border border-slate-800 text-center text-slate-400">
        No data to display
      </div>
    )
  }

  const numCols = data[0]?.length || 0
  const showHeaders = numCols > 0

  return (
    <div className="rounded-lg p-4 bg-bg-card border border-slate-800">
      {data.length > 20 && (
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Showing {displayCount} of {data.length} rows
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setDisplayCount(Math.max(20, displayCount - 20))}
              disabled={displayCount <= 20}
              className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Show Less
            </button>
            <button
              onClick={() => setDisplayCount(Math.min(data.length, displayCount + 20))}
              disabled={displayCount >= data.length}
              className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Show More
            </button>
            <button
              onClick={() => setDisplayCount(data.length)}
              disabled={displayCount >= data.length}
              className="px-2 py-1 text-xs rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Show All
            </button>
          </div>
        </div>
      )}
      
      <div className="overflow-auto max-h-96 scrollbar-thin">
        <table className="text-xs w-full">
          {showHeaders && (
            <thead>
              <tr className="border-b border-slate-700">
                {Array.from({ length: numCols }, (_, j) => (
                  <th key={j} className="px-2 py-2 text-left text-slate-400 font-medium sticky top-0 bg-slate-900">
                    Column {j + 1}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {data.slice(0, displayCount).map((row, i) => (
              <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-2 py-2 text-slate-200 border-b border-slate-800">
                    <div className="max-w-xs truncate" title={cell}>
                      {cell}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
