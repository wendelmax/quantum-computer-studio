import React from 'react'
import { sampleDatasets, type SampleDataset } from '../data/sample-datasets'
import Button from '../../../components/Button'

type Props = {
  onLoad: (data: string[][]) => void
}

export default function SampleDatasetSelector({ onLoad }: Props) {
  const categories = Array.from(new Set(sampleDatasets.map(d => d.category)))
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All')

  const filtered = selectedCategory === 'All' 
    ? sampleDatasets 
    : sampleDatasets.filter(d => d.category === selectedCategory)

  return (
    <div className="p-4 bg-bg-card border border-slate-800 rounded">
      <h4 className="text-sm font-medium mb-3">Sample Datasets</h4>
      
      <div className="mb-3">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs"
        >
          <option value="All">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
        {filtered.map(dataset => (
          <div key={dataset.id} className="p-2 bg-slate-900/30 border border-slate-800 rounded">
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="text-xs font-medium text-slate-200">{dataset.name}</div>
                <div className="text-[10px] text-slate-400">{dataset.description}</div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded">
                {dataset.category}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mb-2">
              {dataset.data.length} rows × {dataset.data[0]?.length || 0} columns
            </div>
            <Button 
              className="w-full text-xs" 
              variant="secondary"
              onClick={() => onLoad(dataset.data)}
            >
              Load Dataset
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

