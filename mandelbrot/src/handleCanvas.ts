import type { Rect, XY } from './types'
import { addVector, getComplexNumberNorm, scaleVector, squareComplexNumber, substactVector } from './math'

function handleCanvas(canvas: HTMLCanvasElement, viewport: Rect) {
  const _ = canvas.getContext('2d')!

  const devicePixelRatio = window.devicePixelRatio || 1

  canvas.width = canvas.clientWidth * devicePixelRatio
  canvas.height = canvas.clientHeight * devicePixelRatio

  _.scale(devicePixelRatio, devicePixelRatio)

  let shouldStopDrawing = false
  const drawIterationStep = 4 * 32 * 32 * 32
  const computeIterationStep = 100

  const canvasWidth = canvas.clientWidth
  const canvasHeight = canvas.clientHeight

  const scaleBase = 0.003
  const viewportScale = viewport.width / canvasWidth

  const center: XY = { x: canvasWidth / 1.666, y: canvasHeight / 2 }
  const cursor: XY = { x: 0, y: 0 }

  /* ---
    Draw
  --- */

  function draw() {
    if (cursor.x < 0 || cursor.x > canvasWidth || cursor.y < 0 || cursor.y > canvasHeight) return

    _.fillStyle = getColorGradient(getConversionFactor())
    _.fillRect(cursor.x, cursor.y, 1, 1)
  }

  function drawHelpers() {
    console.log('viewport', viewport)
    _.beginPath()
    _.arc(center.x, center.y, 12, 0, 2 * Math.PI)
    _.fillStyle = 'green'
    _.fill()

    // _.beginPath()
    // _.arc(centerOffsetScaled.x, centerOffsetScaled.y, 12, 0, 2 * Math.PI)
    // _.fillStyle = 'purple'
    // _.fill()
  }

  /* ---
    Update
  --- */

  function update() {
    cursor.x += 1

    if (cursor.x > canvasWidth) {
      cursor.x = 0
      cursor.y += 1
    }

    shouldStopDrawing = cursor.y >= canvasHeight
  }

  /* ---
    Logic
  --- */

  function getConversionFactor() {
    let z: XY = { x: 0, y: 0 }
    let factor = 0

    for (let i = 0; i < computeIterationStep; i++) {
      factor = i / computeIterationStep
      let cx = substactVector(cursor, center)
      cx = addVector(cx, viewport)
      cx = scaleVector(cx, viewportScale)
      cx = substactVector(cx, viewport)
      // cx = substactVector(cx, scaleVector(viewport, viewportScale))

      z = addVector(squareComplexNumber(z), scaleVector(cx, scaleBase))

      if (getComplexNumberNorm(z) > 2) break
    }

    return factor
  }

  function getColorGradient(factor: number): string {
    return `hsl(${240 - factor * 240}, 100%, 50%)`
  }

  /* ---
    Visualization loop
  --- */

  let stopped = false

  function step() {
    for (let i = 0; i < drawIterationStep; i++) {
      draw()
      update()
    }

    if (shouldStopDrawing) {
      stopped = true

      drawHelpers()
    }

    if (stopped) return

    requestAnimationFrame(step)
  }

  requestAnimationFrame(step)

  return () => {
    stopped = true
  }
}

export default handleCanvas
