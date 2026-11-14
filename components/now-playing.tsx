import type { ReactNode } from 'react'

/**
 * Wat er nu speelt, in het naamkaartje van het ronde menu: een hoes van 40 px
 * (een afbeelding, of anders een icoon), de titel en een regel eronder. Lange
 * tekst kapt af met een ellips.
 */
export function NowPlaying({
  title,
  subtitle,
  cover = null,
  icon,
}: {
  title: string
  subtitle?: string
  /** De url van de hoes. De app zorgt dat die niet naar een server buiten de app wijst. */
  cover?: string | null
  icon?: ReactNode
}) {
  return (
    <div className="speelt">
      <span className="speelt-hoes">{cover ? <img src={cover} alt="" /> : icon}</span>
      <div>
        <b>{title}</b>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>
    </div>
  )
}
