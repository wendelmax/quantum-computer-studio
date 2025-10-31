import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import Card from '../../../components/Card'

type Stats = {
  executionTime: number
  numStates: number
  numGates: number
  memoryUsed?: number
}

type Props = {
  stats?: Stats
}

export default function PerformanceStats({ stats }: Props) {
  if (!stats) {
    return (
      <Card>
        <div className="text-sm text-slate-400">No statistics available</div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-slate-400">Execution Time</div>
          <div className="text-2xl font-semibold text-slate-100">{stats.executionTime.toFixed(2)}ms</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">States Found</div>
          <div className="text-2xl font-semibold text-slate-100">{stats.numStates}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Gates</div>
          <div className="text-2xl font-semibold text-slate-100">{stats.numGates}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">States/sec</div>
          <div className="text-2xl font-semibold text-slate-100">
            {stats.executionTime > 0 ? (stats.numStates / stats.executionTime * 1000).toFixed(0) : 0}
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="text-xs text-slate-400 mb-2">Performance Level</div>
        <div className="text-sm text-slate-200">
          {stats.executionTime < 50 ? (
            <span><FontAwesomeIcon icon={faBolt} className="mr-1" /> Excellent</span>
          ) : stats.executionTime < 200 ? (
            <span><FontAwesomeIcon icon={faCheck} className="mr-1" /> Good</span>
          ) : (
            <span><FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" /> Slow</span>
          )}
        </div>
      </div>
    </Card>
  )
}
