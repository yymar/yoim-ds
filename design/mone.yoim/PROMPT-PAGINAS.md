# Prompt voor Claude Code: pagina's van mone.yoim bouwen

Plak alles onder de lijn in Claude Code, in de repo van mone.yoim.

---

De Spendee-data staat erin. Bouw nu de pagina's. Het ontwerp staat in het design system, map `mone.yoim/`. **De HTML-bestanden daar zijn de bron van de waarheid**: lees ze voor maten, volgorde en copy. Deze prompt vertelt wat af is, wat de keuzes zijn en waarom.

Lees eerst:
- `PROMPT-CLAUDE-CODE.md`: de onderdelen die in `@yoim/ds` v0.4 komen (Navigatie, StatusRegel, Bar, heatmap, categoriekleuren). Bouw die eerst, of gebruik ze als ze er al zijn.
- `CONTEXT-BUDGETTEN.md`: de logica van budgetten (vaste last tegen potje, netto, toestanden). Niet opnieuw bedenken.

## Wat af is

**Telefoon: afgerond, bouw zoals getekend.**
- `Transacties telefoon.html`
- `Budgetten telefoon.html`, `Budgetten leeg telefoon.html`
- `Budget detail telefoon.html`
- `Budget sheet telefoon.html`
- `Profiel telefoon.html`

**Desktop: de structuur ligt vast, de details worden nog nagelopen.** Bouw de layout (zijbalk, kolommen, wat waar staat), maar verwacht nog kleine wijzigingen in spacing en copy.

**Inzicht: lage prio.** Het mozaïek werkt; de weergave per dag klopt nog niet. Bouw als laatste.

## Navigatie en startpagina

- Drie routes: **Transacties · Budgetten · Inzicht**. Rekeningen staan in Profiel, dat je via de avatar opent.
- Telefoon: zwevende tabbalk onderaan, avatar rechts in de paginakop. Desktop: zijbalk.
- **Startpagina per gebruiker**, instelbaar in Profiel ("Waar opent mone.yoim voor jou?"). Standaard Transacties; Imke kiest Budgetten. Sla het op per account, niet per apparaat.
- Het aantal transacties dat nog nagekeken moet worden staat als badge op de route Transacties.

## Transacties

- **Sticky kop**: de kern blijft staan als je scrolt, met het banklogo van de rekening.
- **Nakijken**: de app doet een beste gok voor de categorie, de gebruiker bevestigt. Eén kaart tegelijk.
  - Telefoon: vegen (Klopt / Andere), geen knoppen.
  - Desktop: knoppen "Klopt" en "Andere"; vegen met de muis staat uit.
  - "Andere" opent de categoriekiezer.
  - Alles nagekeken: het blok verdwijnt helemaal tot er nieuwe zijn. Geen lege staat, geen "alles klaar".
- **Lijst per dag**: elke dag is een eigen card. Datum en dagtotaal staan boven de card, niet erin. Geen scheidingslijnen tussen rijen.
- Inkomsten en terugbetalingen (alles wat de balans verhoogt) in `--success`.
- **Banklogo**: plaatshouder met `data-bank-logo="SNS"` enzovoort; wordt later het echte logo.

## Melding bankkoppeling

Geen vaste staat van de pagina. Hij verschijnt alleen als een PSD2-koppeling bijna verloopt of verlopen is.
- Zwevende capsule bovenaan, over de inhoud; duwt de pagina niet naar beneden. Telefoon: onder de kop, over de volle breedte.
- Inhoud: waarschuwingsicoon in `--botergoud`, korte tekst ("SNS verloopt over 6 dagen"), knop **Vernieuwen** met verversicoon, kruisje **Later**.
- **Vernieuwen opent direct de toestemmingspagina van de bank**, niet Profiel. Terug in de app: korte bevestiging "Koppeling SNS verlengd tot …", melding weg. Mislukt of afgebroken: melding blijft, met "Niet gelukt, probeer opnieuw".
- **Later**: capsule weg tot de volgende sessie. Er blijft wel een "!" in `--botergoud` op de avatar staan, op elke pagina op dezelfde plek, tot het opgelost is.
- Op de pagina's Profiel en Budget-sheet staat geen capsule. Profiel toont de waarschuwing in de rij van de rekening, met hetzelfde verversicoon en hetzelfde gedrag.

## Budgetten

Zie `CONTEXT-BUDGETTEN.md` voor de logica. Voor de pagina's:
- **Overzicht**: geen samenvattingscard bovenaan; Imke gebruikt die niet. Groepen Vaste lasten en Potjes, elk een eigen card met kopje erboven.
- **Detail**: de details groot bovenaan, vergelijking met de vorige periode, de nieuwste 5 transacties, daarna "Alle 20 transacties" (opent Transacties gefilterd). De pagina blijft kort, ook bij veel transacties.
- **Sheet (maken en wijzigen)**: de gebruiker kiest zelf de soort, de app gokt niet. Geen spaarpot-optie (een potje is bij Imke altijd een spaarpot). Categorieën: één rij met "+ Categorie"; die klapt open tot een lijst in het veld zelf (zoeken, meerdere kiezen, Klaar) en is alleen zo hoog als nodig. De subtitel volgt live de keuzes.
- **Leeg** (Yoran): één zin en een stille knop "Budget instellen".
- Restbedrag meenemen naar de volgende maand: **niet bouwen**; elke periode begint opnieuw. Nog navragen bij Imke.

## Profiel

- Startpagina-keuze (zie boven).
- Rekeningen compact: banklogo's naast elkaar met een korte regel eronder, niet één grote rij per rekening.
- Per rekening de schakelaar **Gedeeld**: de partner ziet de transacties. In haar budgetten telt een gedeelde rekening alleen mee als zij dat per budget aanzet.
- Geen "huishouden"-tekst en geen uitleg als "Imke opent op Budgetten".

## Stijl die overal geldt

- Groepen zijn cards met het kopje erboven, niet erin. Geen scheidingslijnen tussen rijen.
- Rood (`--danger`) alleen voor een potje dat over budget is. Botergoud alleen voor afwijkingen en waarschuwingen.
- Hover alleen op desktop (`(hover: hover) and (pointer: fine)`); op de telefoon wordt hover een tik.
- Tikvlakken minimaal 48px. Geen em-dashes en geen en-dashes in microcopy.
- Licht en donker via de tokens, nooit hex in componenten.

## Volgorde

1. Navigatie, startpagina-instelling en de avatar met "!".
2. Transacties (lijst, sticky kop, nakijken).
3. Budgetten: overzicht, detail, sheet, leeg.
4. Profiel: rekeningen, Gedeeld, startpagina.
5. Melding bankkoppeling en de Vernieuwen-flow.
6. Inzicht.

Vraag het als iets in de HTML en deze prompt elkaar tegenspreekt; de HTML wint, behalve bij de logica in `CONTEXT-BUDGETTEN.md`.
