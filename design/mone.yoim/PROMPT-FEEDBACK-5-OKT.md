# Prompt voor Claude Code: feedback van 5 oktober in mone.yoim

Plak alles onder de lijn in Claude Code, in de repo van mone.yoim.

---

Yoran heeft de app gebruikt en feedback gegeven. Het ontwerp staat in het design system, map `mone.yoim/`:

- `Transacties v2.html`: werkend prototype (desktop, telefoon bovenaan, telefoon na scrollen, Profiel · rekeningen). Bovenin twee schakelaars: waar de filters staan, en welke detailvariant.
- `Transactie detail varianten.html`: vier voorstellen voor het detail van een transactie (A t/m D). **Gekozen: B Paneel.** A, C en D zijn alleen ter vergelijking.
- De logica en maten staan in `tx2-app.js` (pagina, filters, kiezers) en `tx2-detail.js` (detail, Profiel). Dat is prototypecode, geen code om over te nemen; lees hem voor gedrag en maten.

Werk chirurgisch, zoals `CLAUDE.md` zegt. Schemawijzigingen in `../yoim/supabase/migrations`.

## 1. Sticky kop: niets meer afkappen

`components/account-view.tsx`, `AccountHeader`.

- De regel met saldo, naam en "na vaste lasten die nog komen" mag doorlopen: `flex-wrap` op de `<p>` (column-gap 10px, row-gap 1px), `whitespace-nowrap` en `truncate` eraf op het laatste deel, en de "·" ervoor weg (hij zou aan het begin van de tweede regel staan). Saldo en naam blijven `nowrap`. Op de telefoon komt het vaste-lastendeel zo op een eigen regel.
- Rekeningkaartjes: `max-w-[9rem] truncate` eraf, `whitespace-nowrap` erop. Als alles past staat de volledige naam er; past het niet, dan scrolt de rij opzij zoals nu.
- Volgorde en verbergen komen uit Profiel (punt 2).

## 2. Profiel: volgorde en verbergen

`app/(app)/profiel/accounts.tsx` en `actions.ts`.

**Schema** (per persoon, dus in `mone.preferences`):
```sql
alter table mone.preferences
  add column account_order uuid[],
  add column account_hidden uuid[] not null default '{}';
```

**Volgorde.** Elke rij krijgt links een greep (`GripVertical`, 26px breed over de volle rijhoogte, `touch-action:none`, `cursor:grab`). Slepen verplaatst de rij live; loslaten bewaart. Ook met het toetsenbord: de greep is focusbaar, pijl omhoog en omlaag verplaatsen. Bewaren via een nieuwe action `setAccountOrder(ids)`, optimistisch en met terugval en toast zoals `setShared`.
- Pure functie in `lib/`: `orderAccounts(accounts, order)`. Eerst wat in `order` staat, daarna de rest op naam (zo komt een nieuwe rekening achteraan). Met tests.
- `loadBasics` sorteert nu op naam; zet de volgorde daar, zodat de kop, de budget-sheet en Profiel dezelfde volgorde hebben.
- Yorans volgorde om mee te beginnen: ASN Yoran, ASN Spaargeld, ABN AMRO Yoran & Imke, bunq Yoran, PayPal Yoran.

**Verbergen (het oog).** Rechts in de rij een ronde knop met `Eye` / `EyeOff` (40px zichtbaar, tikvlak 48px), label "Verbergen in Transacties" / "Tonen in Transacties". Verborgen:
- staat niet in de kop en niet in de lijst van Transacties (dus ook niet in `account_view`);
- wordt wel opgehaald, telt mee in budgetten en Inzicht, en een overboeking ernaartoe blijft een overboeking;
- in Profiel: logo grijs op 45 procent, naam in `--text-muted`, de tweede regel wordt "Verborgen in Transacties", het oog wordt `EyeOff` op een `--surface-sunken`-rondje.
- Minstens één rekening blijft zichtbaar. `accountView` en `setAccountView` laten verborgen rekeningen weg.
- Nieuwe action `setAccountHidden(id, hidden)`.

**Uitklappen blijft, strakker.** Wat live in het paneel zit blijft (Gedeeld met, toestemming, naam, Ontkoppelen of Weghalen), alleen de vorm verandert:
- Een open rij is één blad: rij en paneel samen op `--surface-sunken`, radius 18px, de card zelf 6px binnenmarge met 2px tussen de rijen. Eén rij tegelijk open; de chevron draait 180 graden. Tik op de rij opent, greep en oog niet.
- Rij: greep 26px, logo 40px, naam en tweede regel (allebei afkappen met ellips), oog 40px, chevron 22px. De naam past zo volledig op 390px.
- In het paneel, 12px tussenruimte, geen lijnen:
  1. "Gedeeld met Imke" als witte tegel (`--surface-raised`, radius 16px) met de uitleg eronder en de schakelaar rechts; de hele tegel is het tikvlak.
  2. Kopje "Naam" en één capsuleveld. **Opslaan** verschijnt pas in het veld (rechts, `--accent`) als de naam echt anders is.
  3. Onderste regel: links in grijs "Toestemming tot 1 apr 2027 · opgehaald 16:00", of bij een rekening zonder koppeling "Zonder koppeling · NL19 ASNB …" in monospace; rechts **Ontkoppelen** / **Weghalen** als stille tekstknop.
  4. Bevestigen vervangt die regel door een witte tegel: de zin van nu erboven, rechts onder Annuleren en de knop in `--botergoud-soft` met `--botergoud`.
- Slepen sluit een open rij eerst.

## 3. Filters: geen Toepassen, één periodekiezer, inklappen bij scrollen

`app/(app)/transacties/page.tsx` (het formulier) en `actions.ts` (`applyFilters`). Maak er een client component `Filters` van.

**Waar ze staan: gekozen is een eigen card eronder.** Onder de rekeningencard staat een tweede glazen card met alleen de filters (8px binnenmarge, radius `--radius-lg`). Beide cards zitten samen in één sticky houder (`top` zoals nu, 8px tussenruimte), zodat ze als geheel blijven staan. Ingeklapt wordt de filtercard een capsule van 40px hoog (radius 999px) met de samenvatting erin; de rekeningencard verandert niet.

**Periode.** Eén knop: kalendericoon, op desktop de naam van de voorinstelling plus de datums ("Deze periode 1 t/m 31 okt"), op de telefoon alleen de datums. Opent een popover (desktop, 540px: voorinstellingen links, kalender rechts) of een sheet (telefoon: voorinstellingen 2 bij 2, kalender eronder).
- Voorinstellingen: Deze periode, Vorige periode, Laatste 30 dagen, Dit jaar. Een tik past toe en sluit.
- Eén maandkalender met pijlen. Eerste tik is het begin (de lijst toont meteen die dag), tweede tik het eind; daarna sluit hij na 280ms. Bereik als band in `--accent-soft` op de hoogte van de dagknop (niet de hele cel): de band begint en eindigt in het midden van de begin- en einddag, zodat de gevulde cirkel er precies op valt, en loopt aan het begin en eind van elke week (en van de maand) rond af. 6px tussen de weken. Begin en eind gevuld in `--accent`. Hulpregel eronder: "Tik op een begin- en een einddatum", na de eerste tik "Kies de einddatum".
- Toepassen = `router.replace` met `?van&tot`, en de periode bewaren in `preferences` met dezelfde vertraging als `setAccountView` (alleen de laatste stand naar de server). `periodToSave` blijft zoals hij is.

**Categorieën.** Meerdere tegelijk, elke tik telt meteen. Knop "Alle categorieën" / de naam / "2 categorieën"; met een keuze in `--accent-soft`. Opent een popover van 320px of een sheet met:
- zoekveld; "Alle categorieën" (wist), "Nakijken", "Overboekingen", kopje "Categorieën", dan alle categorieën; die met transacties in de periode eerst, elk met het aantal en een vinkvakje.
- In de URL: `?categorie=id,id,nakijken`. `filterRows` krijgt een `Set`. De rijen voor de periode staan al in de browser, dus filteren op categorie gaat zonder serververzoek.
- Desktop: bij twee of meer staan ze als chips naast de knop (in de categoriekleur, met een kruisje), en "Wissen" rechts zodra periode of categorie afwijkt van de standaard.
- Telefoon: altijd één rij, nooit chips eronder. Periodeknop (alleen de datums), categorieknop die de rest van de breedte vult, en een ronde knop van 44px met een kruisje om te wissen (alleen als er iets afwijkt). Bij een keuze toont de categorieknop tot drie categorie-icoontjes van 24px die elkaar 8px overlappen, plus het aantal ("4"); bij één keuze het icoon en de naam. Weghalen gaat in de sheet.

**Inklappen.** Gescrold voorbij 60px wordt de filterregel één regel samenvatting: filtericoon, de datums vet, dan de categorieën of "alle categorieën", chevron. Geen knoppen. Een tik klapt hem uit; 80px verder scrollen klapt hem weer in. Bovenaan (onder 8px) altijd uit. Op desktop sluit een open popover bij scrollen. De kop zelf (saldo, kaartjes) klapt niet in.

## 4. Categorie wijzigen via het icoon

`components/overview.tsx` (`TransactionLine`) en `account-view.tsx` (`DayList`).

- Het categorie-icoon wordt een eigen knop (hit area 44px, visueel 36px) binnen de rij. Desktop-hover: ring in de categoriekleur plus een potloodje rechtsonder. Bij een overboeking is het icoon geen knop.
- Opent de kiezer: op desktop een popover van 340px onder het icoon (met tegenpartij, bedrag en datum bovenin), op de telefoon een sheet "Categorie voor Ovpay". Inhoud: zoekveld, "Waarschijnlijk" (twee, uit `guessCategory` en de geschiedenis van die tegenpartij, getint zoals in Nakijken), "Alle categorieën" met een vinkje bij de huidige, en onderaan een schakelaar "**Ovpay voortaan zo indelen**" met "Ook de 4 andere keren".
- Een keuze sluit de kiezer, de rij verandert meteen, toast "Ingedeeld als Auto & Transport" (met de schakelaar aan: "Ovpay is voortaan Auto & Transport") met **Ongedaan maken**. Ongedaan maken zet ook de regel terug.
- Nieuwe action `setCategory(transactionId, categoryId, { rule })`: overschrijft de eigen indeling en zet `confirmed = true` (`confirmCategories` raakt alleen gokken, dus die past niet). Met `rule`: een regel in `mone.rules` voor die tegenpartij, en de eigen indelingen van die tegenpartij mee. Nooit die van de ander.
- Een klik op de rij zelf opent het detail (punt 5).

## 5. Detail: B Paneel

Vier varianten in `Transactie detail varianten.html`, allemaal op Bijenkorf:
- **A Uitklap**: in de lijst, vier tegels (Wanneer, Rekening, Categorie, Potje), banktekst meteen zichtbaar.
- **B Paneel**: desktop rechts een paneel van 420px dat bij een andere rij meewisselt; telefoon een hoge sheet. Bedrag groot, Indeling met potje en balk, Geld terug, Rekening, banktekst, Eerder bij.
- **C Tegenpartij**: zes maanden als staafjes, deze transactie gemarkeerd, alle keren eronder, alles van die partij indelen.
- **D Bon**: kleine bon onder de rij, monospace regels, banktekst centraal.

**Gekozen: B.** Vervang de `<details>`-uitklap in `DayList` door een paneel. Voor de maten en volgorde, zie `tx2-detail.js` (functie `B`) en `tx2-app.js` (`detailHTML`).

- **Desktop:** een paneel van 420px rechts, 12px van de randen van het venster, op `--surface-raised` met `--shadow-raised` en radius `--radius-lg`. Het schuift in vanaf rechts (24px, `--dur-glas`, `--ease-glas`). Geen scrim: de lijst blijft klikbaar, een klik op een andere rij wisselt het paneel mee, en de open rij krijgt `--surface-sunken`. Sluiten met een ronde knop van 40px rechtsboven of met Escape. Mooier is dat het paneel de plek van de zijkolom inneemt (nakijken, budgetten), zodat de lijst niet bedekt wordt; doe dat als het past in `.zijkolom`.
- **Telefoon:** een sheet vanaf 56px onder de bovenkant, radius 28px boven, met greep, scrim `--scrim` en dezelfde sluitknop.
- **Inhoud**, van boven naar beneden, 20px tussenruimte:
  1. Categorie-icoon van 52px als knop (met het potloodje, opent de kiezer uit punt 4), tegenpartij op 20px semibold, "maandag 5 oktober 2026 · 11:42" in grijs, bedrag op 36px (inkomsten in `--success`).
  2. **Indeling:** de categorieknop (capsule in de categoriekleur met potlood), "Nog nakijken" in botergoud als hij niet bevestigd is, en het potje of de vaste last van die categorie met balk en de regel uit `CONTEXT-BUDGETTEN.md` ("€ 85,00 over van € 100,00").
  3. **Geld terug:** de gekoppelde terugbetaling ("Tikkie van Imke · 2 okt · verrekend met deze uitgave · +€ 15,00"), of bij een terugbetaling "Terug voor Bijenkorf van 4 okt". Zonder koppeling bij een uitgave de knop "Terugbetaling koppelen" (nieuwe flow, nog te ontwerpen: laat de knop weg tot die er is).
  4. **Rekening:** logo van 36px, naam, Privé of Gedeeld en de laatste vier.
  5. **Zoals de bank het schrijft:** `description` in monospace, 12px, altijd zichtbaar.
  6. **Eerder bij [tegenpartij]:** de laatste drie, met datum en bedrag; rechts in het kopje "7 keer sinds mei". Uit een query op dezelfde tegenpartij (zoals `loadReviewCards`).
- Elke sectie: kopje in kleine hoofdletters boven een vlak op `--surface-sunken`, radius 18px. Geen lijnen.
- De tijd staat niet in een kolom: haal hem uit `description` als die er is, anders alleen de datum.
- Alle gegevens zijn er al: `longDate`, de rekening met logo, de categorieknop uit punt 4, het potje uit `loadBudgets`, de terugbetaling uit `reimbursements`.

## 6. Budgetten: bedrag per periode

Nu duidelijk hoe Spendee het deed (zie `CONTEXT-BUDGETTEN.md`, bijgewerkt): elk budget begint op de startdag opnieuw. Een vaste last houdt zijn bedrag. Bij een potje zet de gebruiker het bedrag elke periode zelf (rest plus wat erbij komt), want de app weet niet hoeveel er naar welk potje gaat. Dat blijft handmatig.

Gevolg: het bedrag hoort bij een periode, anders herschrijft een wijziging de vorige periode in "Vergelijking met vorige periode".
```sql
create table mone.budget_amounts (
  budget_id uuid references mone.budgets on delete cascade,
  owner uuid not null,
  period_from date not null,
  amount_cents integer not null check (amount_cents > 0),
  primary key (budget_id, period_from)
);
```
- Het bedrag van een periode: de laatste rij met `period_from <= window.from`, anders `budgets.amount_cents`. Pure functie in `lib/budget.ts` met tests; `budgetStatus` en de vergelijking krijgen het bedrag van hun eigen periode.
- Wijzigen in de sheet schrijft een rij voor de lopende periode (`window.from`). Een eerdere periode verandert nooit.
- In de sheet, alleen bij een potje en alleen als er iets over was: onder het bedragveld in grijs "Vorige periode € 50,00 over". Alleen ter informatie, geen knop: de keuze blijft bij de gebruiker.

## 7. Imke's spaarrekening

Imke's SNS-spaarrekening: **NL41 SNSB 8815 5769 91**. Voeg hem voor Imke toe als rekening zonder koppeling (bank SNS, naam "SNS Spaarrekening", privé), zodat overboekingen ernaartoe als overboeking herkend worden. Dat is ook de eerste stap voor het open punt "spaardoel dat overboekingen naar een spaarrekening telt" (haar budget Spaarrekening € 50).

## Volgorde

1. Kop (punt 1) en categorie via het icoon (punt 4): klein en meteen merkbaar.
2. Filters (punt 3).
3. Profiel: volgorde en verbergen (punt 2), met de migratie.
4. Bedrag per periode (punt 6) en de spaarrekening (punt 7).
5. Detail: paneel B (punt 5).

## Klaar als

- [ ] Geen tekst in de kop wordt afgekapt als er ruimte is; op 390px staat "na vaste lasten die nog komen" volledig op de tweede regel.
- [ ] Volgorde en verborgen rekeningen per persoon bewaard, met tests voor `orderAccounts` (nieuwe rekening achteraan, verwijderde id in `order` genegeerd).
- [ ] Een verborgen rekening telt mee in budgetten en Inzicht en blijft overboekingen herkennen.
- [ ] Geen Toepassen-knop meer; periode en categorieën werken bij elke tik, de URL volgt.
- [ ] Filters klappen in bij scrollen en uit bij een tik; op desktop sluit een popover bij scrollen.
- [ ] Categorie wijzigen via het icoon, met regel en Ongedaan maken; de indeling van de ander blijft onaangeroerd.
- [ ] Detail B op desktop en telefoon, wisselt mee bij een andere rij.
- [ ] `budget_amounts` met tests: wijzigen in deze periode laat de vorige ongemoeid.
- [ ] Tikvlakken minimaal 48px, hover alleen op `(hover: hover) and (pointer: fine)`, geen em-dashes of en-dashes in microcopy, licht en donker via tokens.
