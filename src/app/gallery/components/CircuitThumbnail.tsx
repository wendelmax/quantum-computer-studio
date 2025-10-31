import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faProjectDiagram } from '@fortawesome/free-solid-svg-icons'

type Props = {
  title: string
  description?: string
  gateCount?: number
  qubitCount?: number
  onClick?: () => void
}

export default function CircuitThumbnail({ title, description, gateCount, qubitCount, onClick }: Props) {
  return (
    <div 
      className="rounded-lg p-3 bg-bg-card border border-slate-800 hover:border-primary cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="h-24 bg-slate-900/10 rounded flex items-center justify-center">
        <FontAwesomeIcon icon={faProjectDiagram} className="text-4xl text-slate-600" />
      </div>
      <div className="mt-2">
        <div className="text-xs text-slate-200 font-medium truncate">{title}</div>
        {description && <div className="text-[10px] text-slate-400 truncate">{description}</div>}
        {(gateCount !== undefined || qubitCount !== undefined) && (
          <div className="text-[10px] text-slate-500 mt-1">
            {qubitCount ? `${qubitCount}q` : ''} {gateCount ? `${gateCount}g` : ''}
          </div>
        )}
      </div>
    </div>
  )
}
