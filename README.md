# Quantum Computer JS

An interactive quantum simulator and quantum circuit visualizer built with React, TypeScript, and Vite.

## Live Demo

**[Access the online version](https://quantum-computer-js.vercel.app)**

The project is hosted on Vercel and available for immediate use.

## Features

- **Quantum Studio**: Build and visualize quantum circuits interactively
- **Algorithms**: Run and compare 9 quantum algorithms with complexity analysis
- **State Viewer**: Visualize states with histograms, phase diagrams, and complete analysis
- **Gates Library**: Complete reference of all quantum gates
- **Data Lab**: Map classical data to quantum states with sample datasets
- **Oracles**: Test 9 oracles with truth tables and circuit visualization
- **API Terminal**: Interactive REPL for programming quantum circuits
- **Execution Monitor**: Monitor performance and execution history
- **Gallery**: Save and manage circuits
- **QASM Playground**: QASM editor with syntax highlighting
- **Theme Switcher**: 4 themes (Dark, Light, Matrix, Ocean)

### Educational Features

- **Mathematical Foundations**: Complete formulas, matrices, and quantum theory
- **Quantum Concepts Tutorial**: Learn superposition, entanglement, interference
- **Enhanced State Analysis**: Entropy, entanglement measures, and state classification
- **Classical vs Quantum Comparison**: Visual explanations of quantum advantages

## Installation and Development

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Production Build

```bash
npm run build
npm run preview
```

### Deploy to Vercel

The project is configured for automatic deployment on Vercel:

```bash
# Login (first time)
vercel login

# Production deploy
vercel --prod --yes
```

Project configuration is in `vercel.json`.

## Usage

### Building a Circuit

1. Navigate to **Quantum Studio**
2. Select a gate from the side panel
3. Click on the canvas to place the gate
4. Adjust parameters for rotation gates
5. Click **Run** to see results

### Running Algorithms

1. Go to **Algorithms**
2. Click on an algorithm to load it
3. View probabilities and states
4. Use **Open in Studio** to modify

### Available Gates

- **Single Qubit**: H, X, Y, Z
- **Rotation**: RX, RY, RZ
- **Two-Qubit**: CNOT

### Storage

Circuits are automatically saved to localStorage:
- `quantum:circuit` - Current circuit
- `quantum:prefs:numQubits` - Qubit preferences
- `quantum:loadCircuit` - Circuit to load

## Project Structure

```
quamtumPc/
├── src/
│   ├── app/                    # Main pages and components
│   │   ├── circuits/          # Quantum Studio (builder + export/import)
│   │   ├── algorithms/        # Library (9 algorithms + comparison)
│   │   ├── state-viewer/      # Viewer (histograms + phases)
│   │   ├── gates/             # Gates library
│   │   ├── oracles/           # 9 oracles with analysis
│   │   ├── data-lab/          # Lab (6 datasets + statistics)
│   │   ├── docs/              # Markdown documentation
│   │   ├── api/               # Interactive REPL terminal
│   │   ├── execution/         # Execution monitor
│   │   ├── gallery/           # Circuit gallery
│   │   ├── playground/        # QASM editor
│   │   └── settings/          # Settings + themes
│   ├── components/            # Reusable components
│   ├── lib/quantum/           # Quantum libraries
│   ├── types/                 # TypeScript types
│   └── workers/               # Web Workers
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Implemented Algorithms (9)

### Fundamental
- **Grover's Algorithm**: Quantum search O(√N)
- **Deutsch-Jozsa**: Constant vs balanced test O(1)
- **Bernstein-Vazirani**: Hidden string identification O(1)
- **Simon's Algorithm**: Hidden subgroup problem O(n)

### Transformations
- **Shor's Algorithm**: Integer factorization
- **Quantum Fourier Transform**: Quantum Fourier transform
- **Quantum Phase Estimation**: Eigenvalue estimation

### Variational
- **QAOA**: Quantum approximate optimization
- **VQE**: Variational Quantum Eigensolver

## Technologies

- **React 18**: UI framework
- **TypeScript**: Static typing
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **React Router**: Navigation
- **Web Workers**: Parallel processing

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:lib` - Build public API as ESM bundle (`dist-lib/`)
- `npm run preview` - Preview local build

## Public API and documentation

The project exposes a public API for use in other systems or for documentation.

- **Entry point**: `src/api.ts` — re-exports types (`Circuit`, `Result`, `Algorithm`), quantum lib (complex numbers, gates, Bloch sphere), circuit utilities (`validateCircuit`, `circuitDepth`), and the simulator (`runSimulation`, `SimulatorOptions`).
- **Documentation**: [docs/API.md](docs/API.md) — full list of exported types and functions with usage examples.
- **Consumption**: When the package is linked or installed, import from `quantum-computer-js` (or `quantum-computer-js/src/api`). Run `npm run build:lib` to produce a standalone ESM bundle in `dist-lib/`.

## Deploy

The project is hosted on **Vercel**:

- **Production URL**: [quantum-computer-js.vercel.app](https://quantum-computer-ogt2c3gcg-wendelmaxs-projects.vercel.app)
- **Auto Deploy**: Enabled via GitHub
- **Build**: Automatic on Vercel (`npm run build`)
- **Framework**: Vite (auto-detected)


## Data Structures

### Circuit

```typescript
type Circuit = {
  numQubits: number
  gates: Gate[]
  initialStates?: Record<number, '0' | '1'>
}

type Gate = {
  type: string      // 'H', 'X', 'Y', 'Z', 'CNOT', 'RX', 'RY', 'RZ'
  target: number    // Target qubit index
  control?: number  // Control qubit (for CNOT)
  angle?: number    // Angle in radians (for rotations)
}
```

## Contributing

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is open source (MIT License).

## Useful Links

- **Live Demo**: [quantum-computer-js.vercel.app](https://quantum-computer-js.vercel.app)

## Funding

If you find this project useful, consider sponsoring development [![Sponsor](https://img.shields.io/badge/Sponsor-GitHub%20Sponsors-ea4aaa?logo=github&style=flat)](https://github.com/sponsors/wendelmax)

## References

- [Qiskit Textbook](https://qiskit.org/textbook)
- [Quantum Computing for the Very Curious](https://quantum.country/qcvc)
- [Quantum Algorithm Zoo](https://quantumalgorithmzoo.org)

