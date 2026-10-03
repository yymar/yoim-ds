import { barState, formatAmount, type BarState } from '../money'

const VULLING: Record<BarState, string> = {
  within: 'var(--accent)',
  almost: 'var(--botergoud)',
  over: 'var(--danger)',
}

/**
 * Een budgetbalk. De kleur staat op de balk en niet op de regeltekst ernaast:
 * botergoud haalt op wit geen 4,5:1. Die tekst volgt dezelfde regel via
 * `barState` uit `@yoim/ds/money`.
 *
 * Over budget schaalt de balk naar de waarde: de vulling is vol en de
 * markering staat op het einde van het budget, niet meer op `marker`.
 */
export function Bar({
  value,
  max,
  marker,
  height = 8,
}: {
  value: number
  max: number
  /** Positie op het spoor, 0 tot 1, bijvoorbeeld vandaag in de periode. */
  marker?: number
  height?: number
}) {
  const x = max > 0 ? value / max : 0
  const state = barState(x)
  const over = state === 'over'
  const streep = over ? max / value : marker

  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuenow={Math.min(value, max)}
      aria-valuemax={max}
      aria-valuetext={`${formatAmount(value, 'neutral')} van ${formatAmount(max, 'neutral')}`}
      className="relative w-full rounded-[var(--radius-capsule)] bg-[var(--surface-sunken)]"
      style={{ height }}
    >
      <div
        className="h-full rounded-[var(--radius-capsule)]"
        style={{
          width: `${over ? 100 : Math.max(0, x) * 100}%`,
          background: VULLING[state],
        }}
      />
      {streep === undefined ? null : (
        <div
          aria-hidden="true"
          className="absolute top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--text)] shadow-[0_0_0_2px_var(--surface-raised)]"
          style={{ left: `${Math.min(1, Math.max(0, streep)) * 100}%` }}
        />
      )}
    </div>
  )
}
