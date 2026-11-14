export type PillOption<T extends string> = { value: T; label: string }

/**
 * Een kleine keuze in het naamkaartje van het ronde menu, zoals de stand van
 * een ventilator: het label erboven, de keuzes in één baan (`.radiaal-lid`,
 * 28 px hoog). Eén keuze tegelijk.
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
      <span aria-hidden="true">{label}</span>
      <div className="pilrij-baan">
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
    </div>
  )
}
