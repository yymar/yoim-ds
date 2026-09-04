'use client'

import { useSyncExternalStore } from 'react'

import { meldingUitHash } from '../auth/inlog-fout'

import { GoogleKnop } from './google-knop'

function abonneer(bijWijziging: () => void) {
  window.addEventListener('hashchange', bijWijziging)

  return () => {
    window.removeEventListener('hashchange', bijWijziging)
  }
}

function huidigeHash() {
  return window.location.hash
}

function hashOpDeServer() {
  return ''
}

// De twee namen staan in de melding op volle sterkte; de rest is gedempt.
const HUISGENOTEN = /(Yoran|Imke)/

function metNamen(melding: string) {
  return melding
    .split(HUISGENOTEN)
    .map((deel, i) =>
      HUISGENOTEN.test(deel) ? (
        <b key={i} className="font-medium text-[var(--text)]">
          {deel}
        </b>
      ) : (
        deel
      ),
    )
}

/**
 * De tray onderaan het inlogscherm: waarom het niet lukte, en de knop.
 *
 * De tray is glas, de knop erin niet. Concentrisch: 34px radius met 8px
 * padding, dus de knop van 52px komt op 26 uit en dat is precies een capsule.
 *
 * Melding en knop horen bij elkaar omdat de knop na een afwijzing "Opnieuw
 * inloggen" moet zeggen. De interessantste fouten staan in het URL-fragment,
 * en dat komt nooit bij de server aan; vandaar dat dit stukje in de browser
 * draait.
 */
export function InlogTray({ serverMelding }: { serverMelding?: string }) {
  // useSyncExternalStore in plaats van useEffect: het fragment is een bron
  // buiten React, en dit geeft bij het renderen op de server netjes een lege
  // waarde zonder hydratieverschil.
  const hash = useSyncExternalStore(abonneer, huidigeHash, hashOpDeServer)

  const melding = meldingUitHash(hash) ?? serverMelding

  return (
    <div className="postertray glas sheen z-10 flex flex-col gap-2.5 rounded-[var(--radius-tray)] p-2">
      {melding && (
        // Als tekst in de tray, niet als eigen kaartje. Een gevuld, omrand
        // vlak in een omrande glazen tray die ook al een omrande knop draagt,
        // stapelt drie bijna gelijke afgeronde contouren, en dan lijst het glas
        // een kaart in plaats van de melding te dragen. Eén doos, één radius.
        //
        // Geen rood en geen icoon: er wordt iemand vriendelijk weggestuurd van
        // de stoep van een prive huis, dat is een stille mededeling.
        <p
          role="alert"
          className="mx-2.5 mt-2 text-[15px] leading-[1.45] text-[var(--text-muted)]"
        >
          {metNamen(melding)}
        </p>
      )}
      <GoogleKnop label={melding ? 'Opnieuw inloggen' : undefined} />
    </div>
  )
}
