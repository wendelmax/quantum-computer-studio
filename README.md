# Quantum Computer Studio

An interactive quantum simulator and quantum circuit visualizer built with React, TypeScript, and Vite.

Powered by the [**quantum-computer-js**](https://github.com/wendelmax/quantum-computer-js) core library.

## Live Demo

**[Access the online version](https://quantum-computer-studio.vercel.app/)**

The project is hosted on Vercel and available for immediate use.

## New in v2.1.0 (Library Evolution)

The studio now supports advanced feature-set from the latest engine:
- **Circuit Optimization**: Toggle between Raw and Optimized modes to simplify circuits.
- **Advanced Noise Models**: Test under Depolarizing, Phaseflip, or Amplitude Damping channels.
- **Entanglement Metrics**: Real-time Von Neumann Entropy and State Purity measurement.
- **Improved QASM Support**: Full OpenQASM 2.0 integration with the latest parser.

## Features

- **Quantum Computer Studio**: Build and visualize quantum circuits interactively.
- **Algorithms**: Run and compare 9 quantum algorithms with complexity analysis.
- **State Viewer**: Visualize states with histograms, phase diagrams, and complete analysis.
- **Gates Library**: Complete reference of all quantum gates.
- **Data Lab**: Map classical data to quantum states with sample datasets.
- **Oracles**: Test 9 oracles with truth tables and circuit visualization.
- **API Terminal**: Interactive REPL for programming quantum circuits.
- **Execution Monitor**: Monitor performance and execution history.
- **Gallery**: Save and manage circuits.
- **QASM Playground**: QASM editor with syntax highlighting.
- **Theme Switcher**: 4 themes (Dark, Light, Matrix, Ocean).

## Architecture

**Quantum Computer Studio** is built with a modular architecture:
- **Studio Interface**: This repository (React + Vite).
- **Quantum Engine**: The core mathematical and simulation logic is encapsulated in the separate [`quantum-computer-js`](https://github.com/wendelmax/quantum-computer-js) library.

To use the quantum engine in your own projects:
```bash
npm install quantum-computer-js
```

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

```bash
# Login (first time)
vercel login

# Production deploy
vercel --prod --yes
```

## Available Gates

- **Single Qubit**: H, X, Y, Z, S, T, S_DAG, T_DAG
- **Rotation**: RX, RY, RZ
- **Multi-Qubit**: CNOT, SWAP, Toffoli

## Implemented Algorithms (9)

- **Grover's Algorithm**: Quantum search O(√N)
- **Deutsch-Jozsa**: Constant vs balanced test O(1)
- **Bernstein-Vazirani**: Hidden string identification O(1)
- **Simon's Algorithm**: Hidden subgroup problem O(n)
- **Shor's Algorithm**: Integer factorization
- **Quantum Fourier Transform**: Quantum Fourier transform
- **Quantum Phase Estimation**: Eigenvalue estimation
- **QAOA**: Quantum approximate optimization
- **VQE**: Variational Quantum Eigensolver

## Technologies

- **React 18**: UI framework.
- **TypeScript**: Static typing.
- **Vite**: Build tool and dev server.
- **Tailwind CSS**: Styling.
- **Zustand**: State management.
- **Web Workers**: Parallel processing for simulation.

## Links

- **Main Repository (UI)**: [GitHub](https://github.com/wendelmax/quantum-computer-studio)
- **Engine Library**: [GitHub](https://github.com/wendelmax/quantum-computer-js)
- **Live Demo**: [quantum-computer-studio.vercel.app](https://quantum-computer-studio.vercel.app/)
- **Author**: [Jackson Wendel](https://github.com/wendelmax)

## License

This project is open source (MIT License).
