'use client'

import { useLayoutEffect, useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'

import { ARC_RADIUS, arcAngle, arcFraction, arcKey, arcPath, arcValue, pointAngle, type ArcRange } from '../radial'

const PATH = arcPath()
const NUMBER = /^[-\d.,]+\s?[°%]?$/

/** Wat er tijdens het slepen groot in het midden staat: het getal, met een woordje eronder. */
export type ArcReadout = { text: string; unit?: string }

/**
 * De boog van het ronde menu: 270° rond de schijf, de opening onderaan. Het ene
 * getal dat je versleept (helderheid, temperatuur, volume, minuten), of met
 * `readOnly` alleen ziet (een batterij). Staat in een `RadialMenu`, met het
 * midden van het menu als 0,0.
 *
 * Tijdens het slepen rendert React niet: de stand gaat per frame als
 * CSS-variabele op het element en `onChange` volgt in hetzelfde frame. Bij
 * loslaten komt `onCommit` met de laatste waarde. `ghost` zet een gestippelde
 * duim waar iemand het laatst heen wilde, na een poging die terugsprong;
 * `marker` een streepje op een tweede waarde, zoals de temperatuur nu.
 */
export function ArcSlider({
  value,
  onChange,
  onCommit,
  min = 1,
  max = 100,
  step = 1,
  keyStep = 5,
  format = (v) => `${v}%`,
  readout,
  ghost = null,
  marker = null,
  readOnly = false,
  fill = true,
  disabled = false,
  label = 'Helderheid',
}: {
  value: number
  onChange?: (value: number) => void
  onCommit?: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Hoeveel een pijltoets verzet. */
  keyStep?: number
  /** De waarde als tekst, voor de schermlezer (`aria-valuetext`). */
  format?: (value: number) => string
  /** Wat er tijdens het slepen in het midden staat; zonder dit de tekst van `format`. */
  readout?: (value: number) => ArcReadout
  ghost?: number | null
  marker?: number | null
  readOnly?: boolean
  /** Zonder vulling: alleen het spoor, zoals een timer die uit staat of een lamp die uit is. */
  fill?: boolean
  disabled?: boolean
  label?: string
}) {
  const range: ArcRange = { min, max, step }
  const root = useRef<HTMLDivElement>(null)
  const thumb = useRef<HTMLSpanElement>(null)
  const filled = useRef<SVGPathElement>(null)
  const big = useRef<HTMLElement>(null)
  const small = useRef<HTMLSpanElement>(null)
  const shown = useRef(value)
  const drag = useRef<{ value: number; frame: number } | null>(null)
  const props = useRef({ onChange, onCommit, format, readout, range })

  useLayoutEffect(() => {
    props.current = { onChange, onCommit, format, readout, range }
  })

  const paint = (v: number) => {
    const { format, readout, range } = props.current
    shown.current = v
    root.current?.style.setProperty('--hoek', `${arcAngle(v, range)}deg`)
    filled.current?.style.setProperty('stroke-dasharray', `${arcFraction(v, range) * 100} 100`)
    thumb.current?.setAttribute('aria-valuenow', String(v))
    thumb.current?.setAttribute('aria-valuetext', format(v))
    const shownText = readout ? readout(v) : { text: format(v) }
    if (big.current) {
      big.current.textContent = shownText.text
      big.current.classList.toggle('woord', !NUMBER.test(shownText.text))
    }
    if (small.current) small.current.textContent = shownText.unit ?? ''
  }

  useLayoutEffect(() => {
    if (!drag.current) paint(value)
  }, [value, min, max])

  const valueAt = (e: PointerEvent) => {
    const box = root.current!.getBoundingClientRect()
    return arcValue(pointAngle(e.clientX - box.left, e.clientY - box.top), props.current.range)
  }

  const frame = () => {
    const d = drag.current
    if (!d || d.frame) return
    d.frame = requestAnimationFrame(() => {
      d.frame = 0
      paint(d.value)
      props.current.onChange?.(d.value)
    })
  }

  const start = (e: PointerEvent<HTMLDivElement>) => {
    if (readOnly || disabled || !e.isPrimary || e.button !== 0) return
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
    props.current.onChange?.(d.value)
    props.current.onCommit?.(d.value)
  }

  const key = (e: KeyboardEvent) => {
    const next = arcKey(shown.current, e.key, range, keyStep)
    if (next === null) return
    e.preventDefault()
    paint(next)
    onChange?.(next)
    onCommit?.(next)
  }

  const tick = (v: number) => {
    const a = (arcAngle(v, range) * Math.PI) / 180
    const at = (r: number) => `${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`
    return `M${at(ARC_RADIUS - 8)}L${at(ARC_RADIUS + 8)}`
  }

  return (
    <div
      ref={root}
      className="boog"
      data-aan={fill || undefined}
      data-dun={readOnly || undefined}
      data-uit={disabled || undefined}
      role={readOnly ? 'img' : undefined}
      aria-label={readOnly ? `${label} ${format(value)}` : undefined}
      onPointerDown={readOnly ? undefined : start}
      onPointerMove={readOnly ? undefined : move}
      onPointerUp={readOnly ? undefined : end}
      onPointerCancel={readOnly ? undefined : end}
    >
      <svg className="boog-vlak" viewBox="-112 -112 224 224" aria-hidden="true">
        <path className="boog-spoor" d={PATH} pathLength={100} />
        <path ref={filled} className="boog-vulling" d={PATH} pathLength={100} />
        {marker !== null ? (
          <>
            <path className="boog-streep-rand" d={tick(marker)} />
            <path className="boog-streep" d={tick(marker)} />
          </>
        ) : null}
        {readOnly ? null : <path className="boog-raak" d={PATH} />}
      </svg>
      {readOnly ? null : (
        <>
          {ghost !== null ? (
            <span className="radiaal-duim" data-spook style={{ '--hoek': `${arcAngle(ghost, range)}deg` } as CSSProperties} />
          ) : null}
          <span
            ref={thumb}
            className="radiaal-duim"
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label={label}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-disabled={disabled || undefined}
            onKeyDown={key}
          />
          <span className="radiaal-uitlees" aria-hidden="true">
            <b ref={big} />
            <span ref={small} />
          </span>
        </>
      )}
    </div>
  )
}
