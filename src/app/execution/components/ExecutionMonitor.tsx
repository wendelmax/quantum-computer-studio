import React from 'react'

type Props = {
  isRunning: boolean
  progress?: number
  startTime?: number
}

export default function ExecutionMonitor({ isRunning, progress = 0, startTime }: Props) {
  const elapsed = startTime ? ((Date.now() - startTime) / 1000).toFixed(2) : '0.00'
  
  return (
    <div className="rounded-lg p-4 bg-bg-card border border-slate-800">
      <div className="text-sm font-medium mb-3">Execution Monitor</div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">Status</span>
          <span className={isRunning ? 'text-green-400' : 'text-slate-400'}>
            {isRunning ? 'Running' : 'Idle'}
          </span>
        </div>
        
        {isRunning && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Elapsed</span>
              <span className="text-slate-200">{elapsed}s</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Progress</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-900/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </>
        )}
        
        {!isRunning && (
          <div className="text-xs text-slate-400">
            Click Run to start simulation monitoring
          </div>
        )}
      </div>
    </div>
  )
}
