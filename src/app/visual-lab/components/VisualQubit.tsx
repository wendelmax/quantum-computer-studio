import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface VisualQubitProps {
    state: { alpha: [number, number]; beta: [number, number] } // [real, imag]
    isSuperposition: boolean
    isCollapsing: boolean
    collapsedTo?: '0' | '1' | null
}

export default function VisualQubit({ state, isSuperposition, isCollapsing, collapsedTo }: VisualQubitProps) {
    // Calculate polar coordinates for the Bloch vector (simplified for 2D)
    // |psi> = cos(theta/2)|0> + e^(i*phi)sin(theta/2)|1>
    const alphaMag = Math.sqrt(state.alpha[0] ** 2 + state.alpha[1] ** 2)
    const betaMag = Math.sqrt(state.beta[0] ** 2 + state.beta[1] ** 2)

    // Normalized Y position for the "dot": 0 is |0> (top), 1 is |1> (bottom)
    const yPos = alphaMag ** 2 // Probability of 0

    return (
        <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Bloch Sphere Background */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                    <radialGradient id="sphereGradient" cx="50%" cy="50%" r="50%" fx="25%" fy="25%">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="var(--color-bg)" stopOpacity="0.1" />
                    </radialGradient>

                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Outer Circle */}
                <circle cx="50" cy="50" r="45" fill="url(#sphereGradient)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

                {/* Axes */}
                <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2 2" />
                <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2 2" />

                {/* Pole Labels */}
                <text x="50" y="4" textAnchor="middle" fontSize="4" fill="rgba(255,255,255,0.4)" className="font-mono">|0⟩</text>
                <text x="50" y="99" textAnchor="middle" fontSize="4" fill="rgba(255,255,255,0.4)" className="font-mono">|1⟩</text>

                {/* Superposition Cloud */}
                <AnimatePresence>
                    {isSuperposition && !isCollapsing && (
                        <motion.g
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.2 }}
                        >
                            <motion.circle
                                cx={50}
                                cy={50}
                                r={30}
                                fill="url(#sphereGradient)"
                                filter="url(#glow)"
                                animate={{
                                    r: [30, 35, 30],
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                            {/* Particle effects */}
                            {[...Array(6)].map((_, i) => (
                                <motion.circle
                                    key={i}
                                    cx={50}
                                    cy={50}
                                    r="1"
                                    fill="var(--color-primary)"
                                    animate={{
                                        x: Math.cos((i * 60 * Math.PI) / 180) * 35,
                                        y: Math.sin((i * 60 * Math.PI) / 180) * 35,
                                        opacity: [0, 1, 0],
                                        scale: [0, 1.5, 0]
                                    }}
                                    transition={{
                                        duration: 2 + Math.random(),
                                        repeat: Infinity,
                                        delay: i * 0.4
                                    }}
                                />
                            ))}
                        </motion.g>
                    )}
                </AnimatePresence>

                {/* Qubit State Indicator (The Dot) */}
                {!isSuperposition && !isCollapsing && (
                    <motion.circle
                        layoutId="qubit-dot"
                        cx={50}
                        cy={collapsedTo === '1' ? 90 : 10}
                        r={4}
                        fill="var(--color-primary)"
                        filter="url(#glow)"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    />
                )}

                {/* Collapse Animation */}
                <AnimatePresence>
                    {isCollapsing && (
                        <motion.circle
                            cx={50}
                            cy={50}
                            r={30}
                            initial={{ r: 30, opacity: 0.8 }}
                            animate={{
                                r: 0,
                                opacity: 0,
                                cy: collapsedTo === '1' ? 90 : 10,
                            }}
                            transition={{ duration: 0.4, ease: "circIn" }}
                            className="fill-primary"
                        />
                    )}
                </AnimatePresence>
            </svg>

            {/* Decorative label */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-widest text-primary/40 uppercase">
                {isSuperposition ? 'Superposition' : 'Basis State'}
            </div>
        </div>
    )
}
