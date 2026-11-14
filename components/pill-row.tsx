export type PillOption<T extends string> = { value: T; label: string }

/**
 * Een kleine keuze in het naamkaartje van het ronde menu: een label met een rij
 * knopjes van 28 px (`.radiaal-lid`), zoals de stand van een ventilator. Eén
 * keuze tegelijk.
 */
export function PillRow<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: {
  label: string
  options: PillOption<T>[]
  value: T | null
  onChange: (value: T) => void
  disabled?: boolean
}) {
  return (
    <div className="pilrij" role="group" aria-label={label}>
      <span>{label}</span>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="radiaal-lid"
          aria-pressed={o.value === value}
          disabled={disabled}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
