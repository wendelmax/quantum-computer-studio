import { type CircuitGate as Gate } from 'quantum-computer-js'

export interface WordEncoding {
  label: string
  circuit: (target: number) => Gate[]
  lang?: 'en' | 'pt'
}

export const VOCABULARY: Record<string, WordEncoding> = {
  // --- NOUNS (States / Objects) ---
  'cat': { label: '🐱 cat', circuit: (t) => [{ type: 'X', target: t }], lang: 'en' },
  'gato': { label: '🐱 gato', circuit: (t) => [{ type: 'X', target: t }], lang: 'pt' },
  'gata': { label: '🐱 gata', circuit: (t) => [{ type: 'X', target: t }], lang: 'pt' },
  
  'mouse': { label: '🐭 mouse', circuit: (t) => [{ type: 'H', target: t }], lang: 'en' },
  'rato': { label: '🐭 rato', circuit: (t) => [{ type: 'H', target: t }], lang: 'pt' },
  
  'food': { label: '🧀 food', circuit: (t) => [{ type: 'RY', target: t, angle: Math.PI / 4 }], lang: 'en' },
  'comida': { label: '🧀 comida', circuit: (t) => [{ type: 'RY', target: t, angle: Math.PI / 4 }], lang: 'pt' },

  'dog': { label: '🐶 dog', circuit: (t) => [{ type: 'X', target: t }, { type: 'H', target: t }], lang: 'en' },
  'cachorro': { label: '🐶 cachorro', circuit: (t) => [{ type: 'X', target: t }, { type: 'H', target: t }], lang: 'pt' },
  'cão': { label: '🐶 cão', circuit: (t) => [{ type: 'X', target: t }, { type: 'H', target: t }], lang: 'pt' },

  // --- VERBS (Transformations / Entitlements) ---
  'chases': { label: '🏃 chases', circuit: (t) => [{ type: 'H', target: t }, { type: 'Z', target: t }], lang: 'en' },
  'perseguem': { label: '🏃 perseguem', circuit: (t) => [{ type: 'H', target: t }, { type: 'Z', target: t }], lang: 'pt' },
  'persegue': { label: '🏃 persegue', circuit: (t) => [{ type: 'H', target: t }, { type: 'Z', target: t }], lang: 'pt' },

  'eats': { label: '🍴 eats', circuit: (t) => [{ type: 'RX', target: t, angle: Math.PI / 2 }], lang: 'en' },
  'eat': { label: '🍴 eat', circuit: (t) => [{ type: 'RX', target: t, angle: Math.PI / 2 }], lang: 'en' },
  'come': { label: '🍴 come', circuit: (t) => [{ type: 'RX', target: t, angle: Math.PI / 2 }], lang: 'pt' },
  'comem': { label: '🍴 comem', circuit: (t) => [{ type: 'RX', target: t, angle: Math.PI / 2 }], lang: 'pt' },

  'sleeps': { label: '😴 sleeps', circuit: (t) => [{ type: 'I', target: t }], lang: 'en' },
  'dorme': { label: '😴 dorme', circuit: (t) => [{ type: 'I', target: t }], lang: 'pt' },

  'likes': { label: '💖 likes', circuit: (t) => [{ type: 'RY', target: t, angle: Math.PI / 3 }], lang: 'en' },
  'gosta': { label: '💖 gosta', circuit: (t) => [{ type: 'RY', target: t, angle: Math.PI / 3 }], lang: 'pt' },

  // --- ADJECTIVES (Rotations / Phases) ---
  'happy': { label: '😊 happy', circuit: (t) => [{ type: 'RY', target: t, angle: 0.8 }], lang: 'en' },
  'feliz': { label: '😊 feliz', circuit: (t) => [{ type: 'RY', target: t, angle: 0.8 }], lang: 'pt' },

  'hungry': { label: '🤤 hungry', circuit: (t) => [{ type: 'RY', target: t, angle: -0.8 }], lang: 'en' },
  'faminto': { label: '🤤 faminto', circuit: (t) => [{ type: 'RY', target: t, angle: -0.8 }], lang: 'pt' },
  'com fome': { label: '🤤 faminto', circuit: (t) => [{ type: 'RY', target: t, angle: -0.8 }], lang: 'pt' },

  'sad': { label: '😢 sad', circuit: (t) => [{ type: 'RZ', target: t, angle: Math.PI }], lang: 'en' },
  'triste': { label: '😢 triste', circuit: (t) => [{ type: 'RZ', target: t, angle: Math.PI }], lang: 'pt' },
}

export function parsePhraseToCircuit(phrase: string): { gates: Gate[], numQubits: number } {
  // Advanced grammar mapping: Nouns get distinct qubits. Verbs act as operators/entanglers on previous nouns. Adjectives modify the immediate noun's qubit.
  // This is a naive approximation of DisCoCat logic where words map to wires and cups/spiders.
  const words = phrase.toLowerCase().replace(/[^a-zãõáéíóúç ]/g, '').split(/\s+/)
  const gates: Gate[] = []
  
  let currentQubit = 0
  let previousNounQubit = -1

  // Determine structural category simply by its label.
  const isNoun = (k: string) => VOCABULARY[k]?.label.includes('cat') || VOCABULARY[k]?.label.includes('gato') || VOCABULARY[k]?.label.includes('gata') || VOCABULARY[k]?.label.includes('mouse') || VOCABULARY[k]?.label.includes('rato') || VOCABULARY[k]?.label.includes('food') || VOCABULARY[k]?.label.includes('comida') || VOCABULARY[k]?.label.includes('dog') || VOCABULARY[k]?.label.includes('cão') || VOCABULARY[k]?.label.includes('cachorro')
  const isVerb = (k: string) => VOCABULARY[k]?.label.includes('chase') || VOCABULARY[k]?.label.includes('persegue') || VOCABULARY[k]?.label.includes('eat') || VOCABULARY[k]?.label.includes('come') || VOCABULARY[k]?.label.includes('sleep') || VOCABULARY[k]?.label.includes('dorme') || VOCABULARY[k]?.label.includes('like') || VOCABULARY[k]?.label.includes('gosta')

  words.forEach(word => {
    if (VOCABULARY[word]) {
      const encoding = VOCABULARY[word]
      
      if (isNoun(word)) {
        // Nouns open a new wire (qubit)
        gates.push(...encoding.circuit(currentQubit))
        previousNounQubit = currentQubit
        currentQubit++
      } else if (isVerb(word)) {
        // Verbs apply their transformation to the last noun (Subject) 
        // If there's an Object (another noun later), we will entangle them at the end.
        const targetQubit = previousNounQubit >= 0 ? previousNounQubit : 0
        gates.push(...encoding.circuit(targetQubit))
      } else {
        // Adjectives apply rotations to the CURRENT wire that is about to host a noun, or the previous one if it came after.
        const targetQubit = previousNounQubit >= 0 ? previousNounQubit : currentQubit
        gates.push(...encoding.circuit(targetQubit))
      }
    }
  })

  // Simple Entanglement for Subject-Verb-Object (SVO) structures
  // E.g., Qubit 0 (Subject) and Qubit 1 (Object) are entangled if a Verb linked them
  if (currentQubit > 1) {
    for (let i = 0; i < currentQubit - 1; i++) {
        gates.push({ type: 'CNOT', control: i, target: i + 1 })
    }
  }

  const finalQubits = Math.max(2, currentQubit)
  return { gates, numQubits: finalQubits }
}

export function analyzeSentiment(probabilities: number[]): { label: string, score: number } {
  // Simple heuristic: state |0> is positive, |1> is negative
  // In our encoding, 'cat' is |1> (negative), 'happy' rotates towards |0>
  const p0 = probabilities[0] || 0

  if (p0 > 0.6) return { label: 'Positive', score: p0 }
  if (p0 < 0.4) return { label: 'Negative', score: 1 - p0 }
  return { label: 'Neutral', score: 0.5 }
}
