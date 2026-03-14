import React, { useState, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVial, faSync, faZap, faInfoCircle, faCube, faFlask, faMicrochip } from '@fortawesome/free-solid-svg-icons'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../../components/Button'
import Card from '../../components/Card'
import VisualQubit from './components/VisualQubit'
import BlochSphere from '../circuits/components/BlochSphere'
import { useTranslation } from 'react-i18next'
import { useQuantumStore } from '../../store/quantumStore'

export default function VisualLabPage() {
    const { t } = useTranslation()
    const { circuit, executionResult } = useQuantumStore()
    
    // UI State
    const [sourceMode, setSourceMode] = useState<'sandbox' | 'integrated'>('sandbox')
    const [integratedQubit, setIntegratedQubit] = useState(0)

    // Sandbox Qubit State
    const [sandboxState, setSandboxState] = useState({ alpha: [1, 0] as [number, number], beta: [0, 0] as [number, number] })
    const [isSuperposition, setIsSuperposition] = useState(false)
    const [isCollapsing, setIsCollapsing] = useState(false)
    const [collapsedTo, setCollapsedTo] = useState<'0' | '1' | null>('0')
    const [isProcessing, setIsProcessing] = useState(false)

    // Sync integratedQubit when circuit changes
    React.useEffect(() => {
        if (circuit && integratedQubit >= circuit.numQubits) {
            setIntegratedQubit(0)
        }
    }, [circuit, integratedQubit])

    // --- Sandbox Actions ---
    const applyH = () => {
        setIsCollapsing(false); setCollapsedTo(null); setIsSuperposition(true)
        setSandboxState({ alpha: [1 / Math.sqrt(2), 0], beta: [1 / Math.sqrt(2), 0] })
    }

    const applyX = () => {
        setIsCollapsing(false); setIsSuperposition(false)
        if (collapsedTo === '1') {
            setCollapsedTo('0'); setSandboxState({ alpha: [1, 0], beta: [0, 0] })
        } else {
            setCollapsedTo('1'); setSandboxState({ alpha: [0, 0], beta: [1, 0] })
        }
    }

    const measure = () => {
        if (!isSuperposition) return
        setIsCollapsing(true)
        const result = Math.random() > 0.5 ? '0' : '1'
        setCollapsedTo(result)
        setTimeout(() => {
            setIsCollapsing(false); setIsSuperposition(false)
            if (result === '0') setSandboxState({ alpha: [1, 0], beta: [0, 0] })
            else setSandboxState({ alpha: [0, 0], beta: [1, 0] })
        }, 400)
    }

    const reset = () => {
        setIsCollapsing(false); setIsSuperposition(false); setCollapsedTo('0')
        setSandboxState({ alpha: [1, 0], beta: [0, 0] })
    }

    // --- Integrated Mode Logic ---
    const integratedState = useMemo(() => {
        if (!executionResult?.stateVector || !circuit) return { alpha: [1, 0], beta: [0, 0] }

        const numQubits = circuit.numQubits
        const stateVector = executionResult.stateVector
        const qubitIndex = integratedQubit

        let expX = 0; let expY = 0; let expZ = 0
        const nStates = 1 << numQubits

        for (let i = 0; i < nStates; i++) {
            const r1 = stateVector[i * 2]; const i1 = stateVector[i * 2 + 1]
            const bitMask = 1 << qubitIndex
            const isSet = (i & bitMask) !== 0
            const p = r1 * r1 + i1 * i1
            expZ += isSet ? -p : p

            if (!isSet) {
                const pairedIndex = i | bitMask
                const r2 = stateVector[pairedIndex * 2]; const i2 = stateVector[pairedIndex * 2 + 1]
                expX += 2 * (r1 * r2 + i1 * i2)
                expY += 2 * (r1 * i2 - i1 * r2)
            }
        }

        const z = Math.max(-1, Math.min(1, expZ))
        const theta = Math.acos(z)
        const phi = Math.atan2(expY, expX)

        const c = Math.cos(theta / 2); const s = Math.sin(theta / 2)
        return {
            alpha: [c, 0] as [number, number],
            beta: [s * Math.cos(phi), s * Math.sin(phi)] as [number, number]
        }
    }, [executionResult, integratedQubit, circuit])

    const activeAlpha = sourceMode === 'sandbox' ? sandboxState.alpha : integratedState.alpha
    const activeBeta = sourceMode === 'sandbox' ? sandboxState.beta : integratedState.beta
    
    const prob0 = activeAlpha[0]**2 + activeAlpha[1]**2
    const prob1 = activeBeta[0]**2 + activeBeta[1]**2

    const isIntegratedSuperposed = Math.abs(prob0 - 0.5) < 0.4 
    const integratedCollapsed = prob0 > 0.9 ? '0' : prob1 > 0.9 ? '1' : null

    return (
        <div className="h-full min-h-[calc(100vh-80px)] bg-bg/50 mesh-gradient flex flex-col p-4 lg:p-6 overflow-hidden animate-fade-in font-sans">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-black text-theme-text tracking-tighter flex items-center gap-2">
                        <span className="text-primary"><FontAwesomeIcon icon={faVial} /></span>
                        {t('nav.visual_lab', 'VISUAL LAB')}
                        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded uppercase tracking-widest ml-2 italic">Scientific Console</span>
                    </h1>
                </div>

                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                    <button
                        onClick={() => setSourceMode('sandbox')}
                        className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${sourceMode === 'sandbox' ? 'bg-primary text-black' : 'text-theme-text-muted hover:text-white'}`}
                    >
                        <FontAwesomeIcon icon={faFlask} />
                        SANDBOX
                    </button>
                    <button
                        onClick={() => setSourceMode('integrated')}
                        className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${sourceMode === 'integrated' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-theme-text-muted hover:text-white'}`}
                    >
                        <FontAwesomeIcon icon={faMicrochip} />
                        STUDIO LIVE
                    </button>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
                <div className="lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1 overflow-y-auto pb-4 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <Card title="TELEMETRY SCAN">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black tracking-widest text-theme-text-muted uppercase">
                                        <span>State |0⟩ Density</span>
                                        <span className="text-theme-text">{(prob0 * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-theme-surface/30 rounded-full overflow-hidden border border-theme-border/20">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${prob0 * 100}%` }}
                                            className="h-full bg-primary shadow-[0_0_15px_rgb(var(--primary)/0.6)]"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black tracking-widest text-theme-text-muted uppercase">
                                        <span>State |1⟩ Density</span>
                                        <span className="text-theme-text">{(prob1 * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-theme-surface/30 rounded-full overflow-hidden border border-theme-border/20">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${prob1 * 100}%` }}
                                            className="h-full bg-accent shadow-[0_0_15px_rgb(var(--accent)/0.6)]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-theme-surface/40 border border-theme-border/20 space-y-3 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-20">
                                    <FontAwesomeIcon icon={faInfoCircle} className="text-xs" />
                                </div>
                                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest block">Analysis Report</h4>
                                <p className="text-xs text-theme-text/80 leading-relaxed font-medium transition-colors group-hover:text-white">
                                    {sourceMode === 'integrated' 
                                        ? "Extracting single-qubit state vector from multi-qubit system. Trace logic applied for marginal representation."
                                        : (isSuperposition 
                                            ? "Quantum superposition detected. Wavefunction actively oscillating across basis states." 
                                            : "System in coherent basis state. Wavefunction localized in computational basis.")
                                    }
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-theme-surface border border-theme-border/20 text-center flex flex-col justify-center gap-1">
                                    <span className="text-[8px] uppercase font-black text-theme-text-muted">Real(α)</span>
                                    <span className="font-mono text-xs text-theme-text tracking-widest">{activeAlpha[0].toFixed(4)}</span>
                                </div>
                                <div className="p-3 rounded-xl bg-theme-surface border border-theme-border/20 text-center flex flex-col justify-center gap-1">
                                    <span className="text-[8px] uppercase font-black text-theme-text-muted">Real(β)</span>
                                    <span className="font-mono text-xs text-theme-text tracking-widest">{activeBeta[0].toFixed(4)}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="CONTROL INTERFACE">
                        <div className="space-y-4">
                             {sourceMode === 'sandbox' ? (
                                <>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={applyH} 
                                            className="py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black hover:bg-primary hover:text-black transition-all uppercase tracking-widest"
                                        >Gate: H</button>
                                        <button 
                                            onClick={applyX}
                                            className="py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black hover:bg-white hover:text-black transition-all uppercase tracking-widest"
                                        >Gate: X</button>
                                    </div>
                                    <Button
                                        onClick={measure}
                                        disabled={!isSuperposition || isCollapsing}
                                        className={`w-full py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all ${isSuperposition ? 'bg-accent text-white shadow-lg shadow-accent/20 animate-pulse' : 'opacity-20 grayscale'}`}
                                    >
                                        <FontAwesomeIcon icon={faZap} className="mr-2" />
                                        Initialize Collapse
                                    </Button>
                                    <button 
                                        onClick={reset}
                                        className="w-full text-[9px] font-black text-theme-text-muted hover:text-red-400 transition-colors py-2 uppercase tracking-widest"
                                    >
                                        Hard Reset System
                                    </button>
                                </>
                             ) : (
                                <div className="p-6 rounded-2xl bg-accent/5 border border-accent/20 flex flex-col items-center justify-center gap-4 text-center">
                                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent animate-pulse">
                                        <FontAwesomeIcon icon={faMicrochip} className="text-xl" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-accent uppercase tracking-widest">Locked State</p>
                                        <p className="text-[9px] text-theme-text-muted font-medium uppercase leading-tight">Sync Active with Studio</p>
                                    </div>
                                </div>
                             )}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-9 flex flex-col gap-6 order-1 lg:order-2 overflow-hidden">
                    <div className="flex-1 bg-theme-surface/30 rounded-[2.5rem] border border-theme-border/50 relative overflow-hidden flex flex-col xl:flex-row items-stretch shadow-2xl">
                        <div className="flex-1 flex flex-col items-center justify-center p-12 relative border-r border-white/5 bg-gradient-to-tr from-white/[0.02] to-transparent">
                            <div className="absolute top-8 left-8 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                <span className="text-[9px] font-black text-theme-text-muted tracking-[0.3em] uppercase opacity-70">Probability Cloud Map</span>
                            </div>
                            <VisualQubit
                                state={{ alpha: activeAlpha as [number, number], beta: activeBeta as [number, number] }}
                                isSuperposition={sourceMode === 'sandbox' ? isSuperposition : isIntegratedSuperposed}
                                isCollapsing={sourceMode === 'sandbox' ? isCollapsing : false}
                                collapsedTo={sourceMode === 'sandbox' ? collapsedTo : integratedCollapsed}
                            />
                        </div>

                        <div className="flex-1 relative bg-gradient-to-br from-transparent to-primary/5 cursor-crosshair">
                            <div className="absolute top-8 right-8 flex items-center gap-3 z-10 pointer-events-none">
                                <span className="text-[9px] font-black text-theme-text-muted tracking-[0.3em] uppercase opacity-70">3D Bloch Manifold</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                            </div>
                            <div className="w-full h-full">
                                <BlochSphere
                                    alpha={activeAlpha as [number, number]}
                                    beta={activeBeta as [number, number]}
                                />
                            </div>

                            <AnimatePresence>
                                {sourceMode === 'integrated' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className="absolute bottom-10 left-10 right-10 z-20 bg-theme-surface/95 backdrop-blur-2xl border border-theme-border/50 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-6"
                                    >
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="text-[9px] text-accent font-black uppercase tracking-widest">Target Core Selection</div>
                                                <div className="flex-1 h-px bg-accent/20" />
                                            </div>
                                            <select
                                                value={integratedQubit}
                                                onChange={(e) => setIntegratedQubit(Number(e.target.value))}
                                                className="w-full bg-theme-surface/30 border border-theme-border/50 text-theme-text text-sm rounded-xl px-4 py-2.5 outline-none font-bold transition-all focus:border-accent hover:bg-theme-surface/50 cursor-pointer text-center tracking-widest"
                                            >
                                                {Array.from({ length: circuit?.numQubits || 1 }).map((_, i) => (
                                                    <option key={i} value={i} className="bg-bg text-theme-text">QUBIT #{i}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-px h-12 bg-white/10" />
                                        <div className="flex-none text-right flex flex-col justify-center">
                                            <div className="text-[9px] text-theme-text-muted font-black uppercase tracking-widest mb-1">State Sync</div>
                                            <div className="flex items-center gap-2 justify-end">
                                               <span className="text-[10px] font-mono text-theme-text-muted">{executionResult ? 'CONNECTED' : 'STANDBY'}</span>
                                               <div className={`w-1.5 h-1.5 rounded-full ${executionResult ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500'}`} />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 0)', backgroundSize: '30px 30px' }} />
                    </div>

                    <div className="flex items-center justify-between px-8 py-5 bg-theme-surface/20 rounded-3xl border border-theme-border/30 backdrop-blur-sm">
                        <div className="flex items-center gap-8">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.4em]">Engine Stability</span>
                                <div className="flex gap-1.5">
                                    {[...Array(12)].map((_, i) => (
                                        <motion.div 
                                            key={i} 
                                            animate={{ 
                                                opacity: [0.3, 1, 0.3],
                                                scaleY: [1, 1.5, 1]
                                            }}
                                            transition={{ 
                                                duration: 2, 
                                                repeat: Infinity, 
                                                delay: i * 0.15 
                                            }}
                                            className={`h-1.5 w-1 rounded-full ${i < 9 ? 'bg-primary' : 'bg-white/10'}`} 
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="h-8 w-px bg-white/10" />
                            <div className="hidden md:flex flex-col gap-1">
                                <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.4em]">Subsystem</span>
                                <span className="text-[10px] font-mono text-primary/80 tracking-tight font-bold">CRYOGENIC_PULSE_CORE_MOD_L4</span>
                            </div>
                        </div>
                        <div className="text-[9px] font-mono text-theme-text-muted italic opacity-40 max-w-[300px] text-right leading-tight">
                            "Everything we call real is made of things that cannot be regarded as real." — N. Bohr
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
