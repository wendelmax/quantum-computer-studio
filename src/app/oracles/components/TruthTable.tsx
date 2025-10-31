import React from 'react'

type Props = {
  truthTable: Record<string, string>
  numInputs: number
}

export default function TruthTable({ truthTable, numInputs }: Props) {
  const inputs = Array.from({ length: 2 ** numInputs }, (_, i) => 
    i.toString(2).padStart(numInputs, '0')
  )

  return (
    <div className="p-4 rounded bg-bg-card border border-slate-800">
      <h4 className="text-sm font-medium mb-3">Truth Table</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 px-2 text-slate-400">Input</th>
              <th className="text-left py-2 px-2 text-slate-400">Output</th>
            </tr>
          </thead>
          <tbody>
            {inputs.map(input => (
              <tr key={input} className="border-b border-slate-800/50">
                <td className="py-2 px-2 font-mono text-slate-200">
                  {input.split('').join(' ')}
                </td>
                <td className="py-2 px-2 font-mono text-sky-400">
                  {truthTable[input] || '?'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

