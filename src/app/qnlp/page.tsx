import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronRight, faPlus } from '@fortawesome/free-solid-svg-icons'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { parsePhraseToCircuit, analyzeSentiment, VOCABULARY } from '../../lib/quantum/qnlp/QNLPService'
import { generateLambeqScript } from '../../lib/quantum/qnlp/lambeqExport'
import SyntaxTreeViewer from './components/SyntaxTreeViewer'
import { runSimulation } from '../circuits/services/simulator'
import { useTranslation } from 'react-i18next'
import { useQuantumStore } from '../../store/quantumStore'
import type { Circuit } from 'quantum-computer-js'

export default function QNLPPage() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const setCircuit = useQuantumStore(state => state.setCircuit)
    const [phrase, setPhrase] = useState('cat happy')
    const [sentiment, setSentiment] = useState<{ label: string, score: number } | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
        Noun: true,
        Verb: true,
        Adj: true
    })

    const toggleCategory = (cat: string) => {
        setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }))
    }

    const addWordToPhrase = (word: string) => {
        setPhrase(prev => {
            const trimmed = prev.trim()
            if (!trimmed) return word
            return `${trimmed} ${word}`
        })
    }

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

    const downloadLambeqScript = () => {
        const scriptContent = generateLambeqScript(phrase)
        const element = document.createElement("a")
        const file = new Blob([scriptContent], { type: 'text/plain' })
        element.href = URL.createObjectURL(file)
        element.download = "qnlp_lambeq_experiment.py"
        document.body.appendChild(element)
        element.click()
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

                        <div className="flex flex-wrap gap-2 mt-4">
                            <span className="text-xs text-theme-text-muted self-center">{t('qnlp.try_label')}</span>
                            {(i18n.language.startsWith('pt') ? [
                                t('qnlp.example_2', 'gato com fome'),
                                t('qnlp.example_4', 'rato come comida')
                            ] : [
                                t('qnlp.example_1', 'cat happy'),
                                t('qnlp.example_3', 'cat chases mouse'),
                            ]).map(example => (
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
                            <div className="flex gap-2 w-full mt-4">
                                <Button variant="secondary" onClick={openInStudio} className="flex-1">
                                    {t('qnlp.visualize_btn')}
                                </Button>
                                <Button variant="primary" onClick={downloadLambeqScript} className="flex-1 bg-python hover:bg-python-dark text-white border-none">
                                    {t('qnlp.export_lambeq', 'Export Lambeq Pipeline (.py)')}
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                <Card title={t('qnlp.syntax.title', 'Quantum Syntax Tree')}>
                     <SyntaxTreeViewer phrase={phrase} />
                </Card>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4">
                <Card title={t('qnlp.vocab_title')}>
                    <div className="space-y-4">
                        {(() => {
                            // Group vocabulary by grammatical type
                            const grouped: Record<string, { label: string, words: string[] }[]> = { Noun: [], Verb: [], Adj: [] }
                            const processedLabels = new Set<string>()

                            Object.entries(VOCABULARY).forEach(([word, data]) => {
                                // Filter by current language
                                const currentLang = i18n.language.startsWith('pt') ? 'pt' : 'en'
                                if (data.lang && data.lang !== currentLang) return

                                if (processedLabels.has(data.label)) {
                                    // Add the word variation to the existing label group
                                    for (const cat of ['Noun', 'Verb', 'Adj']) {
                                        const entry = grouped[cat].find(e => e.label === data.label)
                                        if (entry && !entry.words.includes(word)) entry.words.push(word)
                                    }
                                    return
                                }
                                processedLabels.add(data.label)

                                const isNoun = data.label.includes('cat') || data.label.includes('gato') || data.label.includes('gata') || data.label.includes('mouse') || data.label.includes('rato') || data.label.includes('food') || data.label.includes('comida') || data.label.includes('dog') || data.label.includes('cão') || data.label.includes('cachorro')
                                const isVerb = data.label.includes('chase') || data.label.includes('persegue') || data.label.includes('eat') || data.label.includes('come') || data.label.includes('sleep') || data.label.includes('dorme') || data.label.includes('like') || data.label.includes('gosta')
                                const typeStr = isNoun ? 'Noun' : isVerb ? 'Verb' : 'Adj'
                                
                                grouped[typeStr].push({ label: data.label, words: [word] })
                            })

                            return ['Noun', 'Verb', 'Adj'].map(cat => (
                                <div key={cat} className="flex flex-col gap-2 rounded bg-theme-border/10">
                                    <button 
                                        onClick={() => toggleCategory(cat)}
                                        className="flex items-center justify-between p-2 rounded-t hover:bg-theme-border/20 transition-colors w-full text-left"
                                    >
                                        <div className="flex items-center gap-2">
                                            <code className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
                                                {cat === 'Noun' ? t('qnlp.noun_desc', 'Noun').split(':')[0] : cat === 'Verb' ? t('qnlp.verb_desc', 'Verb').split(':')[0] : t('qnlp.adj_desc', 'Adjective').split(':')[0]}
                                            </code>
                                            <span className="text-xs text-theme-text-muted font-medium ml-1">({grouped[cat].length})</span>
                                        </div>
                                        <FontAwesomeIcon icon={expandedCategories[cat] ? faChevronDown : faChevronRight} className="text-xs text-theme-text-muted" />
                                    </button>
                                    
                                    {expandedCategories[cat] && (
                                        <div className="space-y-2 p-2 pt-0 animate-fade-in border-t border-theme-border/50">
                                            {grouped[cat].map(item => (
                                                <div key={item.label} className="flex flex-col gap-1.5 p-2 rounded bg-theme-surface border border-theme-border/50">
                                                    <span className="text-xs font-semibold text-theme-text">{item.label}</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {item.words.map(w => (
                                                            <button
                                                                key={w}
                                                                onClick={() => addWordToPhrase(w)}
                                                                className="flex items-center gap-1 px-2 py-1 bg-theme-border/20 hover:bg-theme-border/50 hover:text-primary transition-colors rounded text-xs text-theme-text-muted cursor-pointer"
                                                                title="Add to phrase"
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} className="text-[8px] opacity-50" />
                                                                {w}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        })()}
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
