export type AmountKind = 'out' | 'in' | 'neutral' | 'excluded'

const getal = new Intl.NumberFormat('nl-NL', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * `−€ 42,18`, `+€ 2.400,00`, `€ 0,50`. Het teken staat voor het euroteken,
 * zodat een kolom op het teken lijnt; de min is U+2212 en niet het
 * koppelteken, want dat is smaller en staat lager.
 */
export function formatAmount(value: number, kind: AmountKind): string {
  const bedrag = `€ ${getal.format(Math.abs(value))}`

  // Wat op 0,00 uitkomt krijgt geen teken: "−€ 0,00" bestaat niet.
  if (Math.round(Math.abs(value) * 100) === 0 || kind === 'excluded') {
    return bedrag
  }

  if (kind === 'out') return `−${bedrag}`
  if (kind === 'in') return `+${bedrag}`

  return value < 0 ? `−${bedrag}` : bedrag
}

export type BarState = 'within' | 'almost' | 'over'

/** `x` is waarde / max. Precies op het budget is binnen, niet bijna. */
export function barState(x: number): BarState {
  if (x > 1) return 'over'
  if (x >= 0.9 && x < 1) return 'almost'

  return 'within'
}

export type HeatLevel = 0 | 1 | 2 | 3

/**
 * Niveau 0 is een dag zonder uitgaven; 1 tot 3 zijn de terciles van de dagen
 * mét uitgaven in de periode. `values` zijn de uitgaven per dag als positief
 * bedrag.
 */
export function heatLevel(values: number[]): (v: number) => HeatLevel {
  const dagen = values.filter((v) => v > 0).sort((a, b) => a - b)
  const n = dagen.length

  if (n === 0) return () => 0

  const t1 = dagen[Math.ceil(n / 3) - 1]
  const t2 = dagen[Math.ceil((2 * n) / 3) - 1]

  return (v) => {
    if (!(v > 0)) return 0
    if (v <= t1) return 1
    if (v <= t2) return 2

    return 3
  }
}
