export type Complex = { r: number; i: number }
export const C = (r: number, i: number = 0): Complex => ({ r, i })
export const add = (a: Complex, b: Complex): Complex => C(a.r + b.r, a.i + b.i)
export const sub = (a: Complex, b: Complex): Complex => C(a.r - b.r, a.i - b.i)
export const mul = (a: Complex, b: Complex): Complex => C(a.r*b.r - a.i*b.i, a.r*b.i + a.i*b.r)
export const scale = (a: Complex, s: number): Complex => C(a.r * s, a.i * s)
export const conj = (a: Complex): Complex => C(a.r, -a.i)
export const norm2 = (a: Complex): number => a.r*a.r + a.i*a.i
export const zero = C(0,0)
export const one = C(1,0)


