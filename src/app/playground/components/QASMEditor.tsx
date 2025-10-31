import React, { useState } from 'react'

const QASM_SYNTAX = {
  keywords: ['OPENQASM', 'qreg', 'creg', 'gate', 'measure', 'reset', 'barrier', 'if', 'include'],
  gates: ['h', 'x', 'y', 'z', 't', 'tdg', 's', 'sdg', 'u', 'cx', 'cy', 'cz', 'ch', 'swap', 'ccx', 'cu', 'crx', 'cry', 'crz'],
}

function highlightSyntax(text: string): (string | JSX.Element)[] {
  const lines = text.split('\n')
  const result: (string | JSX.Element)[] = []
  
  lines.forEach((line, lineIdx) => {
    const parts: (string | JSX.Element)[] = []
    const tokens = line.split(/(\s+|[;,()\[\]]+)/g)
    
    tokens.forEach((token, tokenIdx) => {
      const lowerToken = token.toLowerCase()
      
      if (QASM_SYNTAX.keywords.includes(lowerToken)) {
        parts.push(<span key={`${lineIdx}-${tokenIdx}`} className="text-purple-400">{token}</span>)
      } else if (QASM_SYNTAX.gates.includes(lowerToken)) {
        parts.push(<span key={`${lineIdx}-${tokenIdx}`} className="text-blue-400">{token}</span>)
      } else if (token.startsWith('//')) {
        parts.push(<span key={`${lineIdx}-${tokenIdx}`} className="text-green-400">{token}</span>)
      } else if (/^\d+\.?\d*$/.test(token)) {
        parts.push(<span key={`${lineIdx}-${tokenIdx}`} className="text-orange-400">{token}</span>)
      } else if (token.startsWith('q[') || token.startsWith('c[')) {
        parts.push(<span key={`${lineIdx}-${tokenIdx}`} className="text-yellow-400">{token}</span>)
      } else {
        parts.push(<span key={`${lineIdx}-${tokenIdx}`} className="text-slate-200">{token}</span>)
      }
    })
    
    result.push(<div key={lineIdx}>{parts}</div>)
  })
  
  return result
}

export default function QASMEditor({ value, onChange }: { value: string; onChange: (v: string)=>void }) {
  const [showHighlight, setShowHighlight] = useState(true)
  const highlighted = showHighlight ? highlightSyntax(value) : value.split('\n').map((line, i) => <div key={i}>{line}</div>)

  return (
    <div className="relative">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium">QASM Editor</div>
        <label className="flex items-center gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={showHighlight}
            onChange={(e) => setShowHighlight(e.target.checked)}
            className="rounded"
          />
          Syntax Highlight
        </label>
      </div>
      <div className="relative w-full rounded border border-slate-800 bg-slate-900/20 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-8 bg-slate-900/30 flex items-center px-3 text-xs text-slate-400 border-b border-slate-800">
          <div className="flex gap-3">
            <span>OPENQASM 2.0</span>
            <span className="text-slate-500">|</span>
            <span>{value.split('\n').length} lines</span>
            <span className="text-slate-500">|</span>
            <span>{value.length} chars</span>
          </div>
        </div>
        <div className="mt-8 relative">
          <div className="absolute top-0 left-3 right-0 bottom-0 text-xs font-mono leading-relaxed p-3 pointer-events-none overflow-auto h-64">
            {highlighted}
          </div>
          <textarea
            className="w-full h-64 bg-transparent text-transparent caret-sky-400 p-3 text-xs font-mono leading-relaxed resize-none focus:outline-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            placeholder="OPENQASM 2.0&#10;include &quot;qelib1.inc&quot;;&#10;&#10;qreg q[2];&#10;creg c[2];&#10;&#10;h q[0];&#10;cx q[0], q[1];&#10;measure q[0] -> c[0];&#10;measure q[1] -> c[1];"
          />
        </div>
      </div>
      <div className="mt-2 text-xs text-slate-400">
        Press Ctrl+Enter or click Run to execute. Note: Full QASM parsing not yet implemented.
      </div>
    </div>
  )
}
