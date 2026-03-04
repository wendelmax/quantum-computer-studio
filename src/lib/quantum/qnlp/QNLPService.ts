import { Gate } from '../../../types/quantum'

export interface WordEncoding {
  label: string
  circuit: (target: number) => Gate[]
}

export const VOCABULARY: Record<string, WordEncoding> = {
  // Nouns (States)
  'cat': {
    label: '🐱 cat',
    circuit: (t) => [{ type: 'X', target: t }] // Represent as |1>
  },
  'mouse': {
    label: '🐭 mouse',
    circuit: (t) => [{ type: 'H', target: t }] // Represent as superposition
  },
  'food': {
    label: '🧀 food',
    circuit: (t) => [{ type: 'RY', target: t, angle: Math.PI / 4 }]
  },
  
  // Verbs (Transformations/Gates)
  'chases': {
    label: '🏃 chases',
    circuit: (t) => [{ type: 'H', target: t }, { type: 'Z', target: t }]
  },
  'eats': {
    label: '🍴 eats',
    circuit: (t) => [{ type: 'RX', target: t, angle: Math.PI / 2 }]
  },
  'sleeps': {
    label: '😴 sleeps',
    circuit: (t) => [{ type: 'I', target: t }] // Identity
  },

  // Adjectives (Rotations/Phases)
  'happy': {
    label: '😊 happy',
    circuit: (t) => [{ type: 'RY', target: t, angle: 0.8 }]
  },
  'hungry': {
    label: '🤤 hungry',
    circuit: (t) => [{ type: 'RY', target: t, angle: -0.8 }]
  }
}

export function parsePhraseToCircuit(phrase: string): { gates: Gate[], numQubits: number } {
  const words = phrase.toLowerCase().split(/\s+/)
  const gates: Gate[] = []
  let currentQubit = 0

  words.forEach(word => {
    if (VOCABULARY[word]) {
      const encoding = VOCABULARY[word]
      gates.push(...encoding.circuit(currentQubit))
      // For demo purposes, we cycle through 2-3 qubits or stay on one
      // In a real DisCoCat/QNLP, this would be more complex (entangling qubits for grammatic relations)
    }
  })

  // Simple entanglement for "Subject Verbs Object"
  if (words.length >= 3) {
    gates.push({ type: 'CNOT', control: 0, target: 1 })
  }

  return { gates, numQubits: Math.max(2, Math.min(words.length, 5)) }
}

export function analyzeSentiment(probabilities: number[]): { label: string, score: number } {
  // Simple heuristic: state |0> is positive, |1> is negative
  // In our encoding, 'cat' is |1> (negative), 'happy' rotates towards |0>
  const p0 = probabilities[0] || 0
  
  if (p0 > 0.6) return { label: 'Positive', score: p0 }
  if (p0 < 0.4) return { label: 'Negative', score: 1 - p0 }
  return { label: 'Neutral', score: 0.5 }
}
