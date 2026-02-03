import React from 'react'
import Button from '../../../components/Button'

type Props = {
  onSelect?: (gate: string) => void
}

const gates = ['H','X','Y','Z','CNOT','RX','RY','RZ']

export default function GateLibrary({ onSelect }: Props) {
  return (
    <div className="rounded-lg p-4 bg-bg-card border border-theme-border">
      <h3 className="text-sm font-medium text-theme-text">Gate Library</h3>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {gates.map((g) => (
          <Button key={g} variant="secondary" onClick={() => onSelect?.(g)}>{g}</Button>
        ))}
      </div>
    </div>
  )
}


