import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faDownload, faTrash, faEye, faUpload, faExternalLink, faTimes } from '@fortawesome/free-solid-svg-icons'
import Button from '../../components/Button'
import Card from '../../components/Card'
import { getItem, setItem, parseJSON } from '../../lib/safeStorage'
import { useQuantumStore } from '../../store/quantumStore'

type CircuitGallery = {
  id: string
  name: string
  description: string
  circuit: unknown
  date: string
}

export default function GalleryPage() {
  const navigate = useNavigate()
  const [savedCircuits, setSavedCircuits] = useState<CircuitGallery[]>([])
  const [selectedCircuit, setSelectedCircuit] = useState<string | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveDescription, setSaveDescription] = useState('')
  const circuit = useQuantumStore(state => state.circuit)
  const setCircuit = useQuantumStore(state => state.setCircuit)

  useEffect(() => {
    loadSavedCircuits()
  }, [])

  const loadSavedCircuits = () => {
    const raw = getItem('quantum:gallery')
    if (raw) {
      const parsed = parseJSON<CircuitGallery[]>(raw, [])
      if (Array.isArray(parsed)) setSavedCircuits(parsed)
    }
  }

  const openSaveModal = () => {
    if (!circuit) return
    setSaveName(`Circuit ${savedCircuits.length + 1}`)
    setSaveDescription(`${circuit.gates?.length ?? 0} gates on ${circuit.numQubits ?? 0} qubits`)
    setShowSaveModal(true)
  }

  const saveCurrentCircuit = () => {
    if (!circuit) return
    const newCircuit: CircuitGallery = {
      id: Date.now().toString(),
      name: saveName.trim() || `Circuit ${savedCircuits.length + 1}`,
      description: saveDescription.trim() || `${circuit.gates?.length ?? 0} gates on ${circuit.numQubits ?? 0} qubits`,
      circuit,
      date: new Date().toISOString()
    }
    const updated = [newCircuit, ...savedCircuits].slice(0, 20)
    setSavedCircuits(updated)
    setItem('quantum:gallery', JSON.stringify(updated))
    setShowSaveModal(false)
  }

  const loadCircuit = (id: string) => {
    const item = savedCircuits.find(c => c.id === id)
    if (!item) return
    setCircuit(item.circuit as any)
    navigate('/circuits')
  }

  const deleteCircuit = (id: string) => {
    const updated = savedCircuits.filter(c => c.id !== id)
    setSavedCircuits(updated)
    setItem('quantum:gallery', JSON.stringify(updated))
  }

  const selectedCircuitData = selectedCircuit ? savedCircuits.find(c => c.id === selectedCircuit) : null

  return (
    <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-9 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-theme-text">Circuit Gallery</h2>
          <Button onClick={openSaveModal}>
            <FontAwesomeIcon icon={faSave} className="mr-1.5" />
            Save Current Circuit
          </Button>
        </div>

        {showSaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowSaveModal(false)}>
            <div className="rounded-lg bg-bg-card border border-theme-border p-4 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-theme-text">Save circuit</h3>
                <button className="p-1 rounded hover:bg-theme-surface text-theme-text" onClick={() => setShowSaveModal(false)} aria-label="Close">
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <label className="block text-sm text-theme-text mb-1">Name</label>
              <input
                type="text"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                className="w-full px-3 py-2 rounded text-sm mb-3"
                placeholder="Circuit name"
              />
              <label className="block text-sm text-theme-text mb-1">Description</label>
              <input
                type="text"
                value={saveDescription}
                onChange={e => setSaveDescription(e.target.value)}
                className="w-full px-3 py-2 rounded text-sm mb-4"
                placeholder="Optional description"
              />
              <div className="flex gap-2">
                <Button className="flex-1" onClick={saveCurrentCircuit}>Save</Button>
                <Button variant="secondary" onClick={() => setShowSaveModal(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

        <Card>
          <p className="text-sm text-theme-text mb-4">
            Save your favorite circuits and load them anytime. Circuits are saved locally in your browser.
          </p>
        </Card>

        {savedCircuits.length === 0 ? (
          <Card title="No Saved Circuits">
            <div className="text-sm text-theme-text">
              Save your first circuit from Quantum Studio to see it here.
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedCircuits.map(circuit => (
              <Card key={circuit.id} title={circuit.name} description={circuit.description}>
                <div className="text-xs text-theme-text-muted mb-3">
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

      <div className="lg:col-span-3 flex flex-col gap-4">
        <Card title="Circuit Details">
          {selectedCircuitData ? (
            <div className="space-y-3">
              <div className="font-semibold">{selectedCircuitData.name}</div>
              <div className="text-sm text-theme-text">{selectedCircuitData.description}</div>
              <div className="text-xs text-theme-text-muted">
                Created: {new Date(selectedCircuitData.date).toLocaleString()}
              </div>
              <Button className="w-full" onClick={() => loadCircuit(selectedCircuitData.id)}>
                <FontAwesomeIcon icon={faExternalLink} className="mr-1.5" />
                Load in Studio
              </Button>
            </div>
          ) : (
            <div className="text-sm text-theme-text-muted">Select a circuit to view details</div>
          )}
        </Card>

        <Card title="Import/Export">
          <div className="space-y-2 text-xs text-theme-text">
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
                  if (Array.isArray(imported)) {
                    setSavedCircuits(imported)
                    setItem('quantum:gallery', JSON.stringify(imported))
                  }
                } catch { }
              }}
            />
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="space-y-2">
            <Button variant="secondary" className="w-full" onClick={() => navigate('/circuits')}>
              Open Quantum Studio
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => {
              if (confirm('Clear all saved circuits?')) {
                setSavedCircuits([])
                setItem('quantum:gallery', '[]')
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
