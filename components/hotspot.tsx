import type { ButtonHTMLAttributes, CSSProperties } from 'react'

/**
 * De stip op een apparaat in een scene: een tapvlak van 28 px met een stip van
 * 10 px. Brandt het apparaat, dan gloeit de stip in `glow`, de kleur van het
 * apparaat zelf. `pending` pulseert zolang een handeling op bevestiging wacht.
 */
export function Hotspot({
  on = false,
  glow,
  pending = false,
  unavailable = false,
  open = false,
  dim = false,
  style,
  ...button
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  on?: boolean
  glow?: string
  pending?: boolean
  unavailable?: boolean
  open?: boolean
  /** Buiten de kamer die in beeld is. */
  dim?: boolean
}) {
  return (
    <button
      type="button"
      className="hotspot"
      style={{ ...style, '--gloed': glow } as CSSProperties}
      data-on={on || undefined}
      data-pending={pending || undefined}
      data-weg={unavailable || undefined}
      data-open={open || undefined}
      data-dim={dim || undefined}
      {...button}
    />
  )
}
