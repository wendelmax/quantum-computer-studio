import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { parsePhraseToCircuit, analyzeSentiment, VOCABULARY } from '../../lib/quantum/qnlp/QNLPService'
import { runSimulation } from '../circuits/services/simulator'
import { QUANTUM_SET_CIRCUIT } from '../../lib/events'
import { setItem } from '../../lib/safeStorage'

export default function QNLPPage() {
    const navigate = useNavigate()
    const [phrase, setPhrase] = useState('cat happy')
    const [sentiment, setSentiment] = useState<{ label: string, score: number } | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleRun = async () => {
        setIsLoading(true)
        try {
            const { gates, numQubits } = parsePhraseToCircuit(phrase)
            const circuit = { gates, numQubits }

            // Update local storage for studio
            setItem('quantum:loadCircuit', JSON.stringify(circuit))
            setItem('quantum:circuit', JSON.stringify(circuit))
            setItem('quantum:prefs:numQubits', String(numQubits))

            const result = await runSimulation(circuit)
            const res = analyzeSentiment(Object.values(result.probabilities))
            setSentiment(res)
        } catch (error) {
            console.error('QNLP analysis failed:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const openInStudio = () => {
        const { gates, numQubits } = parsePhraseToCircuit(phrase)
        const circuit = { gates, numQubits }
        setItem('quantum:loadCircuit', JSON.stringify(circuit))
        setItem('quantum:circuit', JSON.stringify(circuit))
        setItem('quantum:prefs:numQubits', String(numQubits))
        window.dispatchEvent(new CustomEvent(QUANTUM_SET_CIRCUIT, { detail: { circuit, autoRun: true } }))
        navigate('/circuits')
    }

    return (
        <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-theme-text">Quantum NLP (QNLP)</h2>
                    <Button onClick={() => navigate('/circuits')}>Open Quantum Studio</Button>
                </div>

                <Card title="Semantic Reasoning" description="Type a phrase to convert it into a quantum circuit">
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={phrase}
                                onChange={(e) => setPhrase(e.target.value)}
                                placeholder="e.g. cat happy, cat chases mouse hungry"
                                className="flex-1 px-4 py-2 rounded bg-theme-surface border border-theme-border text-theme-text focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <Button onClick={handleRun} disabled={isLoading}>
                                {isLoading ? 'Analyzing...' : 'Analyze'}
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-theme-text-muted self-center">Try:</span>
                            {['cat happy', 'cat hungry', 'cat chases mouse', 'mouse eats food'].map(example => (
                                <button
                                    key={example}
                                    onClick={() => setPhrase(example)}
                                    className="text-xs px-2 py-1 rounded bg-theme-border/30 hover:bg-theme-border/60 text-theme-text transition-colors"
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>

                {sentiment && (
                    <Card
                        title="Sentiment Analysis Results"
                        className={`border-l-4 ${sentiment.label === 'Positive' ? 'border-l-emerald-500' : sentiment.label === 'Negative' ? 'border-l-rose-500' : 'border-l-amber-500'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-theme-text-muted text-xs uppercase tracking-wider font-semibold">Classification</div>
                                <div className={`text-2xl font-bold ${sentiment.label === 'Positive' ? 'text-emerald-400' : sentiment.label === 'Negative' ? 'text-rose-400' : 'text-amber-400'}`}>
                                    {sentiment.label}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-theme-text-muted text-xs uppercase tracking-wider font-semibold">Quantum Score</div>
                                <div className="text-2xl font-mono font-semibold text-theme-text">
                                    {(sentiment.score * 100).toFixed(1)}%
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-theme-border">
                            <div className="text-sm text-theme-text mb-4">
                                The sentiment is derived from the final quantum state of the circuit representation.
                            </div>
                            <Button variant="secondary" onClick={openInStudio} className="w-full">
                                Visualize Circuit in Studio
                            </Button>
                        </div>
                    </Card>
                )}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4">
                <Card title="Active Vocabulary">
                    <div className="space-y-3">
                        {Object.entries(VOCABULARY).map(([word, data]) => (
                            <div key={word} className="flex items-center justify-between p-2 rounded bg-theme-border/20">
                                <span className="text-sm font-medium text-theme-text">{data.label}</span>
                                <code className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                    {word === 'cat' || word === 'mouse' ? 'Noun' : word === 'chases' || word === 'eats' ? 'Verb' : 'Adj'}
                                </code>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="How it Works">
                    <div className="text-xs text-theme-text space-y-3 leading-relaxed">
                        <p>
                            QNLP maps language structures (nouns, verbs) to quantum objects (states, gates).
                        </p>
                        <p>
                            This demo uses a simplified <strong>DisCoCat</strong> (Distributional Compositional Categorical) model where:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-theme-text-muted">
                            <li><strong>Nouns</strong> define initial qubit states</li>
                            <li><strong>Adjectives</strong> apply rotation gates (phases)</li>
                            <li><strong>Verbs</strong> act as entangling operations</li>
                        </ul>
                        <p className="mt-2 pt-2 border-t border-theme-border">
                            The final "sentiment" is measured by the probability of the system collapsing into a base state.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    )
}
