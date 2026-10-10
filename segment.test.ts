import { describe, expect, it } from 'vitest'

import { MAX_OPTIONS, MIN_OPTIONS, nextIndex, optionCountWarning } from './segment'

describe('nextIndex', () => {
  it('gaat met rechts en omlaag een verder en loopt rond', () => {
    expect(nextIndex('ArrowRight', 0, 3)).toBe(1)
    expect(nextIndex('ArrowDown', 1, 3)).toBe(2)
    expect(nextIndex('ArrowRight', 2, 3)).toBe(0)
  })

  it('gaat met links en omhoog een terug en loopt rond', () => {
    expect(nextIndex('ArrowLeft', 2, 3)).toBe(1)
    expect(nextIndex('ArrowUp', 1, 3)).toBe(0)
    expect(nextIndex('ArrowLeft', 0, 3)).toBe(2)
  })

  it('springt met Home en End naar het begin en het eind', () => {
    expect(nextIndex('Home', 2, 4)).toBe(0)
    expect(nextIndex('End', 0, 4)).toBe(3)
  })

  it('doet niets met een andere toets of zonder keuzes', () => {
    expect(nextIndex('Enter', 1, 3)).toBeNull()
    expect(nextIndex('a', 1, 3)).toBeNull()
    expect(nextIndex('ArrowRight', 0, 0)).toBeNull()
  })

  it('komt van een onbekende keuze (-1) bij de eerste of de laatste uit', () => {
    expect(nextIndex('ArrowRight', -1, 3)).toBe(0)
    expect(nextIndex('ArrowLeft', -1, 3)).toBe(1)
  })
})

describe('optionCountWarning', () => {
  it('zwijgt bij 2 tot 4 keuzes', () => {
    for (let n = MIN_OPTIONS; n <= MAX_OPTIONS; n++) expect(optionCountWarning(n)).toBeNull()
  })

  it('waarschuwt bij minder dan 2 of meer dan 4', () => {
    expect(optionCountWarning(1)).toMatch(/1 keuzes, verwacht 2 tot 4/)
    expect(optionCountWarning(0)).not.toBeNull()
    expect(optionCountWarning(5)).toMatch(/5 keuzes/)
  })
})
