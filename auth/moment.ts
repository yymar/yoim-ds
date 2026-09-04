/**
 * Het moment van de dag op het inlogscherm: waar de horizon staat, welke kleur
 * de lucht heeft, waar het lage licht vandaan komt, en hoe laat het is.
 *
 * De tijd wordt altijd in Europe/Amsterdam uitgerekend, niet in de tijdzone
 * van de machine. Zo geeft de server precies hetzelfde als de browser, wat
 * hydratieverschillen scheelt, en klopt de klok ook als de functie in
 * Frankfurt in UTC draait.
 */

const OPMAAK = new Intl.DateTimeFormat('nl-NL', {
  timeZone: 'Europe/Amsterdam',
  weekday: 'long',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

/**
 * Zeven momenten, en wat de lucht in elk daarvan doet. Drie eigenschappen, en
 * alle drie een feit in plaats van versiering:
 *
 * - `hoog`    hoe ver de horizon van boven staat, in procenten van de hoogte.
 *             Laag in de nacht, het hoogst midden op de dag.
 * - `gloed`   waar langs de horizon het lage licht staat, en `sterkte` hoe
 *             fel. Dit is het op- en ondergaande deel: bij dageraad komt het
 *             licht van links en is het het helderste in de lucht, midden op
 *             de dag staat het hoog, breed en zwak, bij schemer is het naar
 *             rechts gekropen, en 's nachts blijft er een spoor over.
 * - `lijn`    de haarlijn onder het vlak. Fel bij dageraad en schemer, bijna
 *             weg in de nacht.
 *
 * Dageraad en schemer staan er met opzet als eigen moment tussen: dat zijn de
 * twee tijden van de dag die er echt uitzien als iets.
 *
 * `donker` is geen systeeminstelling maar een feit over het uur: het
 * inlogscherm is 's nachts donker, ook als de telefoon het andersom zou
 * willen. Binnen de app volgt het thema wel gewoon de telefoon.
 */
const MOMENTEN = [
  { tot: 5,  naam: 'nacht',    lucht: 'var(--lucht-nacht)',    hoog: 18, gloed: 50, sterkte: 0.05, lijn: 'var(--lucht-lijn-stil)', donker: true },
  { tot: 7,  naam: 'dageraad', lucht: 'var(--lucht-dageraad)', hoog: 28, gloed: 12, sterkte: 0.22, lijn: 'var(--lucht-lijn-fel)',  donker: false },
  { tot: 10, naam: 'ochtend',  lucht: 'var(--lucht-ochtend)',  hoog: 40, gloed: 26, sterkte: 0.14, lijn: 'var(--lucht-lijn)',      donker: false },
  { tot: 17, naam: 'middag',   lucht: 'var(--lucht-middag)',   hoog: 46, gloed: 62, sterkte: 0.09, lijn: 'var(--lucht-lijn)',      donker: false },
  { tot: 20, naam: 'schemer',  lucht: 'var(--lucht-schemer)',  hoog: 30, gloed: 88, sterkte: 0.24, lijn: 'var(--lucht-lijn-fel)',  donker: false },
  { tot: 22, naam: 'avond',    lucht: 'var(--lucht-avond)',    hoog: 24, gloed: 82, sterkte: 0.12, lijn: 'var(--lucht-lijn)',      donker: false },
  { tot: 24, naam: 'nacht',    lucht: 'var(--lucht-nacht)',    hoog: 20, gloed: 50, sterkte: 0.05, lijn: 'var(--lucht-lijn-stil)', donker: true },
] as const

export type Moment = (typeof MOMENTEN)[number]

export function momentVan(uur: number): Moment {
  return MOMENTEN.find((moment) => uur < moment.tot) ?? MOMENTEN[0]
}

/**
 * De gloed hoort als background-image op het vlak zelf, nooit als
 * pseudo-element en nooit als schaduw: een oppervlak naast chrome met
 * backdrop-filter mag zijn paint-bounds niet vergroten, anders smeert de
 * geblurde achtergrond eroverheen.
 */
export function gloedVan(moment: Moment): string {
  return `radial-gradient(90% 130% at ${moment.gloed}% 100%, rgb(var(--lucht-gloed) / ${moment.sterkte}), rgb(var(--lucht-gloed) / 0) 70%)`
}

/**
 * Zonder argument leest deze functie zelf de klok. Dat hoort hier en niet in
 * een component: `Date.now()` tijdens het renderen is onzuiver, en de
 * React-regels fluiten daar terecht voor.
 */
export function tijdDelen(ms: number = Date.now()) {
  const deel = Object.fromEntries(
    OPMAAK.formatToParts(ms).map(({ type, value }) => [type, value]),
  )

  return {
    ms,
    dag: deel.weekday,
    uur: Number(deel.hour),
    klok: `${deel.hour}:${deel.minute}`,
    seconden: `:${deel.second}`,
  }
}
