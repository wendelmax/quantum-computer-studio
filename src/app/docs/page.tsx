import React, { useState } from 'react'
import SidebarDocs from './components/SidebarDocs'
import MarkdownViewer from './components/MarkdownViewer'

type DocContent = {
  [key: string]: string
}

const docContents: DocContent = {
  'Getting Started': `# Getting Started with Quantum Computer JS

## Welcome

Quantum Computer JS is a quantum computing simulator and visualizer built with React and TypeScript.

## Features

- **Quantum Studio**: Build and visualize quantum circuits interactively
- **Algorithms Library**: Run and compare quantum algorithms
- **State Visualization**: View probability distributions and state vectors
- **Gates Library**: Reference for all available quantum gates
- **Data Lab**: Map classical data to quantum states
- **Oracles**: Test and understand quantum oracles

## Quick Start

1. Navigate to **Quantum Studio** to start building circuits
2. Select gates from the panel and place them on the canvas
3. Click **Run** to simulate the circuit
4. View results in the state viewer

## Building Your First Circuit

1. Go to **Circuits** page
2. Select a gate from the Gate Panel
3. Click on the circuit canvas to place it
4. Adjust parameters for rotation gates
5. Click Run to see results

## Understanding Results

- **Probabilities**: Shows the likelihood of measuring each basis state
- **State Vector**: Shows the complex amplitudes of each state
- **Histogram**: Visual representation of measurement probabilities`,
  
  'Mathematical Foundations': `# Mathematical Foundations of Quantum Computing

## Quantum States

### Qubit States

A qubit can be in a superposition of classical states:

\`\`\`
|Ψ⟩ = α|0⟩ + β|1⟩
\`\`\`

Where α and β are complex amplitudes satisfying:

\`\`\`
|α|² + |β|² = 1
\`\`\`

### Basis States

Standard computational basis:

\`\`\`
|0⟩ = (1, 0)ᵀ
|1⟩ = (0, 1)ᵀ
\`\`\`

### Dirac Notation

\`\`\`
⟨ψ|φ⟩ = inner product (bra-ket notation)
|ψ⟩ = ket vector (column)
⟨ψ| = bra vector (row)
\`\`\`

## Superposition

A qubit in superposition exists in all possible states simultaneously:

\`\`\`
|Ψ⟩ = α|0⟩ + β|1⟩ = (α, β)ᵀ
\`\`\`

**Example**: After Hadamard gate:

\`\`\`
H|0⟩ = (|0⟩ + |1⟩)/√2
H|1⟩ = (|0⟩ - |1⟩)/√2
\`\`\`

## Entanglement

Two qubits are entangled when they cannot be described independently:

\`\`\`
|Φ⁺⟩ = (|00⟩ + |11⟩)/√2  # Bell state
|Ψ⁻⟩ = (|01⟩ - |10⟩)/√2  # Bell state
\`\`\`

## Measurement

The Born Rule determines measurement probabilities:

\`\`\`
P(i) = |⟨i|Ψ⟩|²
\`\`\`

After measurement, the state collapses to the observed basis state.

## Quantum Gates

### Single-Qubit Gates

**Pauli-X (NOT)**:
\`\`\`
X = [0  1]
    [1  0]
\`\`\`

**Pauli-Y**:
\`\`\`
Y = [0  -i]
    [i   0]
\`\`\`

**Pauli-Z**:
\`\`\`
Z = [1   0]
    [0  -1]
\`\`\`

**Hadamard**:
\`\`\`
H = (1/√2) [1   1]
           [1  -1]
\`\`\`

### Two-Qubit Gates

**CNOT (Controlled-NOT)**:
\`\`\`
CNOT = [1  0  0  0]
       [0  1  0  0]
       [0  0  0  1]
       [0  0  1  0]
\`\`\`

### Rotation Gates

**X-axis rotation**:
\`\`\`
RX(θ) = [cos(θ/2)      -i·sin(θ/2)]
        [-i·sin(θ/2)   cos(θ/2)]
\`\`\`

**Y-axis rotation**:
\`\`\`
RY(θ) = [cos(θ/2)   -sin(θ/2)]
        [sin(θ/2)    cos(θ/2)]
\`\`\`

**Z-axis rotation**:
\`\`\`
RZ(θ) = [e^(-iθ/2)      0    ]
        [0          e^(iθ/2)]
\`\`\`

## Bloch Sphere

Any qubit state can be visualized on the Bloch sphere:

\`\`\`
|Ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)·sin(θ/2)|1⟩
\`\`\`

Where:
- θ ∈ [0, π] is the polar angle
- φ ∈ [0, 2π] is the azimuthal angle

Coordinates:
\`\`\`
x = sin(θ)·cos(φ)
y = sin(θ)·sin(φ)
z = cos(θ)
\`\`\`

## Quantum Interference

Amplitudes can interfere constructively or destructively:

\`\`\`
H|0⟩ = (|0⟩ + |1⟩)/√2  # Equal probability
H(H|0⟩) = |0⟩           # Destructive interference on |1⟩
\`\`\`

## Multi-Qubit Systems

For n qubits, the state space has dimension 2ⁿ:

\`\`\`
|Ψ⟩ = Σ αᵢ|i⟩,  i ∈ {0,1}ⁿ
\`\`\`

Each basis state |i⟩ is a binary string.

## Complexity Comparison

### Classical vs Quantum

**Storage**:
- Classical: 1 bit = 0 or 1 (1 state)
- Quantum: 1 qubit = α|0⟩ + β|1⟩ (2ⁿ simultaneous states for n qubits)

**Growth**:
- 10 qubits: 2¹⁰ = 1,024 states
- 20 qubits: 2²⁰ = 1,048,576 states
- 30 qubits: 2³⁰ = 1,073,741,824 states

**Exponential Advantage**:
- Classical: O(N) operations for N items
- Quantum: O(√N) operations for N items (Grover)

## References

- Nielsen & Chuang: "Quantum Computation and Quantum Information"
- Qiskit Textbook: https://qiskit.org/textbook
- Quantum Computing for Computer Scientists
  `,
  
  'Quantum Concepts': `# Quantum Mechanics Concepts

## Superposition Explained

A classical bit is either 0 or 1. A qubit can be in both states simultaneously:

\`\`\`
Before measurement: |Ψ⟩ = (1/√2)|0⟩ + (1/√2)|1⟩
After measurement: Either |0⟩ OR |1⟩ (randomly chosen)
\`\`\`

The probability of measuring |0⟩ is |1/√2|² = 0.5 (50%).

**Try it**: In Quantum Studio, create a circuit with a single Hadamard gate on qubit 0.

## Entanglement Explained

Two qubits are entangled when measuring one instantaneously affects the other, regardless of distance.

**Bell State Preparation**:
\`\`\`
H|0⟩₀ = (|0⟩ + |1⟩)/√2
CNOT(|0⟩ + |1⟩)/√2 ⊗ |0⟩₁ = (|00⟩ + |11⟩)/√2
\`\`\`

Now measuring qubit 0 as |0⟩ guarantees qubit 1 is |0⟩, and vice versa.

**Try it**: Create a circuit with H on qubit 0, then CNOT from qubit 0 to qubit 1.

## Measurement Process

Measurement collapses the quantum state:

1. **Before**: |Ψ⟩ = α|0⟩ + β|1⟩
2. **During**: Random selection based on probabilities
3. **After**: State collapses to measured basis

Probabilities follow the Born Rule: P(i) = |⟨i|Ψ⟩|²

**Example**:
- State: |Ψ⟩ = 0.6|0⟩ + 0.8|1⟩
- Check: |0.6|² + |0.8|² = 0.36 + 0.64 = 1.0 ✓
- Probabilities: 36% for |0⟩, 64% for |1⟩

## Quantum Interference

Amplitudes can add or subtract, creating interference patterns:

**Constructive**: Amplitudes reinforce each other
\`\`\`
H|0⟩ = (|0⟩ + |1⟩)/√2 → Both paths add up
\`\`\`

**Destructive**: Amplitudes cancel out
\`\`\`
H(H|0⟩) = |0⟩ → The |1⟩ amplitude cancels completely
\`\`\`

**Try it**: Apply H twice to a qubit and observe it returns to |0⟩.

## Bloch Sphere Visualization

Every qubit state maps to a point on the Bloch sphere:

- **North Pole**: |0⟩ (ground state)
- **South Pole**: |1⟩ (excited state)
- **Equator**: Superpositions with equal probability

**Formula**:
\`\`\`
|Ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)·sin(θ/2)|1⟩
\`\`\`

Use State Viewer to see the Bloch sphere representation.

## Quantum vs Classical

### Storage Efficiency

**Classical**:
- 3 bits: Stores ONE of 2³ = 8 possible values
- 50 bits: ~1 petabyte classical data

**Quantum**:
- 3 qubits: Represents ALL 8 states simultaneously
- 50 qubits: ~1 petabyte quantum superposition

### Exponential Advantage

**Problem**: Search in database of N items

**Classical**: O(N) checks needed
- 1,000 items: ~1,000 checks

**Quantum** (Grover): O(√N) operations
- 1,000 items: ~32 operations
- 1,000,000 items: ~1,000 operations

## Decoherence (Limitation)

Quantum states are fragile and susceptible to noise:

**Effects**:
- Environmental interference causes state decay
- Superposition collapses randomly
- Entanglement breaks down

**Real-world challenge**: Quantum computers need:
- Ultra-cold temperatures (near absolute zero)
- Isolation from electromagnetic fields
- Error correction schemes

Our simulator is idealized (no decoherence) for educational purposes.

## No-Cloning Theorem

You **cannot** copy an unknown quantum state:

\`\`\`
|Ψ⟩ ⊗ |0⟩ → |Ψ⟩ ⊗ |Ψ⟩ ❌ IMPOSSIBLE
\`\`\`

This has implications for:
- Quantum cryptography security
- Error correction strategies
- Quantum teleportation protocol

## Multiple Qubits

For n qubits, you have 2ⁿ computational basis states:

**2 qubits**: |00⟩, |01⟩, |10⟩, |11⟩
**3 qubits**: |000⟩, |001⟩, ..., |111⟩ (8 states)
**n qubits**: 2ⁿ states

Each superposition uses all basis states simultaneously!

**Try it**: Build a circuit with 3 qubits, each with Hadamard, then measure.
  `,
  
  'QASM': `# Quantum Assembly Language (QASM)

## Introduction

QASM is a low-level language for describing quantum circuits. While this simulator doesn't support full QASM yet, here are the equivalent gate operations:

## Basic Syntax

\`\`\`
# Single qubit gates
H q[0];      # Hadamard
X q[0];      # Pauli-X
Y q[0];      # Pauli-Y
Z q[0];      # Pauli-Z

# Rotation gates
RX(pi/2) q[0];    # Rotation X-axis
RY(pi/4) q[1];    # Rotation Y-axis
RZ(pi) q[2];      # Rotation Z-axis

# Two-qubit gates
CNOT q[0], q[1];  # Controlled NOT
\`\`\`

## Circuit Building

In this simulator, you build circuits visually:
1. Gates are placed on a grid
2. Each row represents a qubit
3. Columns represent time steps
4. CNOT gates show control-target connections

## Examples

### Bell State
\`\`\`
H q[0]
CNOT q[0], q[1]
\`\`\`

### Superposition
\`\`\`
H q[0]
\`\`\`

### Grover's Algorithm (2 qubits)
\`\`\`
H q[0]
H q[1]
CNOT q[0], q[1]
H q[0]
H q[1]
\`\`\``,

  'API': `# Quantum Computer JS API

## Interactive API Terminal

**NEW**: Try the interactive API terminal at [/api](/api)

The API terminal provides a REPL environment where you can programmatically work with quantum circuits using our core engine.

### Features

- **Interactive Console**: Write and execute code in real-time
- **Examples**: Pre-loaded circuit examples
- **Live Feedback**: See results instantly
- **Full API Access**: All core functions available

### Quick Start

1. Navigate to **API** page
2. Try an example from the sidebar
3. Modify the circuit code
4. Click **Execute**
5. View results

### What You Can Do

- Create quantum circuits
- Run simulations
- Access all gate operations
- Build custom algorithms
- Experiment with angles and parameters

> **Note**: For complete API documentation, visit the [/api](/api) page with the interactive terminal.`,

  'Algorithms': `# Quantum Algorithms

## Grover's Algorithm

**Purpose**: Search in unstructured database

**Complexity**: O(√N) for N items

**Steps**:
1. Initialize superpositions
2. Apply oracle (mark solution)
3. Apply diffusion operator
4. Repeat √N times

**Example**:
\`\`\`
H q[0]
H q[1]
CNOT q[0], q[1]  # Oracle
H q[0]
H q[1]           # Diffusion
\`\`\`

## Deutsch–Jozsa Algorithm

**Purpose**: Determine if function is constant or balanced

**Steps**:
1. Initialize target in |1⟩, apply H
2. Apply H to control
3. Apply oracle
4. Apply H to control
5. Measure control

**Result**: |0⟩ means constant, |1⟩ means balanced

## Quantum Fourier Transform (QFT)

**Purpose**: Frequency analysis

**Steps**:
1. Apply H to first qubit
2. Apply controlled rotations
3. Apply H to second qubit
4. Continue for all qubits

## Shor's Algorithm

**Purpose**: Factor integers

**Steps**:
1. Random co-prime selection
2. Period finding with QFT
3. Classical post-processing

## Quantum Phase Estimation

**Purpose**: Estimate eigenvalue of unitary

**Steps**:
1. Prepare superposition
2. Apply controlled powers of U
3. Apply inverse QFT
4. Measure to get phase`,
  
  'Best Practices': `# Best Practices

## Circuit Design

1. **Start Simple**: Begin with 1-2 qubits
2. **Use Named Gates**: Clearly label your operations
3. **Verify Incrementally**: Check results after each gate
4. **Optimize Depth**: Minimize circuit depth for efficiency

## Simulation

1. **Use Workers**: Offload heavy computation
2. **Cache Results**: Store computed states
3. **Limit Qubits**: Exponential complexity growth
4. **Batch Operations**: Group multiple runs

## Performance

- **< 10 qubits**: Real-time simulation
- **10-15 qubits**: Slower but feasible
- **> 15 qubits**: Consider approximate methods

## Common Patterns

### Bell State
\`\`\`
H → CNOT
\`\`\`

### GHZ State
\`\`\`
H → CNOT → CNOT
\`\`\`

### Quantum Teleportation
\`\`\`
Bell state prep → Measurement → Correction
\`\`\``,
  
  'Project Information': `# Project Information

## Repository

**GitHub**: [github.com/wendelmax/quantum-computer-js](https://github.com/wendelmax/quantum-computer-js)

## Author

**wendelmax**

## Version

**2.0.0**

## License

**MIT License**

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Links

- **Live Demo**: [quantum-computer-js.vercel.app](https://quantum-computer-ogt2c3gcg-wendelmaxs-projects.vercel.app)
- **Repository**: [GitHub](https://github.com/wendelmax/quantum-computer-js)
- **Issues**: [Report Issues](https://github.com/wendelmax/quantum-computer-js/issues)

## Technologies

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Web Workers`,
  
  'Troubleshooting': `# Troubleshooting

## Common Issues

### Circuit Not Running

**Problem**: Clicking Run does nothing

**Solutions**:
- Check that gates are placed correctly
- Verify qubit indices are valid
- Look for console errors
- Try refreshing the page

### Incorrect Results

**Problem**: Simulation gives unexpected probabilities

**Solutions**:
- Verify gate placement
- Check rotation angles
- Ensure proper initialization
- Review circuit logic

### Performance Issues

**Problem**: Slow simulation

**Solutions**:
- Reduce number of qubits
- Simplify circuit depth
- Clear browser cache
- Check worker availability

## Debug Tips

1. **Check State Vectors**: View amplitudes
2. **Verify Probabilities**: Sum should be 1.0
3. **Test Components**: Run gates individually
4. **Use Visualization**: Check Bloch sphere

## Getting Help

- Check console for errors
- Review circuit diagram
- Verify gate parameters
- Test with simple circuits
- Consult documentation`
}

export default function DocsPage() {
  const [selected, setSelected] = useState('Getting Started')
  
  const docItems = [
    'Getting Started',
    'Mathematical Foundations',
    'Quantum Concepts',
    'Algorithms',
    'QASM',
    'API',
    'Best Practices',
    'Troubleshooting',
    'Project Information'
  ]
  
  const content = docContents[selected] || '# Documentation\n\nSelect a topic from the sidebar.'

  return (
    <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-3">
        <SidebarDocs items={docItems} onSelect={setSelected} selected={selected} />
      </div>
      <div className="lg:col-span-9">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-theme-text">{selected}</h2>
          {selected === 'API' && (
            <div className="mt-2 p-3 bg-primary/10 border border-primary/50 rounded">
              <div className="text-sm text-theme-text">
                <strong>Interactive API Available</strong>: Try the interactive terminal at{' '}
                <a href="/api" className="underline hover:text-primary text-primary">/api</a>
              </div>
            </div>
          )}
        </div>
        <MarkdownViewer key={selected} content={content} />
      </div>
    </div>
  )
}
