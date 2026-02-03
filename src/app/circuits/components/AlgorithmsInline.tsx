import React from 'react'
import list from '../../algorithms/data/algorithms-list.json'
import Button from '../../../components/Button'

type Props = {
  onLoadAlgorithm: (id: string, autoRun?: boolean) => void
}

export default function AlgorithmsInline({ onLoadAlgorithm }: Props) {
  return (
    <div className="rounded-lg p-3 bg-bg-card border border-slate-800 transition-all duration-300 hover:border-slate-700/80">
      <h3 className="text-sm font-medium mb-2">Algorithms</h3>
      <div className="flex flex-wrap gap-2">
        {(list as Array<{id:string; name:string}>).map(a => (
          <Button
            key={a.id}
            variant="secondary"
            className="px-2 py-1 text-xs transition-all duration-200 hover:scale-105 hover:border-sky-500/50 active:scale-95"
            onClick={()=> onLoadAlgorithm(a.id, true)}
          >
            {a.name}
          </Button>
        ))}
      </div>
    </div>
  )
}


