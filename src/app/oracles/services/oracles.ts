import { oracles } from '../data/oracles'

export function getOracle(id: string) {
  const oracle = oracles.find(o => o.id === id)
  if (!oracle) throw new Error(`Oracle with id ${id} not found`)
  return oracle.circuit
}
