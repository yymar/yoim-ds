'use client'

import { ChevronLeft } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'

export type RadialMember = {
  id: string
  /** Wat er op het knopje staat: een cijfer, of een korte naam. */
  label: string
  name: string
  on?: boolean
  /** De kleur van het lid als het aan is, voor de stip in het knopje. */
  glow?: string
}

export type RadialCenter = {
  on: boolean
  icon: ReactNode
  label: string
  disabled?: boolean
  /** Zonder `onToggle` is het midden alleen een teken, geen knop. */
  onToggle?: () => void
}

/**
 * Een tweede laag: andere knoppen op de ring (het kleurenwiel van een lamp, de
 * afstandsbediening van een tv), eventueel een ander midden, en "terug" in de
 * opening van de boog. Escape gaat ook terug.
 */
export type RadialLayer = {
  buttons: ReactNode
  center?: RadialCenter
  /** De straal van de knoppen op deze laag, 60 als het niet anders staat. */
  radius?: number
  onBack: () => void
}

/**
 * Het ronde menu boven een apparaat in een scene: een schijf van glas, in het
 * midden aan of uit (of de hoofdactie), eromheen wat het apparaat kan, eronder
 * de naam, wat het nu doet en een melding. Het menu weet niets van het apparaat
 * zelf; de app vult het.
 *
 * `children` staat op elke laag (de boog); `buttons` zijn de knoppen of stalen
 * op de ring. Met `layer` wisselen de knoppen en eventueel het midden voor een
 * tweede laag, met "terug" in de opening van de boog. `details` komt in het
 * naamkaartje onder de staat: wat er speelt, een kleine keuze. Een groep heeft
 * `members`: een baan met knopjes om één lid apart te sturen, elk met een stip
 * in zijn kleur als het aan is; "alle" brengt je terug.
 * Escape gaat eerst terug uit de tweede laag en sluit daarna het menu.
 */
export function RadialMenu({
  label,
  name,
  status,
  notice = null,
  link,
  center,
  buttons,
  layer = null,
  details,
  members = [],
  membersLabel = 'Eén lamp apart',
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
  center: RadialCenter
  buttons?: ReactNode
  layer?: RadialLayer | null
  details?: ReactNode
  members?: RadialMember[]
  membersLabel?: string
  member?: string | null
  onMember?: (id: string | null) => void
  onClose: () => void
  children?: ReactNode
}) {
  const root = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const latest = useRef({ layer, onClose })
  const layered = layer !== null
  const wasLayered = useRef(layered)

  useLayoutEffect(() => {
    latest.current = { layer, onClose }
  })

  useEffect(() => {
    root.current?.querySelector<HTMLElement>('button, [role="slider"]')?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    if (wasLayered.current === layered) return
    wasLayered.current = layered
    ring.current?.querySelector<HTMLElement>('button, [role="slider"]')?.focus({ preventScroll: true })
  }, [layered])

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      const { layer, onClose } = latest.current
      if (layer) layer.onBack()
      else onClose()
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])

  const middle = layer?.center ?? center

  return (
    <div ref={root} className="radiaal" role="group" aria-label={label}>
      <div className="radiaal-schijf glas-dik" />
      {middle.onToggle ? (
        <button
          type="button"
          className="radiaal-midden"
          data-on={middle.on || undefined}
          aria-pressed={layer?.center ? undefined : middle.on}
          aria-label={middle.label}
          disabled={middle.disabled}
          onClick={middle.onToggle}
        >
          {middle.icon}
        </button>
      ) : (
        <span className="radiaal-midden" data-on={middle.on || undefined} aria-hidden="true">
          {middle.icon}
        </span>
      )}
      {children}
      <div
        key={layered ? 'laag' : 'basis'}
        ref={ring}
        className="radiaal-laag"
        style={layer?.radius ? ({ '--straal': `${layer.radius}px` } as CSSProperties) : undefined}
      >
        {layer ? layer.buttons : buttons}
      </div>
      {layer ? (
        <button type="button" className="radiaal-knop radiaal-terug" aria-label="Terug" onClick={layer.onBack}>
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
      ) : null}
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
        {details}
        {link ? (
          <a href={link.href} className="radiaal-link">
            {link.label}
          </a>
        ) : null}
        {members.length > 1 ? (
          <div className="radiaal-leden" role="group" aria-label={membersLabel}>
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
                <i className="radiaal-lid-stip" aria-hidden="true" />
                {m.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
