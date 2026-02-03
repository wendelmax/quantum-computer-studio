import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt, faDownload } from '@fortawesome/free-solid-svg-icons'
import { getItem, setItem } from '../../lib/safeStorage'

const EXPORT_FORMATS = [
  { id: 'json', label: 'JSON' },
  { id: 'qasm', label: 'OpenQASM' },
  { id: 'cirq', label: 'Cirq (Python)' },
  { id: 'quil', label: 'Quil' },
] as const

const EXTERNAL_LINKS = [
  { name: 'IBM Quantum Experience', url: 'https://quantum.ibm.com/composer', description: 'Build and run circuits on IBM hardware' },
  { name: 'Qiskit', url: 'https://qiskit.org/documentation/', description: 'OpenQASM compatible' },
  { name: 'Amazon Braket', url: 'https://aws.amazon.com/braket/', description: 'Export QASM or Braket SDK' },
  { name: 'Cirq', url: 'https://quantumai.google/cirq', description: 'Export Cirq Python from Studio' },
]

const STORAGE_KEY = 'quantum:prefs:defaultExportFormat'

export default function Integrations() {
  const [defaultFormat, setDefaultFormat] = useState<string>(() => getItem(STORAGE_KEY) || 'json')

  useEffect(() => {
    setItem(STORAGE_KEY, defaultFormat)
  }, [defaultFormat])

  return (
    <div className="rounded-lg p-4 bg-bg-card border border-theme-border">
      <div className="text-sm font-medium mb-3 text-theme-text">Integrations</div>
      <div className="space-y-4">
        <div>
          <div className="text-xs text-theme-text-muted mb-2 flex items-center gap-1.5">
            <FontAwesomeIcon icon={faDownload} className="text-[10px]" />
            Default export format (Studio)
          </div>
          <select
            value={defaultFormat}
            onChange={(e) => setDefaultFormat(e.target.value)}
            className="w-full px-3 py-2 bg-theme-input-bg border border-theme-border rounded text-sm text-theme-text font-medium"
          >
            {EXPORT_FORMATS.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="text-xs text-theme-text-muted mb-2 flex items-center gap-1.5">
            <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
            Use circuits in external platforms
          </div>
          <p className="text-xs text-theme-text-muted mb-2">
            Export from Quantum Studio as QASM, Cirq, or Quil and paste into these tools.
          </p>
          <ul className="space-y-2">
            {EXTERNAL_LINKS.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded bg-theme-surface border border-theme-border hover:border-primary hover:bg-primary/10 transition-all text-sm text-theme-text"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px] text-primary" />
                    {link.name}
                  </span>
                  <span className="text-xs text-theme-text-muted mt-0.5 block">{link.description}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
