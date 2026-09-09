/**
 * De week in YoIm loopt van zaterdag tot en met vrijdag. Dat is geen
 * eigenschap van een datum maar van dit huishouden: zaterdag wordt er
 * boodschappen gedaan, dus daar begint de planning.
 *
 * Alles hier werkt met kale datums als `2026-08-22`. Een datum zonder tijd
 * heeft geen tijdzone, dus het rekenen gebeurt bewust in UTC; dan kan er niets
 * verschuiven door zomertijd. Alleen "welke dag is het nu" moet wel weten waar
 * we zijn, en dat is Amsterdam.
 */

const AMSTERDAM = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Amsterdam',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const DAGEN_KORT = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']
const DAGEN_LANG = [
  'zondag',
  'maandag',
  'dinsdag',
  'woensdag',
  'donderdag',
  'vrijdag',
  'zaterdag',
]
const MAANDEN = [
  'januari',
  'februari',
  'maart',
  'april',
  'mei',
  'juni',
  'juli',
  'augustus',
  'september',
  'oktober',
  'november',
  'december',
]

/**
 * De afkortingen zoals ze in het Nederlands geschreven worden. Niet de eerste
 * drie letters: maart is "mrt" en niet "maa", en juni en juli worden juist
 * niet afgekort tot iets korters dan ze zijn.
 */
const MAANDEN_KORT = [
  'jan',
  'feb',
  'mrt',
  'apr',
  'mei',
  'jun',
  'jul',
  'aug',
  'sep',
  'okt',
  'nov',
  'dec',
]

/** en-CA levert jjjj-mm-dd, wat precies de vorm is die de database wil. */
export function vandaag(): string {
  return AMSTERDAM.format(new Date())
}

function alsDatum(iso: string): Date {
  const [jaar, maand, dag] = iso.split('-').map(Number)

  return new Date(Date.UTC(jaar, maand - 1, dag))
}

function alsIso(datum: Date): string {
  return datum.toISOString().slice(0, 10)
}

/** De zaterdag op of voor deze datum: het begin van de week waar hij in valt. */
export function zaterdagVan(iso: string): string {
  const datum = alsDatum(iso)
  // getUTCDay telt vanaf zondag (0), zaterdag is 6. Dit is het aantal dagen
  // terug naar de laatste zaterdag, en 0 als het er zelf al een is.
  const terug = (datum.getUTCDay() + 1) % 7

  datum.setUTCDate(datum.getUTCDate() - terug)

  return alsIso(datum)
}

export function verschuifWeken(zaterdag: string, weken: number): string {
  const datum = alsDatum(zaterdag)

  datum.setUTCDate(datum.getUTCDate() + weken * 7)

  return alsIso(datum)
}

export type Weekdag = {
  iso: string
  /** "za", voor op de dagkaart. */
  kort: string
  /** "zaterdag", voor de zin over wat er nog vrij is. */
  lang: string
  /** "23", het dagnummer zonder voorloopnul. */
  nummer: string
  /** "augustus", voor de kop van het dagblad. */
  maand: string
}

export function weekDagen(zaterdag: string): Weekdag[] {
  return Array.from({ length: 7 }, (_, i) => {
    const datum = alsDatum(zaterdag)

    datum.setUTCDate(datum.getUTCDate() + i)

    return {
      iso: alsIso(datum),
      kort: DAGEN_KORT[datum.getUTCDay()],
      lang: DAGEN_LANG[datum.getUTCDay()],
      nummer: String(datum.getUTCDate()),
      maand: MAANDEN[datum.getUTCMonth()],
    }
  })
}

/**
 * Het weeknummer volgens ISO 8601, zoals een Nederlandse agenda het telt: de
 * week loopt daar van maandag tot en met zondag, en week 1 is de week met de
 * eerste donderdag van het jaar erin.
 *
 * De week van YoIm loopt van zaterdag tot en met vrijdag en ligt dus over twee
 * ISO-weken heen. We nemen die van de maandag erin: vijf van de zeven dagen
 * vallen daarin, en dat is ook de week die je bedoelt als je "week 34" zegt.
 */
export function weeknummer(zaterdag: string): number {
  const datum = alsDatum(zaterdag)

  // Naar de donderdag van de ISO-week waar de maandag in valt. Via de donderdag
  // rekenen scheelt alle randgevallen rond de jaarwisseling.
  datum.setUTCDate(datum.getUTCDate() + 5)

  const eerste = new Date(Date.UTC(datum.getUTCFullYear(), 0, 4))
  eerste.setUTCDate(eerste.getUTCDate() - ((eerste.getUTCDay() + 6) % 7) + 3)

  return (
    1 + Math.round((datum.getTime() - eerste.getTime()) / (7 * 24 * 3600 * 1000))
  )
}

/** "week 34 · za 15 t/m vr 21 aug", voor de smalle plekken. */
export function weekKort(zaterdag: string): string {
  const dagen = weekDagen(zaterdag)
  const maand = MAANDEN_KORT[alsDatum(dagen[6].iso).getUTCMonth()]

  return `week ${weeknummer(zaterdag)} · za ${dagen[0].nummer} t/m vr ${dagen[6].nummer} ${maand}`
}

/**
 * Het weeklabel van de weekstrip op het receptdetail: "za 23 t/m vr 29 aug ·
 * deze week", of "za 30 aug t/m vr 5 sep" als de week over een maandgrens
 * loopt. Datums en geen weeknummer: "wk 35" zegt hun niets.
 */
export function stripLabel(zaterdag: string, vandaagIso?: string): string {
  const dagen = weekDagen(zaterdag)
  const beginMaand = MAANDEN_KORT[alsDatum(dagen[0].iso).getUTCMonth()]
  const eindMaand = MAANDEN_KORT[alsDatum(dagen[6].iso).getUTCMonth()]

  const bereik =
    beginMaand === eindMaand
      ? `za ${dagen[0].nummer} t/m vr ${dagen[6].nummer} ${eindMaand}`
      : `za ${dagen[0].nummer} ${beginMaand} t/m vr ${dagen[6].nummer} ${eindMaand}`

  return vandaagIso && zaterdagVan(vandaagIso) === zaterdag
    ? `${bereik} · deze week`
    : bereik
}

/**
 * "Zaterdag 22 t/m vrijdag 28 augustus", of met de maand er twee keer in als
 * de week over een maandgrens loopt.
 */
export function weekTitel(zaterdag: string): string {
  const dagen = weekDagen(zaterdag)
  const begin = alsDatum(dagen[0].iso)
  const eind = alsDatum(dagen[6].iso)

  const beginMaand = MAANDEN[begin.getUTCMonth()]
  const eindMaand = MAANDEN[eind.getUTCMonth()]
  const van =
    beginMaand === eindMaand
      ? dagen[0].nummer
      : `${dagen[0].nummer} ${beginMaand}`

  return `Zaterdag ${van} t/m vrijdag ${dagen[6].nummer} ${eindMaand}`
}
