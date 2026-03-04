import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { parsePhraseToCircuit, analyzeSentiment, VOCABULARY } from '../../lib/quantum/qnlp/QNLPService'
import { runSimulation } from '../circuits/services/simulator'
import { useTranslation } from 'react-i18next'
import { useQuantumStore } from '../../store/quantumStore'
import type { Circuit } from '../../types/Circuit'

export default function QNLPPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const setCircuit = useQuantumStore(state => state.setCircuit)
    const [phrase, setPhrase] = useState('cat happy')
    const [sentiment, setSentiment] = useState<{ label: string, score: number } | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleRun = async () => {
        setIsLoading(true)
        try {
            const { gates, numQubits } = parsePhraseToCircuit(phrase)
            const circuit = { gates, numQubits }

            setCircuit(circuit as Circuit)

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
        setCircuit(circuit as Circuit, true)
        navigate('/circuits')
    }

    return (
        <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-theme-text">{t('qnlp.title')}</h2>
                    <Button onClick={() => navigate('/circuits')}>{t('qnlp.open_studio')}</Button>
                </div>

                <Card title={t('qnlp.semantic_reasoning')} description={t('qnlp.semantic_desc')}>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={phrase}
                                onChange={(e) => setPhrase(e.target.value)}
                                placeholder={t('qnlp.placeholder')}
                                className="flex-1 px-4 py-2 rounded bg-theme-surface border border-theme-border text-theme-text focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <Button onClick={handleRun} disabled={isLoading}>
                                {isLoading ? t('qnlp.analyzing') : t('qnlp.analyze_btn')}
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs text-theme-text-muted self-center">{t('qnlp.try_label')}</span>
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
                        title={t('qnlp.results_title')}
                        className={`border-l-4 ${sentiment.label === 'Positive' ? 'border-l-emerald-500' : sentiment.label === 'Negative' ? 'border-l-rose-500' : 'border-l-amber-500'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-theme-text-muted text-xs uppercase tracking-wider font-semibold">{t('qnlp.classification')}</div>
                                <div className={`text-2xl font-bold ${sentiment.label === 'Positive' ? 'text-emerald-400' : sentiment.label === 'Negative' ? 'text-rose-400' : 'text-amber-400'}`}>
                                    {sentiment.label}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-theme-text-muted text-xs uppercase tracking-wider font-semibold">{t('qnlp.quantum_score')}</div>
                                <div className="text-2xl font-mono font-semibold text-theme-text">
                                    {(sentiment.score * 100).toFixed(1)}%
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-theme-border">
                            <div className="text-sm text-theme-text mb-4">
                                {t('qnlp.results_desc')}
                            </div>
                            <Button variant="secondary" onClick={openInStudio} className="w-full">
                                {t('qnlp.visualize_btn')}
                            </Button>
                        </div>
                    </Card>
                )}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4">
                <Card title={t('qnlp.vocab_title')}>
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

                <Card title={t('qnlp.how_it_works_title')}>
                    <div className="text-xs text-theme-text space-y-3 leading-relaxed">
                        <p>
                            {t('qnlp.how_it_works_desc1')}
                        </p>
                        <p>
                            {t('qnlp.how_it_works_desc2')}
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-theme-text-muted">
                            <li><strong>{t('qnlp.noun_desc')}</strong></li>
                            <li><strong>{t('qnlp.adj_desc')}</strong></li>
                            <li><strong>{t('qnlp.verb_desc')}</strong></li>
                        </ul>
                        <p className="mt-2 pt-2 border-t border-theme-border">
                            {t('qnlp.how_it_works_desc3')}
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    )
}
