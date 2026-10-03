import { describe, expect, it } from 'vitest'

import { barState, formatAmount, heatLevel } from './money'

describe('barState', () => {
  it.each([
    [0.89, 'within'],
    [0.9, 'almost'],
    [0.999, 'almost'],
    [1, 'within'],
    [1.01, 'over'],
  ])('%s is %s', (x, state) => {
    expect(barState(x)).toBe(state)
  })
})

describe('formatAmount', () => {
  it.each([
    [0, 'out', '€ 0,00'],
    [0, 'in', '€ 0,00'],
    [0.5, 'out', '−€ 0,50'],
    [0.5, 'in', '+€ 0,50'],
    [1234.56, 'neutral', '€ 1.234,56'],
    [1234.56, 'in', '+€ 1.234,56'],
    [-42.18, 'out', '−€ 42,18'],
    [-42.18, 'neutral', '−€ 42,18'],
    [-42.18, 'excluded', '€ 42,18'],
    [1000000, 'in', '+€ 1.000.000,00'],
    [1000000, 'excluded', '€ 1.000.000,00'],
    [0.1 + 0.2, 'out', '−€ 0,30'],
    [-0, 'out', '€ 0,00'],
  ] as const)('%s als %s', (value, kind, tekst) => {
    expect(formatAmount(value, kind)).toBe(tekst)
  })
})

describe('heatLevel', () => {
  it('geeft 0 voor een dag zonder uitgaven', () => {
    const niveau = heatLevel([0, 0, 5])

    expect(niveau(0)).toBe(0)
  })

  it('deelt de dagen met uitgaven in terciles', () => {
    const niveau = heatLevel([0, 6, 1, 5, 2, 4, 3])

    expect([0, 1, 2, 3, 4, 5, 6].map(niveau)).toEqual([0, 1, 1, 2, 2, 3, 3])
  })

  it('geeft 0 zonder uitgavendagen', () => {
    expect(heatLevel([])(5)).toBe(0)
  })

  it('zet een periode met één uitgavendag op niveau 1', () => {
    expect(heatLevel([0, 12])(12)).toBe(1)
  })
})
