import { describe, expect, it } from 'vitest'

import { clipped, ringShape, touching, type Box, type Radii } from './geometry.ts'

const card: Box = { l: 0, t: 0, r: 400, b: 200 }
const cardRadii: Radii = { tl: 23, tr: 23, br: 23, bl: 23 }
const square: Radii = { tl: 0, tr: 0, br: 0, bl: 0 }

describe('clipped', () => {
  it('ziet de laatste rij boven een padding onderin: ring en vlak half afgeknipt', () => {
    const row: Box = { l: 0, t: 140, r: 400, b: 194 }
    expect(clipped(row, square, card, cardRadii, 'ring')).toBeGreaterThan(0)
    expect(clipped(row, square, card, cardRadii, 'fill')).toBeGreaterThan(0)
  })

  it('laat een vlak precies in de hoek met rust, maar niet de ring', () => {
    const row: Box = { l: 0, t: 146, r: 400, b: 200 }
    expect(clipped(row, square, card, cardRadii, 'fill')).toBe(0)
    expect(clipped(row, square, card, cardRadii, 'ring')).toBeGreaterThan(0)
  })

  it('keurt een ring goed die de binnenradius van de kaart volgt', () => {
    const row: Box = { l: 0, t: 146, r: 400, b: 200 }
    expect(clipped(row, { tl: 0, tr: 0, br: 23, bl: 23 }, card, cardRadii, 'ring')).toBe(0)
  })

  it('keurt een ingesprongen afgeronde rij goed', () => {
    const row: Box = { l: 8, t: 150, r: 392, b: 192 }
    expect(clipped(row, { tl: 12, tr: 12, br: 12, bl: 12 }, card, cardRadii, 'ring')).toBe(0)
  })

  it('negeert een vlak buiten de kaart: dat is scrollen, geen hoek', () => {
    const row: Box = { l: 0, t: 260, r: 400, b: 314 }
    expect(clipped(row, square, card, cardRadii, 'fill')).toBe(0)
  })
})

describe('touching', () => {
  it('ziet twee rijen zonder ruimte ertussen', () => {
    expect(touching({ l: 0, t: 0, r: 300, b: 52 }, { l: 0, t: 52, r: 300, b: 104 })).toBe(true)
  })

  it('laat 2px ertussen met rust', () => {
    expect(touching({ l: 0, t: 0, r: 300, b: 52 }, { l: 0, t: 54, r: 300, b: 106 })).toBe(false)
  })

  it('ziet ook knoppen naast elkaar', () => {
    expect(touching({ l: 0, t: 0, r: 80, b: 40 }, { l: 80, t: 0, r: 160, b: 40 })).toBe(true)
  })
})

describe('ringShape', () => {
  it('ziet een outline buiten een balk die knipt: de ring is helemaal weg', () => {
    const bar: Box = { l: 0, t: 0, r: 200, b: 14 }
    const segment: Box = { l: 60, t: 0, r: 120, b: 14 }
    const ring = ringShape(segment, square, 2, 2)
    expect(clipped(ring.box, ring.radii, bar, { tl: 5, tr: 5, br: 5, bl: 5 }, 'ring')).toBeGreaterThan(3)
  })
})
