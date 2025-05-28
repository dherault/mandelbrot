type XY = {
  x: number
  y: number
}

type Rect = {
  x: number
  y: number
  width: number
  height: number
}

function handleCanvas(canvas: HTMLCanvasElement) {
  const _ = canvas.getContext('2d')!

  const devicePixelRatio = window.devicePixelRatio || 1

  canvas.width = canvas.clientWidth * devicePixelRatio
  canvas.height = canvas.clientHeight * devicePixelRatio

  const width = canvas.clientWidth
  const height = canvas.clientHeight

  _.scale(devicePixelRatio, devicePixelRatio)

  let shouldStopDrawing = false
  const drawIterationStep = 4096 * 16
  const computeIterationStep = 100
  const scale = 0.003
  const center: XY = { x: width / 2, y: height / 2 }
  const cursorStart: XY = { ...center }
  const cursorBounds: Rect = { ...cursorStart, width: 0, height: 0 }
  const cursorSpeed: XY = { x: 1, y: 0 }
  const cursor: XY = { ...cursorStart }

  /* ---
    Draw
  --- */

  _.fillStyle = 'black'

  function draw() {
    if (cursor.x < 0 || cursor.x > width || cursor.y < 0 || cursor.y > height) return

    const conversionFactor = getConversionFactor()
    const color = getColorGradient(conversionFactor)

    _.fillStyle = color
    _.fillRect(cursor.x, cursor.y, 1, 1)
  }

  /* ---
    Update
  --- */

  function update() {
    cursor.x += cursorSpeed.x
    cursor.y += cursorSpeed.y

    if (cursor.x > cursorBounds.x + cursorBounds.width) {
      cursorBounds.width = cursor.x - cursorBounds.x + 1
      cursorSpeed.x = 0
      cursorSpeed.y = 1
    }
    else if (cursor.x < cursorBounds.x) {
      cursorBounds.x = cursor.x
      cursorSpeed.x = 0
      cursorSpeed.y = -1
    }
    else if (cursor.y > cursorBounds.y + cursorBounds.height) {
      cursorBounds.height = cursor.y - cursorBounds.y + 1
      cursorSpeed.x = -1
      cursorSpeed.y = 0
    }
    else if (cursor.y < cursorBounds.y) {
      cursorBounds.y = cursor.y
      cursorSpeed.x = 1
      cursorSpeed.y = 0
    }

    shouldStopDrawing = cursorBounds.width > width && cursorBounds.height > height
  }

  /* ---
    Logic
  --- */

  // function getConversionFactor() {
  //   const diff = substactVector(cursor, cursorStart)

  //   return Math.sqrt(diff.x * diff.x + diff.y * diff.y) / 100
  // }

  function getConversionFactor() {
    let z: XY = { x: 0, y: 0 }
    let factor = 0

    for (let i = 0; i < computeIterationStep; i++) {
      factor = i / computeIterationStep
      z = addVector(squareComplexNumber(z), scaleVector(substactVector((cursor), cursorStart), scale))

      if (getComplexNumberNorm(z) > 2) {
        break
      }
    }

    return factor
  }

  function addVector(a: XY, b: XY): XY {
    return { x: a.x + b.x, y: a.y + b.y }
  }

  function substactVector(a: XY, b: XY): XY {
    return { x: a.x - b.x, y: a.y - b.y }
  }

  function scaleVector(v: XY, factor: number): XY {
    return { x: v.x * factor, y: v.y * factor }
  }

  function squareComplexNumber(z: XY): XY {
    return {
      x: z.x * z.x - z.y * z.y,
      y: 2 * z.x * z.y,
    }
  }

  function getComplexNumberNorm(z: XY): number {
    return Math.sqrt(z.x * z.x + z.y * z.y)
  }

  function getColorGradient(factor: number): string {
    const hue = Math.floor(240 - factor * 240)

    return `hsl(${hue}, 100%, 50%)`
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

    if (shouldStopDrawing) stopped = true
    if (stopped) return

    requestAnimationFrame(step)
  }

  requestAnimationFrame(step)

  return () => {
    stopped = true
  }
}

export default handleCanvas
