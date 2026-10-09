# Changelog

## Unreleased

- De focusring volgt de ronding van een `.kaart`: het eerste en laatste kind van een
  kaart (en de summary van een dichte `<details class="kaart">`) krijgt de
  binnenradius van de kaart. Voorheen tekende de ring een harde rechthoek met
  hoeken buiten de ronding, bijvoorbeeld op de kop van een uitklapkaart.

## 0.4.3

- `color-scheme` volgt het thema, op dezelfde gevallen als de tokens (systeem,
  `data-thema` op `<html>`, of een scherm dat het thema zelf zet). Daardoor
  blijven de scrollbalken, keuzelijsten en de tijdkiezer van het systeem niet
  meer licht in het donker.
- Dunne scrollbalken in het thema (`styles/glas.css`): zonder pijltjes, met een
  doorzichtig spoor en een duim in de tekstkleur. Nieuwe tokens
  `--scrollbar-duim` en `--scrollbar-duim-hover`.
- Nieuwe klasse `.scroll-hoeken` voor een scrollcontainer tegen afgeronde
  hoeken: het spoor houdt `--scroll-hoek` (standaard `--radius-lg`) vrij aan
  boven- en onderkant.

Apps hoeven niets te veranderen. Een eigen `color-scheme` of scrollbarblok in
een app kan weg; een app-specifieke regel zoals `.kaartvlak` wordt
`.scroll-hoeken` op het element.

## 0.4.2

- `Navigation` kan Systeem als derde keuze tonen: geef `system` mee, dan wordt
  Weergave drie icoontjes (zon, maan, scherm, 16px) en is `theme` wat iemand
  koos, ook `systeem`. Met een muis noemt een tooltip na 400ms de naam, bij
  een gekozen Systeem met wat het nu volgt (", nu licht" of ", nu donker"),
  live uit `prefers-color-scheme`. Pijltjes lopen rond door de keuzes.
- Zonder `system` blijft het zoals het was: Licht en Donker met tekst. De
  radiogroep heet nu wel "Weergave" in plaats van "Thema", en elke knop heeft
  een `aria-label`.
- Nieuw in `@yoim/ds/thema`: `themeTip`, en `subscribeDark` met `DARK` (de
  wissel van `prefers-color-scheme`, zoals Navigation hem volgt).

## 0.4.1

- De sessie-proxy controleert het token met `getClaims` in plaats van
  `getUser`. Het yoim-project tekent met ES256, dus dat gebeurt lokaal en
  scheelt bij elke request een ronde naar Supabase Auth. Het token wordt nog
  steeds ververst.

## 0.4.0

Wat mone.yoim.nl nodig heeft.

- Tokens: `--cat-red` krijgt een eigen tint (was gelijk aan `--danger`), nieuw zijn
  `--cat-teal`, `--cat-olijf`, `--heat-0` tot en met `--heat-3`, `--heat-3-fg` en
  `--danger-soft`, in licht en donker.
- Nieuw: `Navigation` (capsule op de telefoon, rail vanaf 745px, merk als slot),
  `StatusLine`, `Bar`, `DonutList`, `Amount`. Vanaf 745px schuift de body
  zelf opzij voor de rail. Thema, account en uitloggen zijn optioneel; met
  alleen `href`-routes kan `Navigation` direct vanuit een servercomponent.
- Nieuw: `@yoim/ds/money` met `formatAmount`, `barState` en `heatLevel`.
- `LeegStaat` staat nu in het pakket, met een optionele prop `icon`.
- `lucide-react` is een peer dependency.

Let op bij het bijwerken: `--cat-red` is geen signaalkleur meer. Volgorde:
mone stapt meteen over; weekl pint 0.4.0 in een commit waarin zijn zes
foutvlakken naar `--danger` en `--danger-soft` gaan; energ idem voor `--cat-red`
als "duur" of "slecht". Tot dan blijven die twee op 0.3.2. weekl houdt
voorlopig zijn eigen navigatie: inklappen bij scrollen zit nog niet in
`Navigation`.
