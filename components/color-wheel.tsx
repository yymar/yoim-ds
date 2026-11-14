'use client'

import { useLayoutEffect, useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'

import { hueName, tint, wheelColor, wheelKey, wheelPoint, type WheelColor } from '../radial'

/**
 * Het kleurenwiel van het ronde menu: de tint rond, de verzadiging van het witte
 * midden naar de rand. Staat op de plek van de stalen, in een `RadialMenu` met
 * het midden van het menu als 0,0. Slepen werkt als bij `ArcSlider`: geen
 * render per frame, `onChange` tijdens het slepen en `onCommit` bij loslaten.
 */
export function ColorWheel({
  hue,
  saturation,
  onChange,
  onCommit,
  ghost = null,
  disabled = false,
  label = 'Kleur',
}: {
  hue: number
  saturation: number
  onChange: (hue: number, saturation: number) => void
  onCommit: (hue: number, saturation: number) => void
  ghost?: WheelColor | null
  disabled?: boolean
  label?: string
}) {
  const root = useRef<HTMLDivElement>(null)
  const thumb = useRef<HTMLSpanElement>(null)
  const dot = useRef<HTMLElement>(null)
  const readout = useRef<HTMLElement>(null)
  const shown = useRef<WheelColor>({ hue, saturation })
  const drag = useRef<{ color: WheelColor; frame: number } | null>(null)
  const handlers = useRef({ onChange, onCommit })

  useLayoutEffect(() => {
    handlers.current = { onChange, onCommit }
  })

  const paint = (color: WheelColor) => {
    shown.current = color
    const { x, y } = wheelPoint(color)
    thumb.current?.style.setProperty('translate', `${x.toFixed(1)}px ${y.toFixed(1)}px`)
    dot.current?.style.setProperty('background', tint(color))
    thumb.current?.setAttribute('aria-valuenow', String(color.hue))
    thumb.current?.setAttribute('aria-valuetext', hueName(color.hue))
    if (readout.current) readout.current.textContent = hueName(color.hue)
  }

  useLayoutEffect(() => {
    if (!drag.current) paint({ hue, saturation })
  }, [hue, saturation])

  const colorAt = (e: PointerEvent) => {
    const box = root.current!.getBoundingClientRect()
    return wheelColor(e.clientX - box.left, e.clientY - box.top)
  }

  const frame = () => {
    const d = drag.current
    if (!d || d.frame) return
    d.frame = requestAnimationFrame(() => {
      d.frame = 0
      paint(d.color)
      handlers.current.onChange(d.color.hue, d.color.saturation)
    })
  }

  const start = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || !e.isPrimary || e.button !== 0) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    e.currentTarget.dataset.sleep = ''
    drag.current = { color: colorAt(e), frame: 0 }
    frame()
  }

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    drag.current.color = colorAt(e)
    frame()
  }

  const end = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    cancelAnimationFrame(d.frame)
    drag.current = null
    delete e.currentTarget.dataset.sleep
    paint(d.color)
    handlers.current.onChange(d.color.hue, d.color.saturation)
    handlers.current.onCommit(d.color.hue, d.color.saturation)
  }

  const key = (e: KeyboardEvent) => {
    const next = wheelKey(shown.current, e.key)
    if (next === null) return
    e.preventDefault()
    paint(next)
    onChange(next.hue, next.saturation)
    onCommit(next.hue, next.saturation)
  }

  const ghostAt = ghost ? wheelPoint(ghost) : null

  return (
    <div
      ref={root}
      className="kleurwiel"
      data-uit={disabled || undefined}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="kleurwiel-vlak" aria-hidden="true" />
      {ghostAt ? (
        <span className="radiaal-duim" data-spook style={{ translate: `${ghostAt.x}px ${ghostAt.y}px` } as CSSProperties} />
      ) : null}
      <span
        ref={thumb}
        className="radiaal-duim"
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={359}
        aria-disabled={disabled || undefined}
        onKeyDown={key}
      >
        <i ref={dot} />
      </span>
      <span className="radiaal-uitlees" aria-hidden="true">
        <b ref={readout} className="woord" />
      </span>
    </div>
  )
}
