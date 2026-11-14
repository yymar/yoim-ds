# Prompt voor Claude Code: lampbediening in het ronde menu

Plak alles onder de lijn in Claude Code, in de map waar `yoim-ds` en `home.yoim` naast elkaar staan.

---

## Wat het oplost

Het ronde menu in home.yoim kan een lamp nu aan en uit zetten, op 25, 50 of 100% en op warm of koel wit. Het moet alles kunnen wat een lamp kan: helderheid traploos, wit van warm naar koel, en kleur. En alleen dat: een filamentlamp krijgt geen witkeuze, een spot geen kleur.

## Het ontwerp

Het ontwerp staat in het Yoim Design System (https://claude.ai/artifact/4oxwZXmdhBxM56G7uRmp2B), bestand `ui_kits/home/Lampbediening.html`. Bovenaan staat een levend exemplaar in licht en donker, daaronder elke toestand, de stip, en de tabellen met maten, tokens, beweging, gedrag en toetsenbord. Die tabellen zijn leidend voor alles wat hier niet staat.

In het kort:
- **Boog:** helderheid, 270° rond de schijf, de opening onderaan.
- **Stalen:** vaste witten en kleuren in een ring rond het midden.
- **Palet:** de laatste staal opent het kleurenwiel op de plek van de stalen. De boog blijft staan.
- **Slepen:** het midden wordt de waarde, groot. De rest dimt.

**Werk zoals de repo's werken:**
- Lees in elke repo eerst `CLAUDE.md`.
- Alleen tokens en glas uit `@yoim/ds`. Geen buitenschaduw op glas, alleen standaard `backdrop-filter`.
- Code Engels, UI-tekst, comments en commits Nederlands. Geen em- of en-dashes.
- Commit lokaal. Niet pushen en niet taggen.

Het werk heeft twee delen. **Stop na deel 1**: home.yoim pint een tag van `@yoim/ds`, en die tag zet ik zelf.

## Deel 1: `yoim-ds`

Vijf componenten in `components/`, met hun CSS in een nieuw `styles/radiaal.css`. Zet het ontwerp in `design/home.yoim/` met een README, zoals `design/mone.yoim/`.

| Component | Bestand | Klasse | Wat |
|---|---|---|---|
| `RadialMenu` | `radial-menu.tsx` | `.radiaal` | Schijf, midden, naamkaartje, leden. Verhuist uit `../home.yoim/components/scene/radial-menu.tsx` en `app/globals.css`. |
| `ArcSlider` | `arc-slider.tsx` | `.boog` | De helderheidsboog met duim. |
| `Swatch` | `swatch.tsx` | `.staal` | Een kleurvlak in een `.radiaal-knop`. |
| `ColorWheel` | `color-wheel.tsx` | `.kleurwiel` | Tint rond, verzadiging van midden naar rand. |
| `Hotspot` | `hotspot.tsx` | `.hotspot` | De stip. Verhuist ongewijzigd uit home.yoim. |

**De componenten weten niets van Home Assistant.** Ze krijgen waarden en geven waarden terug.
- `ArcSlider`: `value` (1 tot 100), `onChange` tijdens het slepen, `onCommit` bij loslaten, `ghost` (de waarde waar het spook staat, of niets), `disabled`.
- `ColorWheel`: `hue` (0 tot 360), `saturation` (0 tot 100), dezelfde drie.
- `Swatch`: `color` (CSS-kleur), `selected`, `label`, `onSelect`.
- `RadialMenu`: `children` voor wat er op de schijf staat, zodat home.yoim later ook een thermostaat of een stekker kan vullen. Naam, staat, melding en leden zijn props.

**Maten**
- Schijf 224 px (was 176).
- Boog: straal 96, dikte 10, van 135° tot 405°, raakvlak 34 breed.
- Duim: 24 px met een raakvlak van 48 px.
- Stalen en knoppen: 40 px op straal 60, hooguit 8.
- Midden: 60 px.
- Kleurenwiel: 164 px, verzadiging van straal 34 tot 74.
- Waarde tijdens slepen: cirkel van 76 px op het midden, cijfers 22 px, een woord 15 px.
- "Terug" bij het wiel: een knop van 40 px in de opening van de boog, op 90°.

**Slepen moet licht zijn (120 Hz)**
- Pointer events met `setPointerCapture`; `touch-action: none` op de boog en het wiel.
- Tijdens het slepen geen React-render per frame: zet de hoek als CSS-variabele op het element in een `requestAnimationFrame` en roep `onChange` daar ook aan.
- Alleen `transform` en `opacity` veranderen. Geen transitie op duim of vulling tijdens het slepen, en niets aan `backdrop-filter`.
- De rest van het menu dimt naar opacity .28 in `--dur-fast`.

**Toetsenbord en schermlezer**
- Boog en wiel zijn `role="slider"` met `aria-valuetext` ("64%", "paars").
- Pijlen op de boog: 5% per stap.
- Pijlen op het wiel: links en rechts tint (10°), omhoog en omlaag verzadiging (5%).
- Escape sluit eerst het wiel, daarna het menu.
- Focus met `--ring-focus`.

**Pure logica in `lib/` met tests**
- Hoek naar waarde en terug voor de boog, met de dode hoek onderaan: links van het midden klemt naar 1, rechts naar 100.
- Punt naar tint en verzadiging voor het wiel, en terug.

**Versie.** Dit is 0.9.0. Zet in `CHANGELOG.md` een blok "Let op bij het bijwerken": home.yoim haalt zijn eigen `.radiaal`- en `.hotspot`-regels weg en importeert `styles/radiaal.css`.

Draai `npm test` en `npm run typecheck`, commit lokaal en stop. Zeg dat je klaar bent voor de tag.

## Deel 2: `home.yoim`, na de tag

**Bijwerken**
- Pin `@yoim/ds` op de nieuwe tag.
- Haal `.radiaal*`, `.hotspot*` en hun keyframes uit `app/globals.css` en importeer `@yoim/ds/styles/radiaal.css`.
- `components/scene/radial-menu.tsx` wordt de dunne laag die een apparaat vertaalt naar wat er op de schijf staat.

**Wat een lamp kan, puur in `lib/ha/`**

Een functie `capability(s)` op basis van `s.modes` (uit `supported_color_modes`):
- `'color'`: een van `hs`, `xy`, `rgb`, `rgbw`, `rgbww`.
- `'white'`: `color_temp`, zonder kleur.
- `'brightness'`: de rest.

Voor een groep geldt het minste van alle leden. Kies je in het menu één lamp, dan geldt wat die lamp kan.

Het witbereik komt uit `min_color_temp_kelvin` en `max_color_temp_kelvin` van de lamp, niet uit een vaste 2000 tot 6500. Neem die twee mee in `fromHa`.

**Wat er op de schijf staat**
- `'brightness'`: de boog en de knoppen 25, 50 en 100.
- `'white'`: de boog en vijf witte stalen: 2200, 2700, 3500, 4500 en 6500 K, geklemd op het bereik van de lamp.
- `'color'`: de boog, vier witten (2200, 2700, 4000, 6500 K), drie kleuren (roze 330°, paars 265°, blauw 200°) en het palet. Staat de lamp op een kleur die geen staal is, dan toont het palet die kleur en is het gekozen.

**Acties in `lib/ha/actions.ts`**

Naast de bestaande vaste acties komen er drie die een waarde meekrijgen. Elk met `call` en `predict`, zoals de rest:
- helderheid: `light.turn_on` met `brightness_pct`, voorspelt `brightness` en aan;
- wit: `light.turn_on` met `color_temp_kelvin`, voorspelt `kelvin`;
- kleur: `light.turn_on` met `hs_color`, voorspelt `rgb`.

Laat `checked()` deze drie ook toe, met grenzen op de waarden. Slepen of een staal kiezen op een lamp die uit staat, zet hem aan.

**Optimistisch, zoals het al werkt**
- Tijdens het slepen volgt de scene elke stap via `intend`. De gloed van de lamp en de stip bewegen mee.
- Naar HA gaat tijdens het slepen hooguit elke 100 ms een oproep, en bij loslaten altijd de laatste waarde. De termijn van 2 seconden (`CONFIRM_MS`) loopt vanaf de laatste oproep.
- Blijft de bevestiging uit, dan springt de waarde terug naar wat HA het laatst bevestigde. De boog of het wiel krijgt `ghost` op de waarde die je vroeg, en onder de naam staat 3 seconden "Reageerde niet, teruggezet" met een stip in `--botergoud`.
- Nooit een spinner. `data-pending` op de stip blijft zoals het is.
- `satisfies` telt kleur nu niet mee. Laat dat zo: een kleuractie is bevestigd zodra de lamp aan is en HA een stand meldt.

**Niet bereikbaar.** Alles op 40% en niet te bedienen, het midden toont `WifiOff`, de staat is "Niet bereikbaar".

**Scènes.** Niet bouwen. De opening van de boog onderaan blijft vrij, daar komen ze later.

**Backlog.** Vink de story af in `ROADMAP.md` met de commit-hash erachter.

## Klaar als

- [ ] `npm run lint`, `npx tsc --noEmit`, `npm test` en `npm run build` zijn groen in home.yoim; `npm test` en `npm run typecheck` in yoim-ds.
- [ ] Filament eettafel toont alleen de boog en 25, 50, 100. Een spot toont witten, geen kleur. Een Hue toont alles.
- [ ] De eettafelgroep (filament en spots samen) toont als geheel alleen helderheid. Kies je een spot, dan komen de witten erbij.
- [ ] Slepen over de boog op een telefoon van 120 Hz hapert niet, en de lamp in de scene gloeit mee.
- [ ] Trek de stekker uit een lamp en sleep: na 2 seconden springt de boog terug, het spook staat waar je was, de melding verschijnt en verdwijnt.
- [ ] Alles werkt met alleen het toetsenbord, met zichtbare focus.
- [ ] Licht en donker kloppen allebei, zonder losse kleurwaarden buiten de kleur van de lamp zelf.
- [ ] Geen em- of en-dashes.
