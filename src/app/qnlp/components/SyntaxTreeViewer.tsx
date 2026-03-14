/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { VOCABULARY } from '../../../lib/quantum/qnlp/QNLPService'
import { useTranslation } from 'react-i18next'

interface SyntaxTreeViewerProps {
    phrase: string
}

export default function SyntaxTreeViewer({ phrase }: SyntaxTreeViewerProps) {
    const { t, i18n } = useTranslation()
    const words = phrase.toLowerCase().replace(/[^a-zãõáéíóúç ]/g, '').split(/\s+/).filter(Boolean)
    const currentLang = i18n.language.startsWith('pt') ? 'pt' : 'en'

    if (words.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 text-theme-text-muted border border-dashed border-theme-border rounded-lg">
                {t('qnlp.syntax.empty_phrase', 'Type a phrase to see its syntactic structure.')}
            </div>
        )
    }

    // Identify Word Roles
    const nodes = words.map((w, i) => {
        let type = 'Unknown'
        // Fallback search through Vocabulary to find label
        const entry = Object.entries(VOCABULARY).find(([key, val]) => key === w && val.lang === currentLang) || Object.entries(VOCABULARY).find(([key]) => key === w)
        
        if (entry) {
            const label = entry[1].label
            if (label.includes('cat') || label.includes('gato') || label.includes('gata') || label.includes('mouse') || label.includes('rato') || label.includes('food') || label.includes('comida') || label.includes('dog') || label.includes('cão') || label.includes('cachorro')) type = 'Noun'
            else if (label.includes('chase') || label.includes('persegue') || label.includes('eat') || label.includes('come') || label.includes('sleep') || label.includes('dorme') || label.includes('like') || label.includes('gosta')) type = 'Verb'
            else type = 'Adj'
        }

        return { id: i, word: w, type }
    })

    const nouns = nodes.filter(n => n.type === 'Noun')
    const verbs = nodes.filter(n => n.type === 'Verb')
    const adjs = nodes.filter(n => n.type === 'Adj')

    return (
        <div className="w-full relative py-8 px-4 border border-theme-border rounded-lg bg-theme-surface/50 overflow-x-auto min-h-[250px] flex flex-col items-center">
            
            {/* Legend */}
            <div className="absolute top-2 left-2 flex gap-3 text-[10px] font-mono text-theme-text-muted">
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500"></div> Nouns (Wires)</div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-blue-500/20 border border-blue-500"></div> Verbs (Tensors)</div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-purple-500/20 border border-purple-500"></div> Adj (Rotations)</div>
            </div>

            {/* Tree Layout Container */}
            <div className="flex-1 w-full flex items-center justify-center pb-12 pt-8">
                <div className="relative flex items-end gap-12 font-mono">
                    
                    {/* Render Linear Words (with Entanglement Arcs if Verb connects Nouns) */}
                    {nodes.map((node, index) => {
                        const isNoun = node.type === 'Noun'
                        const isVerb = node.type === 'Verb'
                        const isAdj = node.type === 'Adj'

                        let nodeColor = 'bg-gray-500/10 border-gray-500'
                        let textColor = 'text-gray-400'
                        if (isNoun) { nodeColor = 'bg-emerald-500/10 border-emerald-500'; textColor = 'text-emerald-400' }
                        if (isVerb) { nodeColor = 'bg-blue-500/10 border-blue-500'; textColor = 'text-blue-400' }
                        if (isAdj) { nodeColor = 'bg-purple-500/10 border-purple-500'; textColor = 'text-purple-400' }

                        return (
                            <div key={node.id} className="relative flex flex-col items-center group">
                                {/* The Connection Arc logic for Verbs -> Nouns */}
                                {isVerb && nouns.length >= 1 && (
                                    <svg className="absolute bottom-[40px] left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: Math.max(100, nouns.length * 80), height: 60, minWidth: '150px' }}>
                                         <path 
                                            d={`M 10 0 C 10 80, ${Math.max(100, nouns.length*80) - 10} 80, ${Math.max(100, nouns.length*80) - 10} 0`} 
                                            fill="transparent" 
                                            stroke="currentColor" 
                                            className="text-blue-500/50" 
                                            strokeWidth="2" 
                                            strokeDasharray="4 4"
                                        />
                                    </svg>
                                )}

                                {/* Diagram Wire Component for Nouns */}
                                {isNoun && (
                                    <div className="w-0.5 h-16 bg-emerald-500/30 mb-2 group-hover:bg-emerald-500 transition-colors relative">
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-emerald-500 opacity-50">|x⟩</div>
                                    </div>
                                )}
                                {/* Rotator for Adjective */}
                                {isAdj && (
                                    <div className="w-8 h-8 rounded-full border-2 border-purple-500/50 flex items-center justify-center mb-2 animate-spin-slow">
                                        <div className="w-1 h-4 bg-purple-500/50 rounded-full"></div>
                                    </div>
                                )}

                                <div className={`px-4 py-2 border-2 rounded-xl text-sm font-bold shadow-lg shadow-black/20 ${nodeColor} ${textColor} z-10 bg-theme-base`}>
                                    {node.word}
                                    <div className="text-[9px] uppercase tracking-widest opacity-60 text-center mt-0.5">{node.type}</div>
                                </div>
                            </div>
                        )
                    })}

                </div>
            </div>
            
            <div className="text-xs text-theme-text-muted mt-4 text-center max-w-lg">
                <span className="font-semibold text-theme-text">{t('qnlp.syntax.interpretation', 'DisCoCat Structure:')}</span> 
                {t('qnlp.syntax.interpretation_desc', ' Nouns occupy quantum wires (states). Verbs and adjectives act as quantum operators causing entanglement or phase rotations between subjects.')}
            </div>
        </div>
    )
}
