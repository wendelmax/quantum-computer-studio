export type BlochCoords = { x: number; y: number; z: number }
export function stateToBloch(amplitudes: [number, number]): BlochCoords {
  return { x: amplitudes[0], y: 0, z: amplitudes[1] }
}

export type BlochPoint = { x: number; y: number; z: number }
export function toBlochPoint(theta: number, phi: number): BlochPoint {
  return {
    x: Math.sin(theta) * Math.cos(phi),
    y: Math.sin(theta) * Math.sin(phi),
    z: Math.cos(theta),
  }
}


