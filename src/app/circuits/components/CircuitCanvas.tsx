import React from 'react'
import type { Circuit } from '../hooks/useCircuitEngine'

type Props = {
  children?: React.ReactNode
  selectedGate?: string
  onPlace?: (gate: string, target: number) => void
  circuit: Circuit
  onRemove?: (target: number, lineIndex: number) => void
  onMove?: (fromTarget: number, fromIdx: number, toTarget: number, toIdx: number) => void
}

export default function CircuitCanvas({ children, selectedGate, onPlace, circuit, onRemove, onMove }: Props) {
  const numQubits = circuit.numQubits
  const perRow: Record<number, typeof circuit.gates> = {}
  for (const p of circuit.gates) {
    if (!perRow[p.target]) perRow[p.target] = []
    perRow[p.target].push(p)
  }
  const gatesByRow: Record<number, number> = {}
  Object.keys(perRow).forEach(k => { gatesByRow[Number(k)] = perRow[Number(k)].length })
  const maxCols = Math.max(8, ...Object.values(gatesByRow), 0)
  const cnotConns = circuit.gates
    .filter(g => g.type === 'CNOT' && typeof g.control === 'number')
    .map(g => {
      const arr = perRow[g.target] || []
      const colIndex = arr.indexOf(g)
      return { control: g.control as number, target: g.target, col: Math.max(0, colIndex) }
    })
  const dragging = React.useRef<{ row: number; col: number } | null>(null)
  const cellHeight = 50
  const headerHeight = 60
  const padding = 24
  const minHeight = Math.max(300, numQubits * cellHeight + padding)
  const maxDisplayHeight = 600
  const hasScroll = minHeight > maxDisplayHeight
  
  return (
    <div className="rounded-lg bg-[#021428] border border-slate-800 p-4">
      <div className="text-slate-300 text-sm mb-2">Circuit canvas ({numQubits} qubit{numQubits !== 1 ? 's' : ''})</div>
      <div className={`rounded ${hasScroll ? 'overflow-auto scrollbar-thin' : 'overflow-visible'}`} style={{ maxHeight: hasScroll ? `${maxDisplayHeight}px` : 'none', minHeight: `${Math.min(minHeight, maxDisplayHeight)}px` }}>
        <div className="p-3">
          <div className="grid" style={{gridTemplateColumns: `60px repeat(${maxCols}, minmax(36px,1fr))`, rowGap: 16, columnGap: 12}}>
            <div className="contents">
              <div className="h-8 flex items-center justify-center text-xs text-slate-500"></div>
              {Array.from({length:maxCols},(_,col)=> (
                <div key={`header-${col}`} className="h-8 flex items-center justify-center text-xs text-slate-500">
                  {col}
                </div>
              ))}
            </div>
            {Array.from({length:numQubits},(_,row)=> (
              <div key={row} className="contents">
                <div className="h-10 flex items-center justify-center text-xs text-slate-400 font-medium">
                  q{row}
                </div>
                {Array.from({length:maxCols},(_,col)=> (
                  <div
                    key={`${row}-${col}`}
                    className={`relative h-10 bg-slate-900/10 rounded flex items-center justify-center transition-colors ${
                      selectedGate 
                        ? 'cursor-pointer hover:bg-sky-900/20 border-2 border-sky-600/50 border-dashed' 
                        : 'cursor-pointer hover:bg-slate-900/20'
                    }`}
                    onClick={()=> selectedGate && onPlace?.(selectedGate, row)}
                    onDragOver={(e)=> e.preventDefault()}
                    onDrop={(e)=> {
                      const data = e.dataTransfer.getData('text/plain')
                      const [fromRow, fromCol] = data.split(':').map(Number)
                      if (!isNaN(fromRow) && !isNaN(fromCol) && onMove) onMove(fromRow, fromCol, row, col)
                    }}
                    title={selectedGate ? `Click to add ${selectedGate} gate` : undefined}
                  >
                    <div className="absolute left-0 right-0 h-px bg-slate-700" />
                    {cnotConns.some(c => c.col === col && row >= Math.min(c.control, c.target) && row <= Math.max(c.control, c.target)) ? (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-px h-full bg-slate-700" />
                      </div>
                    ) : null}
                    {(() => {
                      const gatesOnRow = perRow[row] || []
                      const gateAt = gatesOnRow[col]
                      if (!gateAt) return null
                      const isCnot = gateAt.type === 'CNOT'
                      const isRotational = ['RX','RY','RZ'].includes(gateAt.type)
                      const angleDeg = gateAt.angle != null ? Math.round(gateAt.angle * 180 / Math.PI) : null
                      return (
                        <button
                          className="relative z-10 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sky-300 text-xs flex flex-col items-center min-w-[36px] transition-all hover:scale-110 hover:bg-slate-700 hover:border-sky-500"
                          draggable
                          onDragStart={(e)=> { dragging.current = { row, col }; e.dataTransfer.setData('text/plain', `${row}:${col}`) }}
                          onClick={(e)=> { e.stopPropagation(); onRemove?.(row, col) }}
                          title={isRotational && angleDeg != null ? `${gateAt.type}(${angleDeg}°)` : gateAt.type}
                        >
                          <span>{isCnot ? '⊕' : gateAt.type}</span>
                          {isRotational && angleDeg != null && (
                            <span className="text-[10px] text-slate-400 leading-tight">{angleDeg}°</span>
                          )}
                        </button>
                      )
                    })()}
                    {(() => {
                      const controlHere = cnotConns.find(c => c.col === col && c.control === row)
                      if (!controlHere) return null
                      return <div className="relative z-10 w-2 h-2 rounded-full bg-sky-400" />
                    })()}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
