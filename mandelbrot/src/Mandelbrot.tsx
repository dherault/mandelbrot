import { type MouseEvent, useCallback, useEffect, useRef, useState } from 'react'

import type { Rect, XY } from './types'
import handleCanvas from './handleCanvas'
import useEventListener from './hooks/useEventListener'
import useWindowSize from './hooks/useWindowSize'
import useDebounce from './hooks/useDebounce'

const DEFAULT_VIEWPORT: Rect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight }
const TRANSLATION_FACTOR = 0.1
const ZOOM_FACTOR = 0.25

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

    const ar = window.innerWidth / viewport.width
    const x = Math.min(dragStart.x, dragEnd.x) / ar + viewport.x
    const y = Math.min(dragStart.y, dragEnd.y) / ar + viewport.y
    const width = Math.abs(dragEnd.x - dragStart.x) / ar
    const height = Math.abs(dragEnd.y - dragStart.y) / ar

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
    if (event.key === 'ArrowLeft') setViewport(vp => ({ ...vp, x: vp.x - TRANSLATION_FACTOR * vp.width }))
    if (event.key === 'ArrowRight') setViewport(vp => ({ ...vp, x: vp.x + TRANSLATION_FACTOR * vp.width }))
    if (event.key === 'ArrowUp') setViewport(vp => ({ ...vp, y: vp.y - TRANSLATION_FACTOR * vp.height }))
    if (event.key === 'ArrowDown') setViewport(vp => ({ ...vp, y: vp.y + TRANSLATION_FACTOR * vp.height }))
    if (event.key === '[') setViewport(vp => ({ ...vp, width: vp.width * (1 + ZOOM_FACTOR), height: vp.height * (1 + ZOOM_FACTOR) }))
    if (event.key === ']') setViewport(vp => ({ ...vp, width: vp.width * (1 - ZOOM_FACTOR), height: vp.height * (1 - ZOOM_FACTOR) }))
    if (event.key === '=') setViewport(DEFAULT_VIEWPORT)
  }, [])

  useEventListener('keydown', handleKeyDown)

  const { width } = useWindowSize()
  const debouncedWidth = useDebounce(width, 100)

  useEffect(() => {
    if (!canvasRef.current) return

    return handleCanvas(canvasRef.current, viewport)
  }, [viewport, debouncedWidth])

  return (
    <div
      className="relative h-screen w-screen bg-black"
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
