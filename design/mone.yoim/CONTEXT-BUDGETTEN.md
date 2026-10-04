# Context voor Claude Code: de budgetcard in mone

Plak alles onder de lijn in je Claude Code-sessie.

---

De Spendee-data staat erin. Voordat je de budgetcard op het dashboard bouwt: in mone bestaan **twee soorten budget** die zich verschillend gedragen. Spendee kent dat onderscheid niet; dat moet jij erin leggen. Het ontwerp staat in het design system: `mone.yoim/Desktop.html` en `Telefoon.html` (de card rechts naast "Uitgegeven in september"), en de verkenning in `mone.yoim/Hoofdcard varianten.html`, ronde 5b.

## Waarom

Imke heeft budgetten voor haar vaste lasten, bijvoorbeeld de woonlasten. Die worden in één keer afgeschreven, dus het budget is direct op en de regel stond permanent in het rood. Dat klopt niet, want er is niets mis: het bedrag was vooraf bekend. Een budget is voor uitgaven waarvan je het bedrag **niet** vooraf weet. Een vaste last weet je wel. Twee soorten dus, met elk hun eigen regels.

## De twee soorten

### Vaste lasten
Het bedrag staat vast en komt op een bekend moment binnen: hypotheek, energie, verzekeringen, abonnementen.

- **Vraag die hij beantwoordt:** is alles wat moest komen binnen, en klopt het bedrag?
- **Voortgang:** afgeschreven tegenover verwacht. De balk vult in de **categoriekleur**, nooit in de toestandskleuren.
- **Helemaal binnen** (`afgeschreven >= verwacht`): rechts een groen vinkje met "betaald". Dat is het normale eindpunt, geen alarm.
- **Nog niet alles binnen:** de subregel noemt de volgende afschrijving: "Volgende: verzekering, 24 sep · € 86,40".
- **Nooit rood. Geen tempo-markering**, want tempo betekent niets bij een vaste last.
- **Alleen bij een afwijking** krijgt de rij een signaal, in **botergoud** met een alert-icoon, niet in rood:
  - een afschrijving is hoger dan vorige keer ("Spotify € 7,50 hoger dan vorige maand");
  - een verwachte afschrijving is niet op tijd binnen.
- **Kolomkop:** "Afgeschreven / verwacht".

### Potjes
Een plafond voor variabele uitgaven waarvan je het bedrag pas achteraf weet: boodschappen, uit eten, kleding. Ook spaardoelen zoals "Vakantie 2026" en "Onvoorzien" vallen hieronder.

- **Vraag die hij beantwoordt:** lig ik op koers voor de rest van de maand?
- **Tempo:** vergelijk het verbruikte deel met het verstreken deel van de periode, `tempo = dag / dagenInPeriode` (dag 16 van 30 is 0,533).
- **Toestand per potje**, met `x = uitgegeven / budget`:
  - `over` als `x > 1`, in `--danger`. Het bedrag rechts wordt rood en de tekst zegt "€ 28,50 over".
  - `snel` als `x > tempo + 0,15`, in `--botergoud`. Je loopt voor op schema.
  - `ok` voor de rest, in `--accent`.
- **Balk:** vult in de toestandskleur, met een **stip op vandaag** (positie `tempo`). Zo zie je in één oogopslag of de vulling voor of achter de stip ligt.
- **Rechts:** het bedrag, met "van € 700" eronder.
- **Volgorde:** op urgentie, `x` aflopend. Wat over is staat bovenaan.
- **Kolomkop:** "Uitgegeven / budget".

## Opbouw van de card

```
Budgetten                         dag 16 van 30
Vaste lasten          Afgeschreven / verwacht
  [icoon] Woonlasten   ████████████   € 1.065  ✓ betaald
          Hypotheek, energie, water · alles binnen
  [icoon] Auto         █░░░░░░░░░░░   € 52,03  van € 389
          Volgende: verzekering, 24 sep · € 86,40
  [icoon] Maandlasten  ░░░░░░░░░░░░   € 12,50  van € 236
          ⚠ Spotify € 7,50 hoger dan vorige maand   (botergoud)
────────────────────────────────────────────────
Potjes                  Uitgegeven / budget
  [icoon] Kleding      ██████████●█   € 128,50 van € 100   (rood)
  [icoon] Uit eten     █████████●     € 141    van € 150   (goud)
  ...
  [icoon] Vakantie 2026 ●             € 0      van € 75
```

- Eén scheidingslijn, alleen tussen de groepen Vaste lasten en Potjes, niet tussen de rijen.
- Elk icoon zit in een rond plaatje van 36px in de categoriekleur, met de lichte categorietint als vlak (`--cat-*` en `--cat-*-bg`).
- Rijen: grid `36px | 1fr | 112px`, minimaal 68px hoog. De naam staat op 16px, met de balk (6px) en eventueel de subregel eronder.
- Leeg (geen budgetten, zoals bij Yoran): één zin en een stille knop "Budget instellen". Geen lege lijst.

## Datamodel

Spendee heeft alleen "budget". Voeg een soort toe:

```ts
type Budget = {
  id: string;
  naam: string;
  categorieIds: string[];      // welke Spendee-categorieën tellen mee
  bedrag: number;              // verwacht (vast) of plafond (potje)
  soort: 'vast' | 'potje';
  eigenaar: 'imke' | 'yoran' | 'samen';
  periode: 'maand';            // nu alleen maand
};
// alleen voor soort 'vast': wat verwachten we binnen deze periode
type VerwachteAfschrijving = { budgetId: string; omschrijving: string; bedrag: number; datum: string; binnen: boolean };
```

- **Voorstel bij de import:** een budget is waarschijnlijk `vast` als al zijn transacties in de afgelopen 3 maanden terugkeren met (bijna) hetzelfde bedrag (marge ±5%) en rond dezelfde dag (±3 dagen). Laat het de gebruiker bevestigen; raad het niet stil.
- **Verwachte afschrijvingen:** leid die af uit dezelfde terugkerende transacties van vorige maand.
- **Afwijking:**
  - het bedrag verschilt meer dan €1 of meer dan 2% van vorige keer;
  - of de verwachte datum plus 3 dagen is verstreken zonder dat er een afschrijving is binnengekomen.

## Niet doen

- Een vaste last die volledig binnen is, niet rood of "op" maken. Dat was precies Imkes klacht.
- De tempo-stip niet tonen bij vaste lasten.
- Botergoud niet als tekstkleur op wit voor lange tekst; alleen kort, semibold, met icoon (het contrast is krap).
- Gewone uitgaven nooit rood. Rood is alleen voor `over` bij een potje.

## Klaar als

- [ ] Budgetten in de data hebben het veld `soort`, met een voorstel uit de terugkeer-heuristiek.
- [ ] Een vaste last die volledig binnen is, toont "betaald" met een groen vinkje.
- [ ] Afwijkingen bij vaste lasten zijn botergoud, met een uitleg in de subregel.
- [ ] Potjes zijn gesorteerd op urgentie, met over/snel/ok en een stip op vandaag.
- [ ] Er zijn tests voor de toestand bij `x` = 0,5 / tempo+0,15 / 1 / 1,01, en voor vast op exact 100%.
