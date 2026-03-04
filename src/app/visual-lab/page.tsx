import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVial, faSync, faZap, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import Button from '../../components/Button'
import Card from '../../components/Card'
import VisualQubit from './components/VisualQubit'
import { useTranslation } from 'react-i18next'

export default function VisualLabPage() {
    const { t } = useTranslation()
    const [state, setState] = useState({ alpha: [1, 0] as [number, number], beta: [0, 0] as [number, number] })
    const [isSuperposition, setIsSuperposition] = useState(false)
    const [isCollapsing, setIsCollapsing] = useState(false)
    const [collapsedTo, setCollapsedTo] = useState<'0' | '1' | null>('0')

    const applyH = () => {
        setIsCollapsing(false)
        setCollapsedTo(null)
        setIsSuperposition(true)
        setState({ alpha: [1 / Math.sqrt(2), 0], beta: [1 / Math.sqrt(2), 0] })
    }

    const applyX = () => {
        setIsCollapsing(false)
        setIsSuperposition(false)
        if (collapsedTo === '0') {
            setCollapsedTo('1')
            setState({ alpha: [0, 0], beta: [1, 0] })
        } else {
            setCollapsedTo('0')
            setState({ alpha: [1, 0], beta: [0, 0] })
        }
    }

    const measure = () => {
        if (!isSuperposition) return

        setIsCollapsing(true)
        const result = Math.random() > 0.5 ? '0' : '1'
        setCollapsedTo(result)

        setTimeout(() => {
            setIsCollapsing(false)
            setIsSuperposition(false)
            if (result === '0') setState({ alpha: [1, 0], beta: [0, 0] })
            else setState({ alpha: [0, 0], beta: [1, 0] })
        }, 400)
    }

    const reset = () => {
        setIsCollapsing(false)
        setIsSuperposition(false)
        setCollapsedTo('0')
        setState({ alpha: [1, 0], beta: [0, 0] })
    }

    return (
        <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <FontAwesomeIcon icon={faVial} />
                        </span>
                        {t('nav.visual_lab', 'Visual Lab')}
                    </h1>
                    <p className="text-theme-text-muted mt-2 max-w-2xl">{t('visual_lab.desc', 'Interactive visualization of quantum state behavior.')}</p>
                </div>
                <Button variant="secondary" onClick={reset} className="self-start">
                    <FontAwesomeIcon icon={faSync} className="mr-2" />
                    {t('common.reset', 'Reset Qubit')}
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 flex flex-col items-center justify-center glass-card p-12 min-h-[500px] relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                    <VisualQubit
                        state={state}
                        isSuperposition={isSuperposition}
                        isCollapsing={isCollapsing}
                        collapsedTo={collapsedTo}
                    />

                    <div className="mt-16 flex flex-wrap justify-center gap-4">
                        <Button
                            onClick={applyH}
                            className={`px-8 py-3 rounded-2xl font-black transition-all ${isSuperposition ? 'bg-primary/20 text-primary border-primary' : 'bg-primary text-black'}`}
                        >
                            H (Superposition)
                        </Button>
                        <Button
                            onClick={applyX}
                            variant="secondary"
                            className="px-8 py-3 rounded-2xl font-black"
                        >
                            X (Flip)
                        </Button>
                        <Button
                            onClick={measure}
                            disabled={!isSuperposition || isCollapsing}
                            className={`px-8 py-3 rounded-2xl font-black shadow-xl transition-all ${isSuperposition ? 'bg-accent text-white shadow-accent/20 animate-pulse' : 'opacity-50 grayscale'}`}
                        >
                            <FontAwesomeIcon icon={faZap} className="mr-2" />
                            {t('visual_lab.measure', 'Measure')}
                        </Button>
                    </div>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <Card title={t('visual_lab.explanation_title', 'Understanding the State')}>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                    {isSuperposition ? t('visual_lab.super_title', 'Superposition') : t('visual_lab.basis_title', 'Basis State')}
                                </h4>
                                <p className="text-xs text-theme-text-muted leading-relaxed">
                                    {isSuperposition
                                        ? t('visual_lab.super_desc', 'The qubit exists in both |0⟩ and |1⟩ simultaneously. It is not "between" them, but rather a "cloud of probability" until measured.')
                                        : collapsedTo === '0'
                                            ? t('visual_lab.zero_desc', 'The qubit is strictly in state |0⟩. If measured, it will yield "0" with 100% probability.')
                                            : t('visual_lab.one_desc', 'The qubit is strictly in state |1⟩. If measured, it will yield "1" with 100% probability.')
                                    }
                                </p>
                            </div>

                            {isCollapsing && (
                                <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 animate-pulse">
                                    <h4 className="text-sm font-bold text-accent mb-1">{t('visual_lab.collapsing', 'Wavefunction Collapse...')}</h4>
                                    <p className="text-xs text-theme-text-muted">{t('visual_lab.collapse_desc', 'The observation forces the system into a single classical state.')}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl glass border-white/5 text-center">
                                    <span className="text-[10px] uppercase font-black text-theme-text-muted opacity-50 block mb-1">Alpha |0⟩</span>
                                    <span className="font-mono text-xl text-white">{state.alpha[0].toFixed(3)}</span>
                                </div>
                                <div className="p-4 rounded-xl glass border-white/5 text-center">
                                    <span className="text-[10px] uppercase font-black text-theme-text-muted opacity-50 block mb-1">Beta |1⟩</span>
                                    <span className="font-mono text-xl text-white">{state.beta[0].toFixed(3)}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title={t('visual_lab.tips_title', 'Try these steps:')}>
                        <ul className="space-y-3">
                            {[
                                t('visual_lab.tip1', 'Apply X to flip from 0 to 1.'),
                                t('visual_lab.tip2', 'Apply H to enter superposition (the cloud).'),
                                t('visual_lab.tip3', 'Wait for the cloud to pulse, then click Measure.'),
                                t('visual_lab.tip4', 'Observe the "Snap" as it collapses to a single point.')
                            ].map((tip, i) => (
                                <li key={i} className="flex gap-3 text-xs text-theme-text-muted">
                                    <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-primary font-black shrink-0">{i + 1}</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    )
}
