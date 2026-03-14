export type DocSection = {
  id: string
  title: Record<'en' | 'pt', string>
  content: Record<'en' | 'pt', string>
}

export const DOCS_CONTENT: DocSection[] = [
  {
    id: 'getting-started',
    title: { en: 'Getting Started', pt: 'Introdução' },
    content: {
      en: `# Getting Started with Quantum Computer JS\n\nQuantum Computer JS is a quantum computing simulator and visualizer built with React and TypeScript.\n\n## Features\n- **Quantum Studio**: Build and visualize quantum circuits interactively\n- **Algorithms Library**: Run and compare quantum algorithms\n- **State Visualization**: View probability distributions and state vectors`,
      pt: `# Introdução ao Quantum Computer JS\n\nO Quantum Computer JS é um simulador e visualizador de computação quântica construído com React e TypeScript.\n\n## Funcionalidades\n- **Quantum Studio**: Construa e visualize circuitos quânticos interativamente\n- **Biblioteca de Algoritmos**: Execute e compare algoritmos quânticos\n- **Visualização de Estado**: Veja distribuições de probabilidade e vetores de estado`
    }
  },
  {
    id: 'math',
    title: { en: 'Mathematical Foundations', pt: 'Fundamentos Matemáticos' },
    content: {
      en: `# Mathematical Foundations of Quantum Computing\n\n## Quantum States\n|ψ⟩ = α|0⟩ + β|1⟩, where |α|² + |β|² = 1.\n\n## Quantum Gates\n- **X (NOT)**: Flips the state.\n- **H (Hadamard)**: Creates superposition.\n- **CNOT**: Entangles two qubits.`,
      pt: `# Fundamentos Matemáticos da Computação Quântica\n\n## Estados Quânticos\n|ψ⟩ = α|0⟩ + β|1⟩, onde |α|² + |β|² = 1.\n\n## Portas Quânticas\n- **X (NOT)**: Inverte o estado.\n- **H (Hadamard)**: Cria superposição.\n- **CNOT**: Entrelaça dois qubits.`
    }
  },
  {
    id: 'concepts',
    title: { en: 'Quantum Concepts', pt: 'Conceitos Quânticos' },
    content: {
      en: `# Quantum Mechanics Concepts\n\n## Superposition\nA qubit can be in both |0⟩ and |1⟩ at the same time.\n\n## Entanglement\nSpooky action at a distance: measuring one qubit instantly affects the other.`,
      pt: `# Conceitos de Mecânica Quântica\n\n## Superposição\nUm qubit pode estar em |0⟩ e |1⟩ ao mesmo tempo.\n\n## Entrelaçamento\nAção fantasmagórica à distância: medir um qubit afeta instantaneamente o outro.`
    }
  },
  {
    id: 'algorithms',
    title: { en: 'Algorithms', pt: 'Algoritmos' },
    content: {
      en: `# Quantum Algorithms\n\n- **Grover**: Fast search.\n- **Shor**: Large number factoring.\n- **VQE**: Chemistry simulation.`,
      pt: `# Algoritmos Quânticos\n\n- **Grover**: Busca rápida.\n- **Shor**: Fatoração de grandes números.\n- **VQE**: Simulação química.`
    }
  },
  {
    id: 'api',
    title: { en: 'API Reference', pt: 'Referência da API' },
    content: {
      en: `# API Reference\n\nUse our JS library to build custom circuits and run simulations in the browser.`,
      pt: `# Referência da API\n\nUse nossa biblioteca JS para construir circuitos personalizados e executar simulações no navegador.`
    }
  }
]
