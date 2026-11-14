'use client'

import { useLayoutEffect, useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'

import { arcAngle, arcKey, arcPath, arcValue, pointAngle } from '../radial'

const PATH = arcPath()

/**
 * De helderheidsboog van het ronde menu: 270° rond de schijf, de opening
 * onderaan. Staat in een `RadialMenu`, met het midden van het menu als 0,0.
 *
 * Tijdens het slepen rendert React niet: de stand gaat per frame als
 * CSS-variabele op het element en `onChange` volgt in hetzelfde frame. Bij
 * loslaten komt `onCommit` met de laatste waarde. `ghost` zet een gestippelde
 * duim waar iemand het laatst heen wilde, na een poging die terugsprong.
 */
export function ArcSlider({
  value,
  onChange,
  onCommit,
  ghost = null,
  disabled = false,
  on = true,
  label = 'Helderheid',
}: {
  value: number
  onChange: (value: number) => void
  onCommit: (value: number) => void
  ghost?: number | null
  disabled?: boolean
  /** Uit: de duim staat op de laatste stand, zonder vulling. */
  on?: boolean
  label?: string
}) {
  const root = useRef<HTMLDivElement>(null)
  const thumb = useRef<HTMLSpanElement>(null)
  const fill = useRef<SVGPathElement>(null)
  const readout = useRef<HTMLElement>(null)
  const shown = useRef(value)
  const drag = useRef<{ value: number; frame: number } | null>(null)
  const handlers = useRef({ onChange, onCommit })

  useLayoutEffect(() => {
    handlers.current = { onChange, onCommit }
  })

  const paint = (v: number) => {
    shown.current = v
    root.current?.style.setProperty('--hoek', `${arcAngle(v)}deg`)
    fill.current?.style.setProperty('stroke-dasharray', `${v} 100`)
    thumb.current?.setAttribute('aria-valuenow', String(v))
    thumb.current?.setAttribute('aria-valuetext', `${v}%`)
    if (readout.current) readout.current.textContent = `${v}%`
  }

  useLayoutEffect(() => {
    if (!drag.current) paint(value)
  }, [value])

  const valueAt = (e: PointerEvent) => {
    const box = root.current!.getBoundingClientRect()
    return arcValue(pointAngle(e.clientX - box.left, e.clientY - box.top))
  }

  const frame = () => {
    const d = drag.current
    if (!d || d.frame) return
    d.frame = requestAnimationFrame(() => {
      d.frame = 0
      paint(d.value)
      handlers.current.onChange(d.value)
    })
  }

  const start = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || !e.isPrimary || e.button !== 0) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    e.currentTarget.dataset.sleep = ''
    drag.current = { value: valueAt(e), frame: 0 }
    frame()
  }

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    drag.current.value = valueAt(e)
    frame()
  }

  const end = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    cancelAnimationFrame(d.frame)
    drag.current = null
    delete e.currentTarget.dataset.sleep
    paint(d.value)
    handlers.current.onChange(d.value)
    handlers.current.onCommit(d.value)
  }

  const key = (e: KeyboardEvent) => {
    const next = arcKey(shown.current, e.key)
    if (next === null) return
    e.preventDefault()
    paint(next)
    onChange(next)
    onCommit(next)
  }

  return (
    <div
      ref={root}
      className="boog"
      data-aan={on || undefined}
      data-uit={disabled || undefined}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <svg className="boog-vlak" viewBox="-112 -112 224 224" aria-hidden="true">
        <path className="boog-spoor" d={PATH} pathLength={100} />
        <path ref={fill} className="boog-vulling" d={PATH} pathLength={100} />
        <path className="boog-raak" d={PATH} />
      </svg>
      {ghost !== null ? (
        <span className="radiaal-duim" data-spook style={{ '--hoek': `${arcAngle(ghost)}deg` } as CSSProperties} />
      ) : null}
      <span
        ref={thumb}
        className="radiaal-duim"
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={100}
        aria-disabled={disabled || undefined}
        onKeyDown={key}
      />
      <span className="radiaal-uitlees" aria-hidden="true">
        <b ref={readout} />
      </span>
    </div>
  )
}
