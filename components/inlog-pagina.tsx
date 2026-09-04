import type { ReactNode } from 'react'

import { GEEN_TOEGANG } from '../auth/inlog-fout'
import { gloedVan, momentVan, tijdDelen } from '../auth/moment'

import { InlogTray } from './inlog-tray'
import { Klok } from './klok'
import { Merk } from './merk'

/**
 * Fouten die de server wel ziet. De interessantere gevallen komen binnen als
 * URL-fragment en worden door `InlogTray` in de browser afgehandeld.
 */
const FOUTMELDINGEN: Record<string, string> = {
  ontbrekende_code: 'Het inloggen werd afgebroken. Probeer het opnieuw.',
  inloggen_mislukt: 'Inloggen is niet gelukt. Probeer het opnieuw.',
  geen_toegang: GEEN_TOEGANG,
}

/**
 * Het inlogscherm van elke yoim-app: de horizon die met het uur meebeweegt, de
 * klok op glas, het woordmerk en de tray met de Google-knop. Wat per app
 * verschilt (de naam boven de klok, het woordmerk, de regel eronder) komt als
 * prop; de rest is het decor en dat is overal hetzelfde.
 *
 * De app-pagina geeft `fout` uit zijn searchParams door en zet zelf
 * `generateViewport` op basis van `momentVan(tijdDelen().uur)`.
 */
export function InlogPagina({
  fout,
  host = 'yoim.nl',
  woordmerk = (
    <>
      Yo<span className="text-[var(--botergoud)]">Im</span>
    </>
  ),
  ondertitel = 'Twee telefoons, één huishouden.',
}: {
  fout?: string
  /** De kleine regel boven de klok, zoals `yoim.nl` of `energ.yoim.nl`. */
  host?: string
  /** Het woordmerk op 68px. Yoim breekt de kleur op de hoofdletter-I. */
  woordmerk?: ReactNode
  ondertitel?: string
}) {
  const melding = fout ? FOUTMELDINGEN[fout] : undefined

  // De tijd komt van de server zodat de horizon meteen goed staat en er niets
  // verspringt zodra de browser het overneemt.
  const { ms, uur } = tijdDelen()
  const moment = momentVan(uur)

  return (
    // Het thema volgt hier het uur en niet de telefoon: 's nachts is het
    // scherm donker, overdag licht. `data-thema` wordt door de tokens met
    // `:has()` naar `:root` gehaald; `color-scheme` zet daarnaast de
    // systeemonderdelen goed, zoals de schuifbalk.
    <main
      data-thema={moment.donker ? 'donker' : 'licht'}
      className="relative min-h-dvh overflow-hidden"
      style={{ colorScheme: moment.donker ? 'dark' : 'light' }}
    >
      {/* Eén vlak kleur over de volle breedte met een haarlijn eronder, plus
          één zacht laag licht waarvan de positie het uur is. De gloed staat als
          background-image op het vlak zelf; een pseudo-element of een schaduw
          zou de paint-bounds vergroten en dan smeert de blur van de klok erover
          uit. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 border-b"
        style={{
          height: `${moment.hoog}%`,
          backgroundColor: moment.lucht,
          backgroundImage: gloedVan(moment),
          borderBottomColor: moment.lijn,
          transition: 'height var(--dur-base) var(--ease)',
        }}
      />

      <div
        className="relative mx-auto h-dvh px-6"
        style={{ width: 'min(100%, calc(var(--content-narrow) + 3rem))' }}
      >
        {/* De klok kruist de horizonlijn met opzet: één glazen oppervlak dat de
            warme toon erboven en de bleke toon eronder tegelijk sampelt. */}
        <div
          className="glas sheen absolute left-6 z-10 flex flex-col gap-0.5 rounded-[var(--radius-lg)] py-3 pr-[1.125rem] pl-[1.125rem]"
          style={{ top: `calc(${moment.hoog}% - 46px)` }}
        >
          <span className="text-[11px] font-medium tracking-[0.025em] text-[var(--text-subtle)]">
            {host}
          </span>
          <Klok begin={ms} />
        </div>

        {/* Vastgezet aan de horizon: het woordmerk staat altijd even ver onder
            de haarlijn. De tray hoort bij dit blok; op de telefoon maakt
            `.postertray` hem los en zet hem onderaan, onder je duim. */}
        <div
          className="absolute inset-x-6 z-[3] flex flex-col items-start gap-3"
          style={
            {
              '--h': `${moment.hoog}%`,
              // De horizon staat tussen 20% (nacht) en 46% (middag). De klem
              // houdt het blok onder de statusbalk en boven de tray.
              top: 'clamp(96px, calc(var(--h) + 68px), calc(100% - 322px))',
            } as React.CSSProperties
          }
        >
          <Merk grootte={54} style={{ color: 'var(--olijf-diep)' }} />

          <h1 className="text-[length:var(--text-wordmark)] leading-[var(--lh-wordmark)] font-semibold tracking-[-0.035em] text-[var(--text)]">
            {woordmerk}
          </h1>
          <p className="max-w-[17rem] text-[17px] leading-[1.5] text-[var(--text-muted)]">
            {ondertitel}
          </p>

          {/* Geen omschrijving van de app, geen featurelijst: dit is de enige
              pagina die een uitgelogde vreemde kan bereiken. */}
          <InlogTray serverMelding={melding} />
        </div>
      </div>
    </main>
  )
}
