import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Sphere, Line, Extrude, Cylinder } from '@react-three/drei'
import * as THREE from 'three'

interface BlochSphereProps {
    stateVector?: number[]
    qubitIndex?: number
    numQubits?: number
    alpha?: [number, number] // [real, imag]
    beta?: [number, number]  // [real, imag]
}

// Draw the 3D axes (X, Y, Z)
function Axes() {
    return (
        <group>
            {/* X-Axis (Red) */}
            <Line points={[[0, 0, 0], [1.2, 0, 0]]} color="#ef4444" lineWidth={2} />
            <Text position={[1.3, 0, 0]} fontSize={0.1} color="#ef4444">|+⟩</Text>
            <Text position={[-1.3, 0, 0]} fontSize={0.1} color="#ef4444">|-⟩</Text>

            {/* Y-Axis (Green) */}
            <Line points={[[0, 0, 0], [0, 0, 1.2]]} color="#22c55e" lineWidth={2} />
            <Text position={[0, 0, 1.3]} fontSize={0.1} color="#22c55e">|i⟩</Text>
            <Text position={[0, 0, -1.3]} fontSize={0.1} color="#22c55e">|-i⟩</Text>

            {/* Z-Axis (Blue) */}
            <Line points={[[0, -1.2, 0], [0, 1.2, 0]]} color="#3b82f6" lineWidth={2} />
            <Text position={[0, 1.3, 0]} fontSize={0.1} color="#3b82f6">|0⟩</Text>
            <Text position={[0, -1.3, 0]} fontSize={0.1} color="#3b82f6">|1⟩</Text>
        </group>
    )
}

// Draw the quantum state vector as an arrow from origin
function StateVectorArrow({ x, y, z }: { x: number, y: number, z: number }) {
    const endPoint = new THREE.Vector3(x, z, y) // Z is up in ThreeJS default if we rotate, but let's map Z=up (Y axis in ThreeJS)
    const startPoint = new THREE.Vector3(0, 0, 0)
    
    // Calculates the quaternion rotation to point the cylinder from origin to (x,y,z)
    const quaternion = new THREE.Quaternion()
    // Default cylinder points UP (Y-axis). 
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), endPoint.clone().normalize())

    return (
        <group>
            <Line points={[[0, 0, 0], [x, z, y]]} color="#eab308" lineWidth={4} />
            <mesh position={[x, z, y]} quaternion={quaternion}>
                <coneGeometry args={[0.05, 0.15, 16]} />
                <meshStandardMaterial color="#eab308" />
            </mesh>
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshStandardMaterial color="#eab308" />
            </mesh>
        </group>
    )
}

export default function BlochSphere({ stateVector, qubitIndex = 0, numQubits = 1, alpha, beta }: BlochSphereProps) {
    // Math to extract Cartesian Coordinates from the State Vector for a single Qubit
    // |ψ⟩ = α|0⟩ + β|1⟩
    const coords = useMemo(() => {
        // Mode 1: Direct Amplitudes (from Visual Lab)
        if (alpha && beta) {
            const r1 = alpha[0]; const i1 = alpha[1]
            const r2 = beta[0]; const i2 = beta[1]
            
            const p0 = r1 * r1 + i1 * i1
            const p1 = r2 * r2 + i2 * i2

            // z = |alpha|^2 - |beta|^2
            const z = p0 - p1
            // x = 2 * Re(alpha* beta)
            const x = 2 * (r1 * r2 + i1 * i2)
            // y = 2 * Im(alpha* beta)
            const y = 2 * (r1 * i2 - i1 * r2)

            return { x, y, z, r: Math.sqrt(x*x + y*y + z*z) }
        }

        // Mode 2: Full State Vector (from Circuits)
        if (!stateVector || stateVector.length === 0) return { x: 0, y: 0, z: 1, r: 1 } // default |0>
        
        let expX = 0
        let expY = 0
        let expZ = 0

        const nStates = 1 << numQubits
        for (let i = 0; i < nStates; i++) {
            const r1 = stateVector[i * 2]
            const i1 = stateVector[i * 2 + 1]
            
            const bitMask = 1 << qubitIndex
            const isSet = (i & bitMask) !== 0
            
            const p = r1 * r1 + i1 * i1
            expZ += isSet ? -p : p

            if (!isSet) {
                const pairedIndex = i | bitMask
                const r2 = stateVector[pairedIndex * 2]
                const i2 = stateVector[pairedIndex * 2 + 1]
                
                const realTerm = r1 * r2 + i1 * i2
                const imagTerm = r1 * i2 - i1 * r2

                expX += 2 * realTerm
                expY += 2 * imagTerm
            }
        }

        return { x: expX, y: expY, z: expZ, r: Math.sqrt(expX*expX + expY*expY + expZ*expZ) }

    }, [stateVector, qubitIndex, numQubits, alpha, beta])

    // Normalize coordinates
    const r = coords.r || 1
    const x = coords.x / r
    const y = coords.y / r
    const z = coords.z / r

    return (
        <div className="w-full h-full min-h-[300px] bg-theme-surface/30 rounded-xl border border-theme-border/50 relative overflow-hidden flex flex-col items-center justify-center cursor-move transition-colors duration-300">
            
            <Canvas 
                camera={{ position: [2, 1.5, 2], fov: 50 }}
                gl={{ antialias: true, powerPreference: "high-performance" }}
                dpr={[1, 2]}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
                
                <OrbitControls 
                    enableZoom={true} 
                    enablePan={false} 
                    autoRotate={true} 
                    autoRotateSpeed={0.5} 
                    minDistance={2}
                    maxDistance={6}
                />
                
                {/* The Wireframe Sphere */}
                <Sphere args={[1, 32, 32]}>
                    <meshStandardMaterial color="#3b82f6" transparent opacity={0.1} wireframe={true} />
                </Sphere>
                
                {/* Equator (XY Plane) */}
                <Line
                    points={Array.from({ length: 65 }).map((_, i) => [
                        Math.cos((i / 64) * Math.PI * 2),
                        0,
                        Math.sin((i / 64) * Math.PI * 2)
                    ])}
                    color="#4b5563"
                    lineWidth={1}
                />

                <Axes />
                <StateVectorArrow x={x} y={y} z={z} />
            </Canvas>

            <div className="absolute bottom-3 right-3 text-[10px] font-mono text-theme-text-muted bg-theme-surface/80 px-2 py-1 rounded backdrop-blur">
                x: {x.toFixed(2)} | y: {y.toFixed(2)} | z: {z.toFixed(2)}
            </div>
            {/* Warning if state is highly mixed (r < 0.95) */}
            {r < 0.95 && (
                <div className="absolute top-3 left-3 text-[10px] font-semibold text-accent bg-accent/10 px-2 py-1 rounded border border-accent/20">
                    Mixed State (Entangled)
                </div>
            )}
        </div>
    )
}
