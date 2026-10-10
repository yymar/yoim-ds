# Changelog

## 0.5.2

- Nieuw: `--botergoud-tekst`, botergoud als tekstkleur, voor het bedrag van de
  vergoeding. In donker is het `--botergoud` (#d9b458); in licht
  `color-mix(in oklab, var(--botergoud) 62%, #000)` (#644b0b). Het ruwe goud haalt
  in licht maar 2,6:1 op de kaart. Contrast van de nieuwe tekstkleur: 8,2:1 op
  `--surface-raised` (#fff), 7,6:1 op `--surface` en 7,0:1 op `--botergoud-soft`;
  in donker 8,3:1 op `--surface-raised` en 9,3:1 op `--surface`.
- Niet in dit pakket: `AutoPodium`, `LaadGeschiedenis`, `LaadKosten`,
  `LaadMomenten` en het potje zijn componenten van `../energ.yoim`, niet van
  `@yoim/ds`. Een breedtegrens op de laag van het podium en een prop `kop` voor
  hun titel horen daar.

Niet breaking, geen actie nodig: een app die `--botergoud-tekst` wil gebruiken
vervangt `text-[var(--botergoud)]` voor een bedrag door
`text-[var(--botergoud-tekst)]`.

## 0.5.1

- Nieuw: `.groepkop`, de titel boven een kaart: 13px semibold in
  `--text-muted`, als zin, met een waarde of actie rechts op dezelfde basislijn.
  De regel: een kaart heeft zijn titel erboven en nooit erin. `.kop` is alleen
  nog een wegwijzer binnen een kaart, naast een getal.
- Twee soorten kaart: een lijstkaart is een kale `.kaart` met `.rij`-kinderen,
  een inhoudkaart is `.kaart p-5`, op elke breedte.
- Nieuw: `.veldtekst` (token `--text-veld`) voor de tekst in invoervelden:
  16px op een aanraakscherm, 15px vanaf `(pointer: fine)`. Safari op iPhone
  zoomt in op een veld onder 16px en zoomt niet terug. Gekoppeld aan de
  pointer, niet aan een breedte: een iPad in een breed venster is nog steeds
  touch.

Let op bij het bijwerken (niet breaking, wel per app):

- `.kop` als titel van een kaart of groep wordt `.groepkop` boven de kaart.
- `p-1.5`, `p-3` en `p-4` op `.kaart` vervallen. Een lijstkaart heeft
  `.rij`-kinderen zonder padding, een inhoudkaart heeft `p-5`.
- Elk veld krijgt `.veldtekst` in plaats van een eigen maat (`text-sm`,
  `text-[15px]`, of `text-base pointer-fine:text-[15px]` zoals in mone). Ook
  `<select>` en contenteditable, en de kale velden in een `.capsuleveld` (het
  zoekveld en de invoerbalk). Een placeholder krijgt geen eigen kleinere maat.

## 0.5.0

- `Navigation` zweeft op desktop. Vanaf `--bp-breed` is er geen rail van 15rem
  meer, maar twee glazen capsules in de bovenhoeken die geen kolom kosten. Links
  het merk (een link naar de eerste route) en de routes als iconen; de huidige
  route houdt altijd zijn label. Met de muis op het merk klappen alle labels
  uit, ze sluiten 300ms na het verlaten van de capsule of met Escape. Een los
  icoon noemt na 400ms zijn naam in een tooltip eronder. Toetsenbordfocus klapt
  ook uit; op touch zet een tik op het merk de labels open of dicht, en zijn de
  vlakken 44px. Past de uitgeklapte capsule niet naast de rechter, dan wijkt de
  rechter zolang de labels open zijn.
- Rechts: één themaknop die doorschuift (licht, donker, systeem), een slotknop
  als de app `onLock` meegeeft, en de avatar als link naar `account.href`.
- De telefoon is ongewijzigd: de capsule onderaan, met dezelfde klassen.
- Nieuw: `ThemeChoice`, de radiogroep van Weergave, voor de accountsheet op de
  telefoon. Op desktop staat hij niet meer in de navigatie.
- Nieuw in `@yoim/ds/thema`: `nextTheme`, en `themeTip` kan met een vierde
  argument zeggen waar een klik heen gaat ("Licht. Klik voor donker").
- Nieuwe token `--nav-boven` (5.5rem, op touch 5.75rem): de ruimte boven het
  eerste vlak vanaf `--bp-breed`.
- De focusring volgt de ronding van een `.kaart`: het eerste en laatste kind van een
  kaart (en de summary van een dichte `<details class="kaart">`) krijgt de
  binnenradius van de kaart. Voorheen tekende de ring een harde rechthoek met
  hoeken buiten de ronding, bijvoorbeeld op de kop van een uitklapkaart.

Let op bij het bijwerken:

- `--rail-b` en `--rail-nu` zijn weg. Elke `left-[var(--rail-b)]` of
  `calc(... var(--rail-b) ...)` in een app wordt `0`, of `20px` voor iets dat
  naast de capsules moet hangen.
- `body` schuift niet meer opzij en `.vastekop` begint weer links. Een app die
  `.schermkolom` gebruikt, centreert weer over de volle breedte.
- Geef het eerste vlak vanaf `--bp-breed` `padding-top: var(--nav-boven)` en laat
  daar de paginatitel weg: de capsule zegt al waar je bent. Op de telefoon blijft
  de grote titel.
- `account.href` is verplicht als je `account` meegeeft. `onSignOut` doet niets
  meer en geeft een waarschuwing; uitloggen hoort op de profielpagina. Hij
  verdwijnt in de volgende versie.
- `.nav-foot` bestaat niet meer. CSS in een app die erop leunt, kan weg.

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
