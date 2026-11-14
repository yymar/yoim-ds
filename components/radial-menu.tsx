'use client'

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

export type RadialMember = {
  id: string
  /** Wat er op het knopje staat, meestal een cijfer. */
  label: string
  name: string
  on?: boolean
  /** De kleur van het lid als het aan is, voor het streepje onder het knopje. */
  glow?: string
}

/**
 * Het ronde menu boven een apparaat in een scene: een schijf van glas, in het
 * midden aan of uit, eromheen wat het apparaat kan (`children`: knoppen,
 * stalen, `ArcSlider`, `ColorWheel`), eronder de naam, wat het nu doet en een
 * melding. Het menu weet niets van het apparaat zelf; de app vult het.
 *
 * Een groep heeft `members`: onder de naam een rij knopjes om één lid apart te
 * sturen, "alle" brengt je terug. Escape sluit het menu, tenzij iets erin de
 * toets al heeft afgehandeld (`preventDefault`), zoals een open kleurenwiel.
 */
export function RadialMenu({
  label,
  name,
  status,
  notice = null,
  link,
  center,
  members = [],
  member = null,
  onMember,
  onClose,
  children,
}: {
  label: string
  name: string
  status: string
  notice?: string | null
  link?: { href: string; label: string }
  center: {
    on: boolean
    icon: ReactNode
    label: string
    disabled?: boolean
    /** Zonder `onToggle` is het midden alleen een teken, geen knop. */
    onToggle?: () => void
  }
  members?: RadialMember[]
  member?: string | null
  onMember?: (id: string | null) => void
  onClose: () => void
  children?: ReactNode
}) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    root.current?.querySelector<HTMLElement>('button, [role="slider"]')?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) onClose()
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [onClose])

  return (
    <div ref={root} className="radiaal" role="group" aria-label={label}>
      <div className="radiaal-schijf glas-dik" />
      {center.onToggle ? (
        <button
          type="button"
          className="radiaal-midden"
          data-on={center.on || undefined}
          aria-pressed={center.on}
          aria-label={center.label}
          disabled={center.disabled}
          onClick={center.onToggle}
        >
          {center.icon}
        </button>
      ) : (
        <span className="radiaal-midden" data-on={center.on || undefined} aria-hidden="true">
          {center.icon}
        </span>
      )}
      {children}
      <div className="radiaal-naam glas-dun">
        <p aria-live="polite">
          <b>{name}</b>
          <span>{status}</span>
        </p>
        {notice ? (
          <p className="radiaal-melding" role="status">
            {notice}
          </p>
        ) : null}
        {link ? (
          <a href={link.href} className="radiaal-link">
            {link.label}
          </a>
        ) : null}
        {members.length > 1 ? (
          <div className="radiaal-leden" role="group" aria-label="Eén lamp apart">
            <button type="button" className="radiaal-lid" aria-pressed={member === null} onClick={() => onMember?.(null)}>
              alle
            </button>
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                className="radiaal-lid"
                style={{ '--gloed': m.glow } as CSSProperties}
                data-on={m.on || undefined}
                aria-pressed={member === m.id}
                aria-label={`Alleen ${m.name}`}
                onClick={() => onMember?.(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
