import { formatAmount, type AmountKind } from '../money'

const KLEUR: Record<AmountKind, string> = {
  // Nooit rood voor een gewone uitgave: uitgeven is geen fout.
  out: 'text-[var(--text)]',
  in: 'text-[var(--success)]',
  neutral: 'text-[var(--text)]',
  excluded: 'text-[var(--text-subtle)]',
}

const GROOTTE = {
  large: 'text-[30px] leading-[1.1] font-semibold tracking-[-0.02em]',
  line: 'text-[15px] font-medium',
  small: 'text-[13px] font-normal',
} as const

/**
 * Een bedrag. `excluded` is een overboeking tussen eigen rekeningen: geen
 * teken, gedempt, en de naam in de rij hoort dan --text-muted te zijn.
 */
export function Amount({
  value,
  kind,
  size = 'line',
}: {
  value: number
  kind: AmountKind
  size?: keyof typeof GROOTTE
}) {
  const tekst = formatAmount(value, kind)

  return (
    <span className={`whitespace-nowrap tabular-nums ${KLEUR[kind]} ${GROOTTE[size]}`}>
      <span aria-hidden="true">{tekst}</span>
      {/* Een schermlezer leest U+2212 niet altijd als "min". */}
      <span className="sr-only">
        {tekst.replace('−', 'min ').replace('+', 'plus ')}
      </span>
    </span>
  )
}
