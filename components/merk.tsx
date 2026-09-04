/**
 * Het merkteken: de A met de 2 erdoorheen gevlochten, Molenberg 2a. De voet
 * van de 2 sluit rechtsonder tot een driehoek, de berg.
 *
 * Vijf paden, vaste geometrie, nagetekend van het aangeleverde logo
 * (updated_logo.png, aug 2026). Nooit uitrekken en geen tweede kleur.
 *
 * Zonder `vlak` erft het teken `currentColor`, dus je zet de kleur op de ouder.
 * Met `vlak` staat het op zijn eigen tegel met --icon-bg / --icon-mark: dat is
 * het app-icoon, en het enige moment dat het teken een achtergrond meebrengt.
 *
 * Overgenomen uit components/merk/Merk.jsx in het design system.
 */
export function Merk({
  grootte = 28,
  vlak = false,
  titel = 'YoIm',
  style,
  ...rest
}: React.HTMLAttributes<HTMLElement> & {
  /** Hoogte van het teken in px; met `vlak` de zijde van de tegel. */
  grootte?: number
  /** Op de app-icoontegel in plaats van currentColor. */
  vlak?: boolean
  /** Toegankelijke naam. */
  titel?: string
}) {
  // Geen <symbol>/<use>: een geneste viewBox schaalt de strokes weg, en die
  // strokes zijn de vorm.
  const teken = (
    <svg
      viewBox="122 42 798 916"
      width={vlak ? '62%' : grootte * 0.871}
      height={vlak ? undefined : grootte}
      role="img"
      aria-label={titel}
      focusable="false"
      style={{ flex: '0 0 auto', display: 'block', overflow: 'visible' }}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="56"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M515 70L150 930" />
        <path d="M515 70L645 350" />
        <path d="M310 575L685 575" />
        <path d="M562 512C562 434 610 386 686 386C766 386 812 440 812 506C812 562 782 618 730 678L512 930L892 930" />
        <path d="M796 713L886 929" />
      </g>
    </svg>
  )

  if (!vlak) {
    return (
      <span {...rest} style={{ display: 'inline-flex', ...style }}>
        {teken}
      </span>
    )
  }

  return (
    <span
      {...rest}
      style={{
        flex: '0 0 auto',
        display: 'grid',
        placeItems: 'center',
        width: grootte,
        height: grootte,
        borderRadius: grootte * 0.2237,
        background: 'var(--icon-bg)',
        color: 'var(--icon-mark)',
        ...style,
      }}
    >
      {teken}
    </span>
  )
}
