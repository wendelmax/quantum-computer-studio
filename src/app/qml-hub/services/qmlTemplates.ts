import type { Circuit } from 'quantum-computer-js'

export interface QMLTemplate {
    id: string
    name: string
    description: string
    category: 'Chemistry' | 'Optimization'
    numQubits: number
    circuit: Circuit
}

/**
 * Generates a Hardware-Efficient Ansatz for VQE (chemistry)
 */
export function getVQETemplate(molecule: string): QMLTemplate {
    const templates: Record<string, QMLTemplate> = {
        'h2': {
            id: 'vqe-h2',
            name: 'Hydrogen Molecule (H₂)',
            description: 'Minimal basis STO-3G representation of H₂. 2 qubits represent the molecular orbitals.',
            category: 'Chemistry',
            numQubits: 2,
            circuit: {
                numQubits: 2,
                gates: [
                    { type: 'x', target: 0 }, // Hartree-Fock state |01>
                    { type: 'rx', target: 0, angle: 0.1 }, // Parametric ansatz layer
                    { type: 'ry', target: 1, angle: 0.2 },
                    { type: 'cnot', control: 0, target: 1 }
                ]
            }
        },
        'lih': {
            id: 'vqe-lih',
            name: 'Lithium Hydride (LiH)',
            description: 'Reduced active space simulation of LiH ground state.',
            category: 'Chemistry',
            numQubits: 4,
            circuit: {
                numQubits: 4,
                gates: [
                    { type: 'x', target: 0 },
                    { type: 'x', target: 1 },
                    { type: 'ry', target: 0, angle: 0.3 },
                    { type: 'ry', target: 1, angle: 0.3 },
                    { type: 'ry', target: 2, angle: 1.5 },
                    { type: 'ry', target: 3, angle: 1.5 },
                    { type: 'cnot', control: 0, target: 1 },
                    { type: 'cnot', control: 1, target: 2 },
                    { type: 'cnot', control: 2, target: 3 }
                ]
            }
        }
    }
    return templates[molecule.toLowerCase()] || templates['h2']
}

/**
 * Generates a QAOA circuit for Max-Cut
 */
export function getQAOATemplate(problem: string, nodes: number = 4): QMLTemplate {
    const gates: any[] = []
    
    // Initial state: superposition
    for (let i = 0; i < nodes; i++) gates.push({ type: 'h', target: i })

    // Problem Hamiltonian (Max-Cut on a simple ring)
    for (let i = 0; i < nodes; i++) {
        const next = (i + 1) % nodes
        gates.push({ type: 'cnot', control: i, target: next })
        gates.push({ type: 'rz', target: next, angle: 0.5 })
        gates.push({ type: 'cnot', control: i, target: next })
    }

    // Mixer Hamiltonian
    for (let i = 0; i < nodes; i++) {
        gates.push({ type: 'rx', target: i, angle: 0.3 })
    }

    return {
        id: `qaoa-${problem}`,
        name: `Max-Cut [${problem.toUpperCase()}]`,
        description: `Variational optimization for the Max-Cut problem on a ${problem} graph topology.`,
        category: 'Optimization',
        numQubits: nodes,
        circuit: { numQubits: nodes, gates }
    }
}
