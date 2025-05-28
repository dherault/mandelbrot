import { type MouseEvent, useCallback, useEffect, useRef, useState } from 'react'

import handleCanvas from './handleCanvas'
import type { Rect, XY } from './types'
import useEventListener from './useEventListener'

const DEFAULT_VIEWPORT: Rect = { x: 0, y: 0, width: window.innerWidth / 1, height: window.innerHeight / 1 }
const MIN_DRAG_SIZE = 12

function Mandelbrot() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [viewport, setViewport] = useState<Rect>(DEFAULT_VIEWPORT)
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState<XY | null>(null)
  const [dragEnd, setDragEnd] = useState<XY | null>(null)

  const handleMouseDown = useCallback((event: MouseEvent) => {
    setDragging(true)
    setDragStart({ x: event.clientX, y: event.clientY })
  }, [])

  const handleMouseUp = useCallback(() => {
    setDragging(false)
    setDragStart(null)
    setDragEnd(null)

    if (!(dragging && dragStart && dragEnd)) return

    const x = Math.min(dragStart.x, dragEnd.x) + viewport.x
    const y = Math.min(dragStart.y, dragEnd.y) + viewport.y
    const width = Math.abs(dragEnd.x - dragStart.x) / window.innerWidth * viewport.width
    const height = Math.abs(dragEnd.y - dragStart.y) / window.innerHeight * viewport.height

    if (width < MIN_DRAG_SIZE || height < MIN_DRAG_SIZE) return

    setViewport({ x, y, width, height })
  }, [dragging, dragStart, dragEnd, viewport])

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!(dragging && dragStart)) return

    const aspectRatio = window.innerWidth / window.innerHeight
    const width = event.clientX - dragStart.x
    const height = width / aspectRatio

    setDragEnd({ x: event.clientX, y: dragStart.y + height })
  }, [dragging, dragStart])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') setViewport(vp => ({ ...vp, x: vp.x - 0.1 * vp.width }))
    if (event.key === 'ArrowRight') setViewport(vp => ({ ...vp, x: vp.x + 0.1 * vp.width }))
    if (event.key === 'ArrowUp') setViewport(vp => ({ ...vp, y: vp.y - 0.1 * vp.height }))
    if (event.key === 'ArrowDown') setViewport(vp => ({ ...vp, y: vp.y + 0.1 * vp.height }))
    if (event.key === '[') setViewport(vp => ({ ...vp, width: vp.width * 0.9, height: vp.height * 0.9 }))
    if (event.key === ']') setViewport(vp => ({ ...vp, width: vp.width * 1.1, height: vp.height * 1.1 }))
  }, [])

  useEventListener('keydown', handleKeyDown)

  useEffect(() => {
    if (!canvasRef.current) return

    return handleCanvas(canvasRef.current, viewport)
  }, [viewport])

  return (
    <div
      className="relative h-screen w-screen"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full"
      />
      {dragging && dragStart && dragEnd && (
        <div
          className="absolute border border-white"
          style={{
            left: Math.min(dragStart.x, dragEnd.x),
            top: Math.min(dragStart.y, dragEnd.y),
            width: Math.abs(dragEnd.x - dragStart.x),
            height: Math.abs(dragEnd.y - dragStart.y),
          }}
        />
      )}
    </div>
  )
}

export default Mandelbrot
