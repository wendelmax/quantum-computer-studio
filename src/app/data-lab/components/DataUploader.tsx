import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload, faFileCsv } from '@fortawesome/free-solid-svg-icons'

export default function DataUploader({ onLoad }: { onLoad: (rows: string[][]) => void }) {
  const [dragOver, setDragOver] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  function parseCsv(text: string): string[][] {
    return text.split(/\r?\n/).filter(Boolean).map(line => line.split(/,|;|\t/))
  }
  
  const handleFile = async (file: File) => {
    const text = await file.text()
    onLoad(parseCsv(text))
  }
  
  return (
    <div className="rounded-lg p-4 bg-bg-card border border-theme-border">
      <div className="text-sm font-medium mb-3 flex items-center gap-2 text-theme-text">
        <FontAwesomeIcon icon={faUpload} className="text-primary" />
        Upload CSV
      </div>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
          dragOver 
            ? 'border-primary bg-primary/10' 
            : 'border-theme-border hover:border-primary/50 hover:bg-theme-surface/50'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const file = e.dataTransfer.files[0]
          if (file && (file.name.endsWith('.csv') || file.name.endsWith('.txt'))) {
            handleFile(file)
          }
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <FontAwesomeIcon icon={faFileCsv} className="text-4xl text-theme-text-muted mb-2" />
        <div className="text-sm text-theme-text mb-1">
          {dragOver ? 'Drop file here' : 'Click to upload or drag & drop'}
        </div>
        <div className="text-xs text-theme-text-muted">
          CSV, TSV files supported
        </div>
        <input 
          ref={fileInputRef}
          className="hidden" 
          type="file" 
          accept=".csv,.txt,.tsv" 
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            handleFile(file)
          }} 
        />
      </div>
    </div>
  )
}
