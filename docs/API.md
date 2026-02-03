# Public API

This document describes the exports intended for use in other systems or for documentation. The entry point is `src/api.ts`.

## Usage

**From source (linked package or monorepo):**

```ts
import {
  runSimulation,
  validateCircuit,
  circuitDepth,
  type Circuit,
  type Result,
  type SimulatorOptions,
} from 'quantum-computer-js/src/api'
```

**After building the library** (when using `npm run build:lib`):

```ts
import { runSimulation, type Circuit } from 'quantum-computer-js'
```

---

## Types

### Circuit

```ts
type CircuitGate = {
  type: string
  target: number
  control?: number
  control2?: number
  target2?: number
  angle?: number
}

type Circuit = {
  numQubits: number
  gates: CircuitGate[]
  initialStates?: Record<number, '0' | '1'>
}
```

### Result

```ts
type Result = {
  probabilities: Record<string, number>
  stateVector?: number[]
}
```

### Algorithm

```ts
type Algorithm = {
  id: string
  name: string
  description?: string
  category?: string
  complexity?: string
  classicalComplexity?: string
  appliedTo?: string
  difficulty?: string
  year?: number
}
```

### Complex, Bloch, Validation

- `Complex`: `{ r: number; i: number }`
- `BlochCoords`, `BlochPoint`: Bloch sphere coordinates
- `ValidationResult`: `{ valid: true } | { valid: false; error: string }`
- `SimulatorOptions`: `{ shots?: number; noise?: number }`
- `GateName`: `'H' | 'X' | 'Y' | 'Z' | 'CNOT' | 'RX' | 'RY' | 'RZ'`
- `QubitIndex`, `QubitRegister`: qubit helpers

---

## Simulator

### runSimulation(circuit, options?)

Runs a quantum circuit and returns probabilities (and optionally state vector). In the browser it may use a Web Worker; otherwise runs synchronously.

- **circuit**: `Circuit`
- **options**: `{ shots?: number; noise?: number }` — `shots` samples from the distribution; `noise` applies bit-flip probability per gate (0–1).
- **Returns**: `Promise<Result>`

```ts
const circuit: Circuit = {
  numQubits: 2,
  gates: [
    { type: 'H', target: 0 },
    { type: 'CNOT', control: 0, target: 1 },
  ],
}
const result = await runSimulation(circuit)
console.log(result.probabilities)
```

### clearCache()

Clears the internal gate matrix cache. Optional; useful if you create many circuits with parameterized gates.

---

## Circuit utilities

### validateCircuit(circuit)

Returns `{ valid: true }` or `{ valid: false, error: string }`. Checks qubit ranges, control/target validity, and multi-qubit gate config (Toffoli, SWAP).

### circuitDepth(circuit)

Returns the maximum number of gates on any single qubit line (integer).

---

## Quantum math (lib)

### Complex numbers

- `C(r, i)` — construct
- `add`, `sub`, `mul`, `scale`, `conj`, `norm2`
- `zero`, `one`

### Gates

- `GATES`: array of gate names
- `GateName`: type

### Qubits

- `clampQubits(n)`: clamp to 1–16
- `createRegister(size)`: `{ size }`

### Helpers

- `radians(deg)`
- `normalize(vec)`
- `clamp(value, min, max)`

### Bloch sphere

- `stateToBloch(amplitudes)`: `[number, number]` → `BlochCoords`
- `toBlochPoint(theta, phi)`: spherical → Cartesian

---

## Export formats

The app also supports:

- **Circuit JSON**: `Circuit` serialized as JSON (import/export in Studio, share link hash).
- **Presets**: Algorithm circuits are defined in `src/app/algorithms/services/presets.ts` and `algorithms-list.json`; you can reuse the same `Circuit` shape in external tools.

To generate a standalone ESM bundle of the public API:

```bash
npm run build:lib
```

Output is written to `dist-lib/index.js`. In browser environments, `runSimulation` may use a Web Worker; when consumed as a library, the worker is optional and the sync path is used if the worker is unavailable.
