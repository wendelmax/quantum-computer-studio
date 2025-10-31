import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faDownload, faTrash, faEye, faUpload, faExternalLink } from '@fortawesome/free-solid-svg-icons'
import Button from '../../components/Button'
import Card from '../../components/Card'

type CircuitGallery = {
  id: string
  name: string
  description: string
  circuit: any
  date: string
}

export default function GalleryPage() {
  const [savedCircuits, setSavedCircuits] = useState<CircuitGallery[]>([])
  const [selectedCircuit, setSelectedCircuit] = useState<string | null>(null)

  useEffect(() => {
    loadSavedCircuits()
  }, [])

  const loadSavedCircuits = () => {
    try {
      const raw = localStorage.getItem('quantum:gallery')
      if (raw) {
        setSavedCircuits(JSON.parse(raw))
      }
    } catch {}
  }

  const saveCurrentCircuit = () => {
    try {
      const raw = localStorage.getItem('quantum:circuit')
      if (!raw) return
      
      const circuit = JSON.parse(raw)
      const newCircuit: CircuitGallery = {
        id: Date.now().toString(),
        name: `Circuit ${savedCircuits.length + 1}`,
        description: `${circuit.gates.length} gates on ${circuit.numQubits} qubits`,
        circuit,
        date: new Date().toISOString()
      }
      
      const updated = [newCircuit, ...savedCircuits].slice(0, 20)
      setSavedCircuits(updated)
      localStorage.setItem('quantum:gallery', JSON.stringify(updated))
    } catch {}
  }

  const loadCircuit = (id: string) => {
    const circuit = savedCircuits.find(c => c.id === id)
    if (!circuit) return
    
    try {
      localStorage.setItem('quantum:loadCircuit', JSON.stringify(circuit.circuit))
      localStorage.setItem('quantum:circuit', JSON.stringify(circuit.circuit))
      localStorage.setItem('quantum:prefs:numQubits', String(circuit.circuit.numQubits))
      window.dispatchEvent(new CustomEvent('quantum:set-circuit', { detail: { circuit: circuit.circuit, autoRun: false } }))
      window.location.href = '/circuits'
    } catch {}
  }

  const deleteCircuit = (id: string) => {
    const updated = savedCircuits.filter(c => c.id !== id)
    setSavedCircuits(updated)
    localStorage.setItem('quantum:gallery', JSON.stringify(updated))
  }

  const selectedCircuitData = selectedCircuit ? savedCircuits.find(c => c.id === selectedCircuit) : null

  return (
    <div className="p-6 grid grid-cols-12 gap-4">
      <div className="col-span-9 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Circuit Gallery</h2>
          <Button onClick={saveCurrentCircuit}>
            <FontAwesomeIcon icon={faSave} className="mr-1.5" />
            Save Current Circuit
          </Button>
        </div>

        <Card>
          <p className="text-sm text-slate-300 mb-4">
            Save your favorite circuits and load them anytime. Circuits are saved locally in your browser.
          </p>
        </Card>

        {savedCircuits.length === 0 ? (
          <Card title="No Saved Circuits">
            <div className="text-sm text-slate-300">
              Save your first circuit from Quantum Studio to see it here.
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {savedCircuits.map(circuit => (
              <Card key={circuit.id} title={circuit.name} description={circuit.description}>
                <div className="text-xs text-slate-400 mb-3">
                  {new Date(circuit.date).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => loadCircuit(circuit.id)}>
                    <FontAwesomeIcon icon={faExternalLink} className="mr-1" />
                    Load
                  </Button>
                  <Button variant="secondary" onClick={() => setSelectedCircuit(circuit.id)}>
                    <FontAwesomeIcon icon={faEye} className="mr-1" />
                    View
                  </Button>
                  <Button variant="secondary" onClick={() => deleteCircuit(circuit.id)}>
                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="col-span-3 flex flex-col gap-4">
        <Card title="Circuit Details">
          {selectedCircuitData ? (
            <div className="space-y-3">
              <div className="font-semibold">{selectedCircuitData.name}</div>
              <div className="text-sm text-slate-300">{selectedCircuitData.description}</div>
              <div className="text-xs text-slate-400">
                Created: {new Date(selectedCircuitData.date).toLocaleString()}
              </div>
              <Button className="w-full" onClick={() => loadCircuit(selectedCircuitData.id)}>
                <FontAwesomeIcon icon={faExternalLink} className="mr-1.5" />
                Load in Studio
              </Button>
            </div>
          ) : (
            <div className="text-sm text-slate-400">Select a circuit to view details</div>
          )}
        </Card>

        <Card title="Import/Export">
          <div className="space-y-2 text-xs text-slate-300">
            <p>Export all circuits as JSON:</p>
            <Button variant="secondary" className="w-full text-xs" onClick={() => {
              const blob = new Blob([JSON.stringify(savedCircuits, null, 2)], { type: 'application/json' })
              const a = document.createElement('a')
              a.href = URL.createObjectURL(blob)
              a.download = 'quantum-circuits.json'
              a.click()
            }}>
              <FontAwesomeIcon icon={faDownload} className="mr-1.5" />
              Export Gallery
            </Button>
            <p className="mt-3">Import circuits from JSON:</p>
            <input 
              type="file" 
              accept=".json" 
              className="w-full text-xs"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const text = await file.text()
                try {
                  const imported = JSON.parse(text)
                  setSavedCircuits(imported)
                  localStorage.setItem('quantum:gallery', JSON.stringify(imported))
                } catch {}
              }}
            />
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="space-y-2">
            <Button variant="secondary" className="w-full" onClick={() => window.location.href = '/circuits'}>
              Open Quantum Studio
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => {
              if (confirm('Clear all saved circuits?')) {
                setSavedCircuits([])
                localStorage.removeItem('quantum:gallery')
              }
            }}>
              Clear All
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
