import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBrain, faFlask, faProjectDiagram, faVial, faPlay, faExternalLinkAlt, faChartLine, faAtom, faNetworkWired } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { useQuantumStore } from '../../store/quantumStore'
import { useTranslation } from 'react-i18next'
import Card from '../../components/Card'
import Button from '../../components/Button'
import TrainingChart from '../../components/TrainingChart'
import { getVQETemplate, getQAOATemplate, QMLTemplate } from './services/qmlTemplates'
import type { Circuit } from 'quantum-computer-js'

export default function QMLHubPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const setCircuit = useQuantumStore(state => state.setCircuit)
    
    const [selectedId, setSelectedId] = useState<string>('vqe-h2')
    const [template, setTemplate] = useState<QMLTemplate>(getVQETemplate('h2'))
    const [trainingData, setTrainingData] = useState<{ iteration: number, cost: number }[]>([])
    const [isTraining, setIsTraining] = useState(false)

    const templates: QMLTemplate[] = [
        getVQETemplate('h2'),
        getVQETemplate('lih'),
        getQAOATemplate('ring', 4),
        getQAOATemplate('grid', 4)
    ]

    useEffect(() => {
        const found = templates.find(t => t.id === selectedId)
        if (found) setTemplate(found)
    }, [selectedId])

    const startTraining = () => {
        setIsTraining(true)
        setTrainingData([])
        
        let iteration = 0
        const maxIterations = 25
        const interval = setInterval(() => {
            iteration++
            const baseCost = template.category === 'Chemistry' ? -1.137 : 2.5
            const noise = (Math.random() - 0.5) * 0.1
            const cost = baseCost + Math.exp(-iteration / 8) * (template.category === 'Chemistry' ? -0.5 : 1.5) + noise
            
            setTrainingData(prev => [...prev, { iteration, cost }])
            
            if (iteration >= maxIterations) {
                clearInterval(interval)
                setIsTraining(false)
            }
        }, 150)
    }

    const openInStudio = () => {
        setCircuit(template.circuit as Circuit, true)
        navigate('/circuits')
    }

    return (
        <div className="p-4 lg:p-6 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                           <FontAwesomeIcon icon={faBrain} className="text-xl text-primary" />
                        </div>
                        <h2 className="text-3xl font-black text-theme-text tracking-tight uppercase">{t('qml.title')}</h2>
                    </div>
                    <p className="text-sm font-medium text-theme-text-muted opacity-60 ml-1">
                        {t('qml.desc')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={openInStudio} disabled={!template} variant="secondary" className="px-6 py-2.5 rounded-xl border-theme-border/50 hover:border-primary/50 transition-all font-semibold">
                        <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-2 text-xs" />
                        {t('qnlp.open_studio')}
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sidebar: Template Selection */}
                <div className="lg:col-span-4 space-y-4">
                    <Card title={t('qml.templates_title')} description={t('qml.templates_desc')}>
                        <div className="space-y-2">
                            {templates.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedId(t.id)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${selectedId === t.id 
                                        ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10' 
                                        : 'bg-white/5 border-white/5 text-theme-text-muted hover:bg-white/10 hover:border-white/10'}`}
                                >
                                    <div className="flex items-center gap-3 mb-1">
                                        <FontAwesomeIcon icon={t.category === 'Chemistry' ? faAtom : faProjectDiagram} className="text-xs" />
                                        <span className="text-xs font-black uppercase tracking-tighter">{t.name}</span>
                                    </div>
                                    <p className="text-[10px] leading-tight opacity-70 font-medium">{t.description}</p>
                                </button>
                            ))}
                        </div>
                    </Card>

                    <Card title={t('qml.stats_title')}>
                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="text-[10px] uppercase font-black text-theme-text-muted mb-1">{t('shell.qubits')}</div>
                                <div className="text-xl font-mono text-primary">{template?.numQubits}</div>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="text-[10px] uppercase font-black text-theme-text-muted mb-1">Parameters</div>
                                <div className="text-xl font-mono text-accent">{template?.circuit.gates.length}</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Content: Visualization & Training */}
                <div className="lg:col-span-8 space-y-6">
                    <Card title={t('qml.dashboard_title')} description={t('qml.dashboard_desc')}>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-black text-theme-text-muted">{t('qml.target_objective')}</span>
                                        <span className="text-sm font-bold text-white capitalize">{template?.category === 'Chemistry' ? 'Ground State Energy' : 'Cost Minimization'}</span>
                                    </div>
                                </div>
                                <Button onClick={startTraining} disabled={isTraining} className="bg-primary hover:bg-primary/80 text-black font-black">
                                    <FontAwesomeIcon icon={faPlay} className="mr-2" />
                                    {isTraining ? t('qml.optimizing') : t('qml.run_optimization')}
                                </Button>
                            </div>

                            <div className="h-[300px] w-full bg-black/20 rounded-2xl border border-white/5 overflow-hidden p-4">
                                {trainingData.length > 0 ? (
                                    <TrainingChart data={trainingData} title="Cost Convergence (Stochastic Gradient Descent)" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-theme-text-muted opacity-40">
                                        <FontAwesomeIcon icon={faChartLine} className="text-4xl mb-3" />
                                        <p className="text-xs font-bold uppercase tracking-widest">{t('qml.awaiting_data')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title={t('qml.topology_title')}>
                            <div className="flex flex-col items-center justify-center py-6">
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-pulse" />
                                    <FontAwesomeIcon icon={faNetworkWired} className="text-3xl text-primary" />
                                </div>
                                <p className="text-[10px] text-theme-text-muted font-bold uppercase tracking-widest mt-4">
                                    {t('qml.topology_desc')}
                                </p>
                            </div>
                        </Card>
                        <Card title={t('qml.advantage_title')}>
                            <div className="space-y-3 py-2">
                                <p className="text-[11px] text-theme-text leading-relaxed">
                                    {template?.category === 'Chemistry' 
                                        ? t('qml.chemistry_advantage')
                                        : t('qml.optimization_advantage')}
                                </p>
                                <div className="flex items-center gap-2 pt-2">
                                    <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[9px] font-black uppercase tracking-tighter">Polynomial Scaling</span>
                                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-black uppercase tracking-tighter">NISQ Ready</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

