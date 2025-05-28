import type { XY } from './types'

export function addVector(a: XY, b: XY): XY {
  return { x: a.x + b.x, y: a.y + b.y }
}

export function substractVector(a: XY, b: XY): XY {
  return { x: a.x - b.x, y: a.y - b.y }
}

export function scaleVector(v: XY, factor: number): XY {
  return { x: v.x * factor, y: v.y * factor }
}

export function squareComplexNumber(z: XY): XY {
  return {
    x: z.x * z.x - z.y * z.y,
    y: 2 * z.x * z.y,
  }
}

export function getComplexNumberNorm(z: XY): number {
  return Math.sqrt(z.x * z.x + z.y * z.y)
}
