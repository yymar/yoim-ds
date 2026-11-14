import { describe, expect, it } from 'vitest'

import {
  ARC_END,
  ARC_START,
  arcAngle,
  arcFraction,
  arcKey,
  arcPath,
  arcValue,
  snap,
  hueName,
  pointAngle,
  ringAngle,
  tint,
  wheelColor,
  wheelKey,
  wheelPoint,
} from './radial'

describe('pointAngle', () => {
  it('meet met de klok mee vanaf rechts, met y omlaag', () => {
    expect(pointAngle(1, 0)).toBe(0)
    expect(pointAngle(0, 1)).toBe(90)
    expect(pointAngle(-1, 0)).toBe(180)
    expect(pointAngle(0, -1)).toBe(270)
  })
})

const GRADEN = { min: 16, max: 30, step: 0.5 }
const MINUTEN = { min: 0, max: 120, step: 5 }

describe('de boog', () => {
  it('loopt van linksonder over boven naar rechtsonder', () => {
    expect(arcAngle(1)).toBe(ARC_START)
    expect(arcAngle(100)).toBe(ARC_END)
    expect(arcAngle(23, GRADEN)).toBe(270)
    expect(arcValue(270, GRADEN)).toBe(23)
    expect(arcValue(ARC_START)).toBe(1)
    expect(arcValue(ARC_END - 360)).toBe(100)
    expect(arcFraction(60, MINUTEN)).toBe(0.5)
  })

  it('geeft de waarde terug waar de duim staat', () => {
    for (const v of [1, 5, 33, 64, 99, 100]) expect(arcValue(arcAngle(v))).toBe(v)
    for (const v of [16, 18.5, 21.5, 29.5, 30]) expect(arcValue(arcAngle(v, GRADEN), GRADEN)).toBe(v)
    for (const v of [0, 5, 45, 120]) expect(arcValue(arcAngle(v, MINUTEN), MINUTEN)).toBe(v)
  })

  it('legt een waarde op de stap', () => {
    expect(snap(21.3, GRADEN)).toBe(21.5)
    expect(snap(21.2, GRADEN)).toBe(21)
    expect(snap(43, MINUTEN)).toBe(45)
    expect(snap(140, MINUTEN)).toBe(120)
  })

  it('klemt in de opening onderaan: links van het midden naar het minimum, rechts naar het maximum', () => {
    expect(arcValue(91)).toBe(1)
    expect(arcValue(130)).toBe(1)
    expect(arcValue(89)).toBe(100)
    expect(arcValue(50)).toBe(100)
    expect(arcValue(100, MINUTEN)).toBe(0)
    expect(arcValue(80, GRADEN)).toBe(30)
  })

  it('neemt hoeken buiten 0 tot 360', () => {
    expect(arcValue(-90)).toBe(arcValue(270))
    expect(arcValue(630)).toBe(arcValue(270))
  })

  it('begint en eindigt het pad op de straal', () => {
    expect(arcPath(96)).toMatch(/^M-67\.88 67\.88A96 96 0 1 1 67\.88 67\.88$/)
  })

  it('stapt met de pijlen binnen het bereik', () => {
    expect(arcKey(50, 'ArrowRight')).toBe(55)
    expect(arcKey(50, 'ArrowDown')).toBe(45)
    expect(arcKey(98, 'ArrowUp')).toBe(100)
    expect(arcKey(3, 'ArrowLeft')).toBe(1)
    expect(arcKey(21.5, 'ArrowUp', GRADEN, 0.5)).toBe(22)
    expect(arcKey(16, 'ArrowDown', GRADEN, 0.5)).toBe(16)
    expect(arcKey(5, 'ArrowLeft', MINUTEN, 5)).toBe(0)
    expect(arcKey(50, 'Enter')).toBeNull()
  })
})

describe('het kleurenwiel', () => {
  it('geeft tint en verzadiging terug waar de duim staat', () => {
    for (const color of [
      { hue: 0, saturation: 0 },
      { hue: 90, saturation: 50 },
      { hue: 265, saturation: 80 },
      { hue: 330, saturation: 100 },
    ]) {
      const { x, y } = wheelPoint(color)
      expect(wheelColor(x, y)).toEqual(color)
    }
  })

  it('klemt de verzadiging tussen het witte midden en de rand', () => {
    expect(wheelColor(10, 0).saturation).toBe(0)
    expect(wheelColor(200, 0).saturation).toBe(100)
  })

  it('draait de tint rond en klemt de verzadiging met de pijlen', () => {
    expect(wheelKey({ hue: 355, saturation: 50 }, 'ArrowRight')).toEqual({ hue: 5, saturation: 50 })
    expect(wheelKey({ hue: 5, saturation: 50 }, 'ArrowLeft')).toEqual({ hue: 355, saturation: 50 })
    expect(wheelKey({ hue: 0, saturation: 98 }, 'ArrowUp')).toEqual({ hue: 0, saturation: 100 })
    expect(wheelKey({ hue: 0, saturation: 2 }, 'ArrowDown')).toEqual({ hue: 0, saturation: 0 })
    expect(wheelKey({ hue: 0, saturation: 2 }, 'Tab')).toBeNull()
  })
})

describe('ringAngle', () => {
  it('zet twee knoppen links en rechts en meer gelijk verdeeld vanaf boven', () => {
    expect([0, 1].map((i) => ringAngle(i, 2))).toEqual([180, 0])
    expect([0, 1, 2].map((i) => ringAngle(i, 3))).toEqual([-90, 30, 150])
    expect([0, 1, 2, 3].map((i) => ringAngle(i, 4))).toEqual([-90, 0, 90, 180])
  })
})

describe('kleur op het scherm', () => {
  it('maakt een tint voller en donkerder met de verzadiging', () => {
    expect(tint({ hue: 330, saturation: 0 })).toBe('hsl(330 35% 72%)')
    expect(tint({ hue: 330, saturation: 100 })).toBe('hsl(330 95% 56%)')
  })

  it('noemt de tinten', () => {
    expect(hueName(0)).toBe('rood')
    expect(hueName(355)).toBe('rood')
    expect(hueName(200)).toBe('blauw')
    expect(hueName(265)).toBe('paars')
    expect(hueName(330)).toBe('roze')
  })
})
