'use client'

import { useEffect, type ReactNode } from 'react'

/**
 * Een kaartje onder de stip voor een apparaat dat je alleen bekijkt (een
 * droger, een meter): geen schijf, niets om te verslepen. De titel, een groot
 * getal en een regel; met `alert` krijgt de regel de stip in `--botergoud`.
 * Als kinderen eventueel een `Bar` en een link, die onderaan over de hele
 * breedte staat. Escape sluit, als er `onClose` is.
 */
export function PeekCard({
  title,
  value,
  line,
  alert = false,
  unavailable = false,
  onClose,
  children,
}: {
  title: string
  value: ReactNode
  line?: ReactNode
  alert?: boolean
  unavailable?: boolean
  onClose?: () => void
  children?: ReactNode
}) {
  useEffect(() => {
    if (!onClose) return
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) onClose()
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [onClose])

  return (
    <div className="kijkkaart glas-dik" role="group" aria-label={title} data-weg={unavailable || undefined}>
      <b>{title}</b>
      {unavailable ? (
        <span>Niet bereikbaar</span>
      ) : (
        <>
          <span className="kijkkaart-groot">{value}</span>
          {line ? <span className={alert ? 'radiaal-melding' : undefined}>{line}</span> : null}
          {children}
        </>
      )}
    </div>
  )
}
