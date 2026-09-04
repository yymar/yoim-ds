/**
 * Vertaalt de fout die Supabase in het URL-fragment achterlaat naar iets dat je
 * aan een mens kunt laten zien.
 *
 * Supabase zet zijn OAuth-fouten in een fragment (`#error=...`), en een
 * fragment gaat nooit naar de server. De route handler ziet daardoor alleen
 * "geen code" en zou elk geval als afgebroken bestempelen. Dat is precies de
 * verkeerde boodschap voor iemand zonder toegang: die gaat dan eindeloos
 * opnieuw proberen.
 */

/**
 * Ook nodig op de server: iemand die wel bij Google inlogt maar geen profiel
 * heeft, komt via /auth/afgewezen op het inlogscherm terug.
 */
export const GEEN_TOEGANG =
  'Dit Google-account heeft geen toegang. Log in met het account van Yoran of Imke.'

const MELDINGEN: Record<string, string> = {
  // Het adres staat niet op de allowlist en nieuwe aanmeldingen staan uit.
  signup_disabled: GEEN_TOEGANG,
  // Bij Google zelf geweigerd, bijvoorbeeld door op Annuleren te klikken.
  access_denied: 'Het inloggen werd bij Google afgebroken. Probeer het opnieuw.',
}

const ONBEKEND = 'Inloggen is niet gelukt. Probeer het opnieuw.'

export function meldingUitHash(hash: string): string | undefined {
  if (!hash.startsWith('#')) {
    return undefined
  }

  const parameters = new URLSearchParams(hash.slice(1))
  // `error_code` is specifieker dan `error`, dus die krijgt voorrang.
  const code = parameters.get('error_code') ?? parameters.get('error')

  if (!code) {
    return undefined
  }

  return MELDINGEN[code] ?? ONBEKEND
}
