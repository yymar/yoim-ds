import { describe, expect, it } from 'vitest'

import { gloedVan, momentVan, tijdDelen } from './moment'

describe('tijdDelen', () => {
  it('rekent zomertijd om naar Amsterdam', () => {
    // 06:41:07 UTC op een vrijdag in augustus is 08:41:07 in Amsterdam.
    expect(tijdDelen(Date.parse('2026-08-21T06:41:07Z'))).toMatchObject({
      dag: 'vrijdag',
      uur: 8,
      klok: '08:41',
      seconden: ':07',
    })
  })

  it('rekent wintertijd om, ook over de datumgrens heen', () => {
    // 23:30 UTC is in januari al 00:30 de volgende dag in Amsterdam.
    expect(tijdDelen(Date.parse('2026-01-02T23:30:00Z'))).toMatchObject({
      dag: 'zaterdag',
      uur: 0,
      klok: '00:30',
    })
  })
})

describe('momentVan', () => {
  it('zet de horizon laag in de nacht en hoog midden op de dag', () => {
    expect(momentVan(3).hoog).toBeLessThan(momentVan(12).hoog)
    expect(momentVan(23).hoog).toBeLessThan(momentVan(12).hoog)
  })

  it('is alleen in de nacht donker', () => {
    // Dit is geen systeeminstelling maar een uitspraak over het uur: het
    // inlogscherm gaat hier tegen de telefoon in. Schemer telt niet mee, want
    // om half acht 's avonds is het in de zomer nog gewoon licht buiten.
    expect(momentVan(3).donker).toBe(true)
    expect(momentVan(8).donker).toBe(false)
    expect(momentVan(13).donker).toBe(false)
    expect(momentVan(19).donker).toBe(false)
    expect(momentVan(23).donker).toBe(true)
  })

  it('laat het lage licht over de dag van links naar rechts kruipen', () => {
    expect(momentVan(6).gloed).toBeLessThan(momentVan(13).gloed)
    expect(momentVan(13).gloed).toBeLessThan(momentVan(19).gloed)
  })

  it('is bij dageraad en schemer het felst en in de nacht het zwakst', () => {
    expect(momentVan(23).sterkte).toBeLessThan(momentVan(13).sterkte)
    expect(momentVan(13).sterkte).toBeLessThan(momentVan(6).sterkte)
  })

  it('geeft voor elk uur van de dag een moment', () => {
    for (let uur = 0; uur < 24; uur++) {
      expect(momentVan(uur).lucht).toMatch(/^var\(--lucht-/)
    }
  })
})

describe('gloedVan', () => {
  it('zet positie en sterkte van het moment in het verloop', () => {
    expect(gloedVan(momentVan(6))).toContain('at 12% 100%')
    expect(gloedVan(momentVan(6))).toContain('/ 0.22)')
  })
})
