import { describe, expect, it } from 'vitest'

import { meldingUitHash } from './inlog-fout'

// Dit is letterlijk het fragment dat Supabase teruggaf toen er met een account
// buiten de allowlist werd ingelogd.
const GEWEIGERD =
  '#error=access_denied&error_code=signup_disabled&error_description=Signups+not+allowed+for+this+instance'

describe('meldingUitHash', () => {
  it('zegt bij een geweigerd account dat opnieuw proberen niet helpt', () => {
    const melding = meldingUitHash(GEWEIGERD)

    expect(melding).toContain('geen toegang')
    expect(melding).not.toContain('Probeer het opnieuw')
  })

  it('laat error_code voorgaan op het algemenere error', () => {
    // Beide staan in het fragment; `access_denied` alleen zou "afgebroken"
    // opleveren, en dat is hier juist de verkeerde uitleg.
    expect(meldingUitHash(GEWEIGERD)).not.toBe(
      meldingUitHash('#error=access_denied'),
    )
  })

  it('zegt bij afbreken bij Google wel dat je opnieuw kunt proberen', () => {
    expect(meldingUitHash('#error=access_denied')).toContain(
      'Probeer het opnieuw',
    )
  })

  it('valt terug op een algemene melding bij een onbekende code', () => {
    expect(meldingUitHash('#error_code=iets_nieuws')).toBe(
      'Inloggen is niet gelukt. Probeer het opnieuw.',
    )
  })

  it('geeft niets terug als er geen fout in de hash staat', () => {
    expect(meldingUitHash('')).toBeUndefined()
    expect(meldingUitHash('#')).toBeUndefined()
    expect(meldingUitHash('#access_token=abc&token_type=bearer')).toBeUndefined()
    expect(meldingUitHash('?error=access_denied')).toBeUndefined()
  })
})
