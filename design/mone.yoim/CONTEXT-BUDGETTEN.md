# Context voor Claude Code: budgetten in mone.yoim

Plak alles onder de lijn in je Claude Code-sessie.

---

De Spendee-data staat erin. Bouw de budgetten vanuit de vragen die Imke stelt, niet vanuit Spendee. Het ontwerp staat in het design system, map `mone.yoim/`:

- `Budgetten desktop.html` / `Budgetten telefoon.html`: overzicht
- `Budget detail desktop.html` / `telefoon.html`: potje (Onvoorzien), vaste last (Maandlasten), druk potje (Boodschappen)
- `Budget sheet desktop.html` / `telefoon.html`: maken, wijzigen, categorie kiezen (klikbaar)
- `Budgetten leeg desktop.html` / `telefoon.html`: gebruiker zonder budgetten

## Twee soorten, de gebruiker kiest zelf

Bij het maken kiest de gebruiker "Vaste last" of "Potje". Geen voorstel, geen gok: wie een budget maakt, weet waarvoor.

### Vaste last
Vast bedrag op een vast moment (woonlasten, maandlasten, auto).
- Rij: rechts wat nog moet komen, eronder "van € 235,67". Balk in de categoriekleur.
- Helemaal binnen: rechts € 0,00 in grijs, links "Betaald" met groen vinkje. Nooit rood, nooit "op".
- Nog niet alles binnen: "Nog 1 · rond 14 okt".
- Afwijking (hoger dan vorige keer, of te laat): alleen in de afschrijvingsrij in het detail, in botergoud met alert-icoon ("€ 7,50 hoger dan vorige keer"). Kopje: "3 van 4 binnen · 1 afwijking".

### Potje
Plafond voor variabele uitgaven. Bij Imke staat een potje altijd op een spaarpot; er is geen aparte spaarpot-optie.
- Rij: rechts wat nog in het potje zit, links "€ 28,27 uitgegeven", rechts "van € 52,54".
- Toestanden, `x = netto / bedrag`:
  - rustig (`x < 1`): tekstkleur, balk `--accent`
  - precies op (`x == 1`): bedrag grijs, "Helemaal besteed", balk `--border`. Dat is binnen, geen rood.
  - over (`x > 1`): het enige rood (`--danger`): bedrag, statusregel ("€ 12,30 over budget") en balk.
- Geen "gaat snel", geen bedrag per dag, geen tempo-kleur. Imke wil dat niet.
- Volgorde: potjes met uitgaven bovenaan (over eerst), potjes zonder uitgaven als korte rij (icoon, naam, bedrag) onderaan in dezelfde card, zonder apart kopje.

## Netto

Terugbetalingen worden verrekend. Het ingestelde bedrag verandert nooit: "van € 52,54 · € 48,27 uit · € 20,00 terug · netto € 28,27". In het detail staat de terugbetaling gekoppeld aan de oorspronkelijke uitgave ("voor Hornbach"). Inkomsten en terugbetalingen staan in `--success`.

## Rekeningen

- Per budget kies je welke rekeningen meetellen. Standaard alleen je eigen privé-rekeningen; de gezamenlijke zet je per budget aan.
- In Profiel heeft elke rekening de schakelaar "Gedeeld met [partner]". Gedeeld = de ander ziet de transacties; in haar budgetten telt de rekening alleen mee als zij dat per budget aanzet.
- Banklogo als plaatshouder (`data-bank-logo="SNS"`), vervangen door het echte logo.

## Periode en per persoon

- Periode: elke maand met een startdag. Imke: de 25e t/m de 24e.
- Elk budget begint elke periode weer bij het volle bedrag. Restant meenemen: nog navragen bij Imke hoe Spendee dit deed; niet bouwen tot dat duidelijk is.
- Budgetten zijn per persoon, nooit "samen".

## Detail van een budget

1. Kop: terug, icoon, naam, soort en rekening, knop Wijzigen.
2. "Deze periode": de details groot.
3. "Vergelijking met vorige periode": twee balken (deze periode tot nu, vorige periode) en één zin.
4. Transacties of afschrijvingen: de nieuwste 5, daaronder "Alle 20 transacties" (opent Transacties gefilterd op dit budget en deze periode). Terugbetalingen blijven altijd zichtbaar.

## Maken en wijzigen

Velden: naam, bedrag tot op de cent, soort, categorieën, rekeningen, periode (herhaalt + begint op). De subtitel volgt de gekozen soort ("Potje · alleen voor jou").
Categorieën: "+ Categorie" klapt een lijst open in het veld zelf (zoeken, één kolom, meerdere kiezen, Klaar). Aanname: elke categorie hoort bij één budget, zodat een uitgave nooit in twee budgetten telt.

## Leeg

Eén zin en een stille knop "Budget instellen". Geen lege lijst.

## Stijl

- Kopje van een groep boven de card, niet erin; rechts in grijs wat het getal betekent.
- Geen scheidingslijnen tussen rijen; groepen zijn aparte cards.
- Rood alleen voor een potje dat over is. Botergoud alleen voor een afwijking bij een vaste last.
- Geen em-dashes of en-dashes in microcopy ("25 sep t/m 24 okt").

## Nog open

- Spaardoel dat overboekingen naar een spaarrekening telt (Imke's "Spaarrekening" € 50).
- Restant meenemen naar de volgende periode.

## Klaar als

- [ ] Budget heeft `soort: 'vast' | 'potje'`, door de gebruiker gekozen.
- [ ] Netto met terugbetalingen; het ingestelde bedrag wijzigt nooit.
- [ ] Vaste last helemaal binnen toont "Betaald", nooit rood.
- [ ] Potje: rustig / precies op / over, met rood alleen bij over.
- [ ] Rekeningen per budget, standaard alleen privé; delen per rekening in Profiel.
- [ ] Tests voor `x` = 0,5 / 1 / 1,01, vaste last op exact 100%, en een terugbetaling die netto verlaagt.
