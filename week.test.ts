import { describe, expect, it } from 'vitest'

import {
  stripLabel,
  verschuifWeken,
  weekDagen,
  weekKort,
  weeknummer,
  weekTitel,
  zaterdagVan,
} from './week'

describe('zaterdagVan', () => {
  it('laat een zaterdag staan', () => {
    // 2026-08-22 is een zaterdag.
    expect(zaterdagVan('2026-08-22')).toBe('2026-08-22')
  })

  it('gaat vanaf elke andere dag terug naar de zaterdag ervoor', () => {
    expect(zaterdagVan('2026-08-23')).toBe('2026-08-22') // zondag
    expect(zaterdagVan('2026-08-26')).toBe('2026-08-22') // woensdag
    expect(zaterdagVan('2026-08-28')).toBe('2026-08-22') // vrijdag
  })

  it('stapt netjes over een maandgrens', () => {
    expect(zaterdagVan('2026-09-02')).toBe('2026-08-29')
  })

  it('verschuift niet door zomertijd', () => {
    // In het laatste weekend van oktober gaat de klok een uur terug. Met
    // lokale tijd in plaats van UTC zou dit een dag verspringen.
    expect(zaterdagVan('2026-10-26')).toBe('2026-10-24')
  })
})

describe('weekDagen', () => {
  it('geeft zeven dagen, van zaterdag tot en met vrijdag', () => {
    const dagen = weekDagen('2026-08-22')

    expect(dagen).toHaveLength(7)
    expect(dagen.map((dag) => dag.kort)).toEqual([
      'za',
      'zo',
      'ma',
      'di',
      'wo',
      'do',
      'vr',
    ])
    expect(dagen[0].iso).toBe('2026-08-22')
    expect(dagen[6].iso).toBe('2026-08-28')
    expect(dagen[0].nummer).toBe('22')
  })
})

describe('verschuifWeken', () => {
  it('gaat een week vooruit en weer terug', () => {
    expect(verschuifWeken('2026-08-22', 1)).toBe('2026-08-29')
    expect(verschuifWeken('2026-08-22', -1)).toBe('2026-08-15')
    expect(verschuifWeken(verschuifWeken('2026-12-26', 1), -1)).toBe(
      '2026-12-26',
    )
  })

  it('stapt over de jaargrens', () => {
    expect(verschuifWeken('2026-12-26', 1)).toBe('2027-01-02')
  })
})

describe('weekTitel', () => {
  it('noemt de maand een keer als de week er binnen blijft', () => {
    expect(weekTitel('2026-08-22')).toBe('Zaterdag 22 t/m vrijdag 28 augustus')
  })

  it('noemt beide maanden als de week eroverheen loopt', () => {
    expect(weekTitel('2026-08-29')).toBe(
      'Zaterdag 29 augustus t/m vrijdag 4 september',
    )
  })
})

describe('weeknummer', () => {
  it('telt de ISO-week van de maandag in die week', () => {
    // Zaterdag 15 augustus 2026 begint een YoIm-week; de maandag erin (17
    // augustus) valt in ISO-week 34.
    expect(weeknummer('2026-08-15')).toBe(34)
    expect(weeknummer('2026-08-22')).toBe(35)
  })

  it('klopt rond de jaarwisseling', () => {
    // 1 januari 2027 is een vrijdag, dus die valt nog in de week die op
    // zaterdag 26 december begint. Die week heeft 31 december als donderdag en
    // is daarmee ISO-week 53 van 2026.
    expect(weeknummer('2026-12-26')).toBe(53)
    // De week erna is de eerste van 2027.
    expect(weeknummer('2027-01-02')).toBe(1)
  })
})

describe('stripLabel', () => {
  it('zegt "deze week" bij de week waar vandaag in valt', () => {
    expect(stripLabel('2026-08-22', '2026-08-23')).toBe(
      'za 22 t/m vr 28 aug · deze week',
    )
  })

  it('noemt alleen de datums voor een andere week', () => {
    expect(stripLabel('2026-08-15', '2026-08-23')).toBe('za 15 t/m vr 21 aug')
  })

  it('noemt beide maanden als de week eroverheen loopt', () => {
    expect(stripLabel('2026-08-29', '2026-08-23')).toBe(
      'za 29 aug t/m vr 4 sep',
    )
  })

  it('schrijft maart als mrt en niet als maa', () => {
    // 7 maart 2026 is een zaterdag.
    expect(stripLabel('2026-03-07')).toBe('za 7 t/m vr 13 mrt')
    expect(stripLabel('2026-02-28')).toBe('za 28 feb t/m vr 6 mrt')
    expect(weekKort('2026-03-07')).toContain('mrt')
  })
})

describe('weekKort', () => {
  it('past op een smalle balk', () => {
    expect(weekKort('2026-08-15')).toBe('week 34 · za 15 t/m vr 21 aug')
  })
})
