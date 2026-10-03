/**
 * De ene empty-state vorm van het systeem: twee regels tekst, gecentreerd in
 * de ruimte die de inhoud zou innemen. `kop` zegt wat er is ("De lijst is
 * leeg."), `tekst` wijst naar de volgende stap op ditzelfde scherm; nooit
 * "Geen resultaten". Een icoon mag, als plaats ("lijst nakijken",
 * "rekeningen"), nooit als metafoor van leegte. `actie` is de zeldzame stille
 * knop eronder, nooit accentgevuld.
 */
export function LeegStaat({
  kop,
  tekst,
  actie,
  icon,
  klasse,
}: {
  kop: string
  tekst?: string
  actie?: React.ReactNode
  /** Een lucide-icoon; maat en lijndikte zet LeegStaat zelf. */
  icon?: React.ReactNode
  /** Voor een afwijkende padding, zoals de compactere vorm ín een kaart. */
  klasse?: string
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1.5 text-center ${
        klasse ?? 'px-6 py-12'
      }`}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className="mb-1.5 text-[var(--text-subtle)] [&_svg]:size-7 [&_svg]:[stroke-width:1.8]"
        >
          {icon}
        </span>
      ) : null}
      <b className="text-base font-medium text-[var(--text)]">{kop}</b>
      {tekst ? (
        <p className="max-w-[17rem] text-[15px] leading-[1.5] text-[var(--text-muted)] [text-wrap:pretty]">
          {tekst}
        </p>
      ) : null}
      {actie ? <span className="mt-3">{actie}</span> : null}
    </div>
  )
}
