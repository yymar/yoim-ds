import type { CSSProperties } from 'react'

/**
 * Een kleurvlak op de ring van het ronde menu: een wit of een kleur van de lamp.
 * `angle` is de plek op de ring (`ringAngle` uit `@yoim/ds/radial`).
 */
export function Swatch({
  color,
  selected = false,
  label,
  onSelect,
  angle,
  disabled = false,
}: {
  color: string
  selected?: boolean
  label: string
  onSelect: () => void
  angle: number
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      className="radiaal-knop"
      style={{ '--hoek': `${angle}deg` } as CSSProperties}
      data-gekozen={selected || undefined}
      aria-pressed={selected}
      aria-label={label}
      disabled={disabled}
      onClick={onSelect}
    >
      <span className="staal" style={{ background: color }} />
    </button>
  )
}
