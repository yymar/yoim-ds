# Prompt voor Claude Code: de andere apparaten in het ronde menu

Plak alles onder de lijn in Claude Code, in de map waar `yoim-ds` en `home.yoim` naast elkaar staan. Dit bouwt voort op `PROMPT-LAMPBEDIENING.md`: doe die eerst.

---

## Wat het oplost

De lamp heeft nu een volwaardig rond menu. De airco, de tv-hoek, de HomePod, Scooby en de bureaustekker hebben alleen aan/uit en een paar knoppen. Ze krijgen hetzelfde menu, elk met wat het apparaat kan. De droger en de P1-meter kun je alleen bekijken: die krijgen een kaartje.

## Het ontwerp

Het ontwerp staat in het Yoim Design System (https://claude.ai/artifact/4oxwZXmdhBxM56G7uRmp2B), bestand `ui_kits/home/Apparaten.html`. Per apparaat een levend exemplaar in licht en donker en daaronder elke toestand. Onderaan staan de tabellen met componenten, maten en gedrag. Die zijn leidend voor alles wat hier niet staat.

Eén patroon voor alles:
- **Boog:** het ene getal dat je versleept (temperatuur, volume, uit over), of dat je alleen ziet (batterij).
- **Midden:** aan en uit, of de hoofdactie (afspelen, starten).
- **Knoppen:** keuzes en losse acties, hooguit 8.
- **Naamkaartje:** naam, de staat in één regel, daaronder wat erbij hoort.

**Werk zoals de repo's werken:**
- Lees in elke repo eerst `CLAUDE.md`.
- Alleen tokens en glas uit `@yoim/ds`.
- Home Assistant is de enige integratielaag. Elke nieuwe service komt in de lijst `SERVICES` in `lib/ha/actions.ts`, met grenzen op de waarden.
- Elke actie is optimistisch met `predict`, en springt na 2 seconden terug met "Reageerde niet, teruggezet". Nooit een spinner.
- Code Engels, UI-tekst, comments en commits Nederlands. Geen em- of en-dashes.
- Commit lokaal, per apparaat één commit. Niet pushen en niet taggen.

**Stop na deel 1**: de tag van `@yoim/ds` zet ik zelf.

**Raad geen entiteiten.** Waar hieronder een entiteit of service nodig is die nog niet in `house.json` staat, zoek je hem op in HA. Bestaat hij niet, of doet de integratie het anders, dan stop je bij dat onderdeel en vraag je het. Bouw er niet omheen.

## Deel 1: `yoim-ds`

- **`ArcSlider` uitbreiden:**
  - `min`, `max`, `step` en `format` (waarde naar tekst, ook voor `aria-valuetext`);
  - `marker`: een tweede streepje op de boog, 16 px lang, 2,5 px dik, `--text` met een rand in `--surface-raised`;
  - `readOnly`: 6 px dik in plaats van 10, zonder duim, niet focusbaar, `role="img"` met een label;
  - `fill={false}`: het spoor zonder vulling, voor een timer die uit staat.
- **`NowPlaying`** (`now-playing.tsx`, `.speelt`): hoes van 40 px (afbeelding of icoon), titel en ondertitel, afgekapt met een ellips.
- **`PillRow`** (`pill-row.tsx`, `.pilrij`): een label van 12 px met een kleine keuze uit `.radiaal-lid` (28 px hoog). Eén keuze tegelijk, `aria-pressed`.
- **`PeekCard`** (`peek-card.tsx`, `.kijkkaart`): `.glas-dik`, minstens 200 px breed, 22 px onder de stip. Titel, een groot getal (28 px), een regel, en als kinderen eventueel een `Bar` en een link.
- **`RadialMenu`:** een tweede laag. Een knop wisselt de knoppen voor een andere set, en "terug" staat in de opening van de boog. Het kleurenwiel van de lamp gebruikt dit al: maak er één mechanisme van.

Versie, `CHANGELOG.md`, `npm test` en `npm run typecheck`, lokaal committen en stoppen.

## Deel 2: `home.yoim`, na de tag

Eerst de basis, daarna de apparaten in deze volgorde.

**Basis**
- `fromHa` neemt per soort apparaat mee wat het menu nodig heeft (zie per apparaat). Houd `HaState` plat en optioneel, zoals nu.
- `actionsFor` blijft de plek waar een apparaat en zijn staat een menu worden. Geef het een vorm die ook een boog, een kleine keuze en een tweede laag kan beschrijven, puur en met tests.
- "Niet bereikbaar" is voor elk apparaat gelijk: alles op 40%, het midden toont `WifiOff`.

### 1. Airco Cooly (`climate`)

- **Boog:** de ingestelde temperatuur, in stappen van een halve graad. De grenzen komen uit `min_temp` en `max_temp` van de entiteit.
- **Streepje:** de gemeten temperatuur (`current`).
- **Knoppen:** de modi die in `hvac_modes` staan, in deze volgorde: koelen, verwarmen, drogen, ventileren, auto. Een modus die de airco niet heeft, valt weg.
- **Kleine keuze "Ventilator":** de standen uit `fan_modes`.
- **Midden:** aan en uit. Aan betekent terug naar de laatste modus.
- **Drogen en ventileren** hebben geen temperatuur: de boog staat op 40% en is niet te verslepen.
- **Staat:** "Koelt naar 21,5° · nu 23,4°", "Verwarmt naar…", "Droogt · nu…", "Ventileert · nu…", "Auto naar…", "Uit · nu 23,4°".
- **Services:** `climate.set_temperature`, `climate.set_hvac_mode`, `climate.set_fan_mode`.
- **Gloed in de scene:** koel blauw bij koelen, warm bij verwarmen, de gewone tint bij de rest.

### 2. Tv-hoek: The Frame en Apple TV

- **Eén stip, één menu.** Maak in `house.json` een groep van `wk-tv` en `wk-appletv`, zoals de Centris. Leden: "alle", "Frame" en "Apple TV".
- **Midden:** aan en uit. Via CEC gaan ze samen.
- **Boog:** volume, 0 tot 100. Zoek uit welke entiteit het volume van de Frame echt verzet (de Frame zelf, of de Apple TV via CEC) en gebruik die. Werkt alleen harder en zachter, zeg het dan: dan worden het twee knoppen in plaats van een boog.
- **Knoppen bij "alle" en "Apple TV":** afspelen of pauzeren, dempen, afstandsbediening. Bij "Frame" alleen dempen.
- **Afstandsbediening** is de tweede laag:
  - 8 knoppen op straal 56: omhoog, rechts, omlaag, links, terug, begin, afspelen of pauzeren, dempen;
  - OK in het midden;
  - "terug" naar de gewone knoppen in de opening van de boog.
  - Dit gaat via `remote.send_command` op de remote-entiteit van de Apple TV. Zet die als veld `remote` in `house.json`.
  - Met het toetsenbord: de pijltoetsen zijn de pijlen, Enter is OK, Escape sluit de laag.
- **Nu speelt:** `NowPlaying` in het naamkaartje, met de titel en "app · speelt" of "app · pauze". De hoes alleen als dat kan zonder dat de browser bij HA komt (een serverroute die `entity_picture` doorgeeft). Anders het icoon.
- **Standby:** is de Frame `unavailable` en de Apple TV niet, dan is dat "In standby, aan via Apple TV". Het midden werkt en zet de Apple TV aan. Boog en knoppen staan op 40%. Pas als beide weg zijn is het "Niet bereikbaar".
- **Services:** `media_player.volume_set`, `volume_mute`, `media_play_pause`, `remote.send_command` met een vaste lijst commando's.

### 3. HomePod mini

- **Midden:** afspelen of pauzeren.
- **Boog:** volume.
- **Knoppen:** vorige links, volgende rechts. Speelt er niets, dan staan ze op 40%.
- **Nu speelt:** titel en artiest. Zonder muziek: "Speelt niets", zonder kaartje.
- **Services:** `media_player.media_next_track`, `media_previous_track`, en wat de tv al toevoegde.

### 4. Scooby (`vacuum`)

- **Midden:** starten, of pauzeren als hij zuigt.
- **Boog:** de batterij, `readOnly`.
- **Knoppen:** terug naar het dock (links, op 40% als hij er al staat) en kamers kiezen (rechts).
- **Kleine keuzes:** "Zuigen" (stil, normaal, sterk) en "Dweilen" (uit, licht, nat). Gebruik de standen die de Dreame-integratie echt biedt en vertaal de namen.
- **Staat:** "In het dock · laadt, 84%", "Zuigt de woonkamer · 62%", "Gepauzeerd · …", "Rijdt naar het dock · …". Zit hij vast: "Gestopt · 58%" met de melding van de robot eronder, met de stip in `--botergoud`.
- **Kamers kiezen gebeurt in de scene.**
  - Het menu sluit en de kamers van `house.json` worden tapvlakken.
  - Een gekozen kamer kleurt `--accent-soft` met een rand in `--accent`.
  - Onderaan een balk in `.glas-dik`: "Annuleer" en "Zuig 2 kamers". Zonder keuze staat er "Tik een kamer aan" en doet de knop niets.
  - Escape annuleert.
  - Elke kamer in `house.json` krijgt het segment-id van de Dreame-kaart. Zoek uit welke service de integratie heeft om segmenten te zuigen.
- **Services:** `vacuum.start`, `pause`, `return_to_base`, `set_fan_speed`, en die voor segmenten.
- De live positie in de scene blijft een eigen story op de roadmap.

### 5. Bureaustekker (`switch`)

- **Midden:** aan en uit.
- **Staat:** "Aan · 46 W". Het vermogen komt uit een eigen sensor: veld `power` in `house.json`. Zonder dat veld alleen "Aan".
- **Boog "uit over":** 0 tot 120 minuten in stappen van 5. Op 0 is het spoor leeg en zegt de waarde "blijft aan". Loopt de timer, dan loopt de boog leeg.
- **Knoppen:** 15, 30 en 60. Nog een tik op de gekozen knop zet de timer uit.
- **De timer leeft in HA, niet in de app.** Dat vraagt een timer-helper en een automatisering die de stekker uitzet. Zet de naam van de helper als veld `timer` in `house.json` en gebruik `timer.start` en `timer.cancel`. Bestaat de helper nog niet, bouw dan het menu zonder de boog en zet in `ROADMAP.md` wat er in HA bij moet.

### 6. Alleen kijken (`sensor`)

Een tik op de stip opent een `PeekCard`, geen schijf.

- **Droger:**
  - bezig: de resterende tijd groot, "Klaar om 15:07" en een balk;
  - klaar: "Klaar" met "sinds 14:32" en de stip in `--botergoud`;
  - anders: "Uit".
  - De resterende tijd is een eigen sensor: veld `remaining` in `house.json`. Zonder dat veld alleen de status.
- **P1-meter:**
  - het vermogen nu groot, bij teruglevering "820 W terug";
  - daaronder "Vandaag 6,4 kWh", met de teruglevering erbij als die er is. Veld `today` in `house.json`;
  - onderaan de link "Open energ", uit het bestaande veld `link`.

**Backlog.** Vink per apparaat de story af in `ROADMAP.md` met de commit-hash, en zet erbij wat er in HA nog met de hand moet.

## Klaar als

- [ ] Lint, typecheck, tests en build zijn groen in beide repo's.
- [ ] Airco: slepen verzet de temperatuur per halve graad, het streepje staat op de kamertemperatuur, bij ventileren is de boog niet te verslepen.
- [ ] Tv-hoek: één stip. Staat de Frame in standby, dan staat er "In standby, aan via Apple TV" en zet het midden alles aan.
- [ ] De afstandsbediening werkt met tikken en met de pijltoetsen.
- [ ] HomePod: vorige, volgende en volume werken, het kaartje volgt het nummer.
- [ ] Scooby: twee kamers aantikken en starten laat hem alleen die zuigen. De staat noemt de kamers.
- [ ] Stekker: 30 tikken zet hem na een half uur uit, ook als de browser dicht is.
- [ ] Droger en P1 openen een kaartje zonder knoppen, de link gaat naar energ.
- [ ] Trek de stekker uit een apparaat: na 2 seconden springt de waarde terug met de melding.
- [ ] Alles werkt met het toetsenbord, in licht en donker, zonder losse kleurwaarden.
- [ ] Geen em- of en-dashes.
