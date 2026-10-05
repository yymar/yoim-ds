# Prompt voor Claude Code: categorieën beheren in mone.yoim

Plak alles onder de lijn in Claude Code, in de repo van mone.yoim.

---

Nieuwe pagina **Categorieën**, bereikbaar vanuit Profiel. Het ontwerp staat in het design system, map `mone.yoim/`:

- `Categorieën desktop.html` en `Categorieën telefoon.html`: werkend prototype (lijst, wijzigen, samenvoegen, verwijderen, nieuw, de twee Splits-rondes, licht en donker).
- Logica en maten in `cat-app.js` (pagina, paneel, samenvoegen, verwijderen), `cat-rondes.js` (de twee rondes) en `cat-data.js` (voorbeelddata, iconen). Prototypecode: lees hem voor gedrag en maten, neem hem niet over.

Werk chirurgisch, zoals `CLAUDE.md` zegt. Schemawijzigingen in `../yoim/supabase/migrations`. Pas de kolomnamen hieronder aan op wat er echt staat.

**Weinig uitleg.** De pagina legt zichzelf uit door wat hij doet: geen hulpteksten onder velden of schakelaars. Tekst staat er alleen waar hij iets zegt dat je anders niet weet: foutmeldingen (naam bestaat al), lege staten, en wat er verandert bij samenvoegen en verwijderen.

**Heilig:** niets verandert een bestaande indeling stil. Elke actie die indelingen raakt, toont vooraf wat er verandert, met aantallen, en is ongedaan te maken waar dat kan. Alles is per persoon: wat Yoran hier doet, raakt Imkes categorieën en indelingen nooit.

## 1. Route en opbouw

- `app/(app)/profiel/categorieen/page.tsx`. In Profiel een rij "Categorieën" onder Rekeningen, met het aantal.
- Kop: terugknop "Profiel", titel, de regel "Alleen van jou. Imke heeft haar eigen lijst.", zoeken, **Samenvoegen** en **Nieuw** (telefoon: een ronde plus van 44px rechtsboven).
- **Desktop:** de lijst links, een paneel van 420px rechts in dezelfde rij (geen overlay), dat apart scrolt. Paneel op `--surface-raised`, radius `--radius-lg`, sluitknop van 40px rechtsboven.
- **Telefoon:** een sheet vanaf 56px onder de bovenkant, radius 28px boven, met greep en scrim.

## 2. Lijst

- Gegroepeerd op soort: **Vast**, **Variabel**, **Inkomen** (en Zonder soort voor nieuwe zonder soort). Kopje boven elke card, rechts het netto van de groep dit jaar. Binnen een groep op aantal transacties, meest gebruikt eerst.
- Rij (60px): icoon in de categoriekleur (36px), naam, daaronder "706 transacties · budget Boodschappen", rechts netto dit jaar in hele euro's ("−€ 3.413", positief in `--success`). Geen lijnen tussen rijen; hover alleen op `(hover: hover) and (pointer: fine)`.
- Verborgen categorieën staan onderaan onder "Verborgen in de kiezer", ingeklapt, met het aantal. Zoeken klapt ze vanzelf uit.
- Zoeken filtert direct. Niets gevonden: "Geen categorie die zo heet." met "Maak hem aan met Nieuw."
- Overboekingen en Nakijken staan hier niet: dat zijn geen categorieën.

## 3. Wijzigen (paneel of sheet)

Van boven naar beneden, 20px tussenruimte, kopjes in kleine hoofdletters:
1. Icoon van 56px, naam, "706 transacties sinds 2021".
2. Netto dit jaar als tegel op `--surface-sunken`: "staat bij Uitgaven" of "bij Inkomsten" (volgt uit het netto, niet uit de soort), het bedrag groot en "€ X af · € Y bij" eronder.
3. **Naam:** één capsuleveld, maximaal 40 tekens, uniek per persoon (hoofdletters tellen niet). Opslaan verschijnt in het veld zodra de naam echt anders is; Enter slaat ook op. Bestaat de naam al: "Die naam heb je al. Kies een andere, of voeg ze samen."
4. **Kleur en icoon:** ingeklapt als één rij ("Groen, boodschappen · Wijzigen"). Uitgeklapt: twaalf kleuren (`--cat-*` plus `success`, als stippen van 28px in een tikvlak van 44px, de gekozen met een ring) en een raster van 7 (telefoon 6) iconen met zoeken op Nederlandse woorden. De lijst met iconen en zoekwoorden staat in `cat-data.js` (`ICONS`). Een keuze slaat direct op.
5. **Soort:** segmented control Vast / Variabel / Inkomen, met de hint dat de soort alleen de volgorde en de standaardkleur bepaalt.
6. **Budget:** "Telt in budget Boodschappen" (tik opent dat budget), of "Telt in geen budget."
7. **Vanzelf Boodschappen voor** (de regels; aantal rechts in het kopje). Het woord "regels" komt in de interface niet voor. Per regel de tegenpartij en daaronder "38 keer · alleen op ABN AMRO Yoran & Imke · alleen op maandag", met "sinds 28 sep" voor regels uit "voortaan zo indelen". Waar een regel vandaan komt (Spendee) toon je niet. Een kruisje van 40px haalt hem weg; toast "Ekoplaza niet meer vanzelf als Boodschappen" met **Ongedaan maken**. Leeg: "Nog niets. Kies bij een transactie voor voortaan zo indelen." Een regel zet een gok klaar op nieuwe transacties, bestaande indelingen blijven staan, de meest specifieke wint.
8. **In de kiezer** (optioneel, markeer als optioneel): schakelaar "Tonen in de kiezer". Uit: de categorie verdwijnt uit elke kiezer, oude indelingen blijven staan.
9. Onderaan twee stille knoppen: **Samenvoegen met…** (zet de lijst in kiesstand met deze categorie al gekozen) en **Verwijderen**.

## 4. Nieuw

Paneel "Nieuwe categorie": het icoon groot bovenaan verandert mee, naam (verplicht, uniek), kleur, icoon, soort (optioneel; een tik op de gekozen soort zet hem weer uit). **Toevoegen** staat uit tot de naam geldig is. Na toevoegen opent de nieuwe categorie in het paneel, met toast en Ongedaan maken.

## 5. Samenvoegen

- **Samenvoegen** zet de lijst in kiesstand: een vinkje rechts in elke rij en onderaan een glazen balk "2 gekozen · Annuleren · Samenvoegen" (Samenvoegen staat uit onder de twee).
- Het paneel (telefoon: sheet) toont:
  - **Van:** de gekozen categorieën met aantal transacties en regels, elk met een kruisje.
  - **Naar:** een keuze uit de gekozen categorieën, standaard de meest gebruikte, of **Een andere categorie** (uitklappen, met zoeken).
  - **Naam daarna:** standaard de naam van het doel, aan te passen (uniek).
  - **Wat er verandert**, als één tegel, zo kort mogelijk: groot "378 transacties naar Boodschappen", daaronder in grijs alleen wat er nog meer gebeurt ("2 tegenpartijen gaan voortaan vanzelf mee, budget X telt voortaan Boodschappen"). Dubbele regels vallen stil samen. Geen regels over soort, netto of Imke: die volgen vanzelf.
  - **Budgetten**, omdat een categorie in hooguit één budget telt: zit het doel in geen budget en een bron wel, dan telt dat budget voortaan het doel. Zitten ze in verschillende budgetten, dan een korte waarschuwing in botergoud (`--botergoud-soft`, icoon in `--botergoud`): "Budget Vaste boodschappen blijft leeg achter."
  - Een brede knop **Samenvoegen in Boodschappen** met eronder "Niet terug te draaien". Geen browserdialoog.
- Na afloop opent het doel in het paneel, met een toast met de aantallen.

## 6. Verwijderen

- Een lege categorie: "Werk heeft geen transacties. Hij kan direct weg." Annuleren en Verwijderen (botergoud, geen rood). Toast met Ongedaan maken.
- Met transacties (de database staat dat niet toe) vervangt een tegel de knoppen: "Gezondheid heeft 46 transacties en 3 regels. Waar moeten ze heen?" met twee keuzes:
  - **Samenvoegen met een andere categorie:** een lijst met zoeken, de knop wordt "Samenvoegen in Onvoorziene Kosten". Dit is dezelfde bewerking als punt 5.
  - **Naar Nakijken:** de transacties krijgen geen categorie meer en staan weer in Nakijken; de regels gaan weg.
  - Zit de categorie in een budget, dan de regel "Het budget X telt Gezondheid daarna niet meer."

## 7. Splits In en Splits Uit uitfaseren

Beide zeggen hoe er betaald is (Tikkie), niet waaraan. **Splits In** wordt koppelen; **Splits Uit** gaat naar de echte categorie. Bovenaan de lijst een tegel "Splits In en Splits Uit gaan eruit" met twee knoppen, en in het paneel van beide categorieën dezelfde uitnodiging. Beide rondes zijn een pagina met terugknop "Categorieën", een kop met tellers en een voortgangsbalk, en **een kaart tegelijk** zoals Nakijken. Op desktop staat rechts **Hierna** (de volgende zes; een tik zet er een vooraan) en onder de kaart **Gedaan** met Ongedaan maken per regel. Elke stap is een tik van de gebruiker, met toast en Ongedaan maken; niets gebeurt automatisch. Wat overblijft, blijft gewoon staan.

**Ronde 1: Oude Tikkies koppelen.** Tellers: Nog in Splits In, Gekoppeld, Verrekend.
- Kaart: de Tikkie (icoon, naam, datum, rekening, bedrag in `--success`), de banktekst in monospace, "Hoort waarschijnlijk bij" met de voorgestelde uitgave en waarom ("'Loetje' in de omschrijving, 2 dagen eerder" of "Precies de helft van € 82,40, 1 dag eerder"), en het netto van die uitgave van nu naar daarna ("Netto (al 1 terug) −€ 180,00 → −€ 120,00").
- Voorstel: uitgaven in de 14 dagen ervoor. Eerst op een woord uit de Tikkie-omschrijving dat in de tegenpartij van de uitgave voorkomt, dan op een bedrag dat een nette deling is (de helft, een derde, een kwart), dan het dichtst bij in tijd. Geen voorstel: "Geen uitgave gevonden die past" en alleen **Kies een uitgave**.
- Knoppen: **Koppelen**, **Andere uitgave** (lijst van de 14 dagen ervoor, met zoeken en "al € 60 terug" bij uitgaven die al gekoppeld zijn) en **Overslaan, blijft in Splits In**.
- Koppelen maakt een rij in `reimbursements` en haalt de Splits In-indeling van die Tikkie weg. De categorie van de uitgave verandert niet, alleen het netto. Ongedaan maken draait beide terug.
- Einde: "Klaar voor nu", met wat er gekoppeld en verrekend is; de rest blijft in Splits In.

**Ronde 2: Splits Uit verdelen.** Tellers: Nog in Splits Uit, Verdeeld.
- Kaart: de transactie, de banktekst, onder "Waarschijnlijk" een of twee gekleurde tegels met waarom ("'Texel' en 'weekend' in de omschrijving", "Sanne: 3× Eten & Drinken"), daaronder **Alle categorieën** (uitklappen, met zoeken) en **Overslaan, blijft in Splits Uit**. Een tik op een categorie deelt in en gaat door.
- Einde, als de categorie leeg is: "Splits Uit is leeg" met **Verwijderen**, **Verbergen in de kiezer** en **Laten staan**. Zijn er overgeslagen: "Klaar voor nu", die blijven staan.

## 8. Slimmere gok voor nieuwe Tikkies

- Een binnenkomende Tikkie krijgt geen categorie meer. In Nakijken stelt de app een koppeling voor, met dezelfde regels als ronde 1.
- Een uitgaande Tikkie of Wiebetaaltwat: de app leest de woorden uit de omschrijving en zet de categorie die bij die woorden het vaakst gebruikt is bovenaan in de kiezer (eigen indelingen, telling per woord). Daarna de tegenpartij zoals nu.

## 8b. Richting voor later: vanzelf indelen, alleen bij twijfel in Nakijken

Nog niet bouwen; ontwerp de datastructuur er wel op. Een nieuwe transactie krijgt vanzelf een categorie als de app zeker is, en komt alleen in Nakijken als hij twijfelt.
- **Zeker** betekent: een regel die bij deze transactie past (tegenpartij, en rekening of weekdag als die erbij staan) en die de gebruiker de laatste keren nooit heeft gecorrigeerd. Bijvoorbeeld minstens 5 keer bevestigd en de laatste 20 keer niet aangepast. Houd per regel bij: bevestigd, gecorrigeerd, laatst gecorrigeerd.
- **Twijfel**: geen regel, twee regels die even specifiek zijn en elk iets anders zeggen, een regel die kort geleden is gecorrigeerd, of een tegenpartij als Tikkie, Wiebetaaltwat of PayPal, waar de naam niets zegt. Die gaat naar Nakijken met de beste gok, zoals nu.
- **Vanzelf** ingedeelde transacties krijgen in de lijst een klein teken, zodat je ze herkent. Wijzig je er een, dan gaat de regel terug naar "vraagt" tot hij weer vaak genoeg goed is.
- Alleen voor **nieuwe** transacties. Een bestaande indeling raakt de app nooit.
- Op de categoriepagina staat per regel "38 keer · vanzelf" of "12 keer · vraagt". Per regel is "Altijd vragen" aan te zetten.
- Komt een tegenpartij vaak met dezelfde bevestigde categorie terug zonder dat er een regel is, dan vraagt de app "Albert Heijn 1225 ook vanzelf als Boodschappen?" (Ja of Nee). Er komt nooit stil een regel bij.

## 9. Migraties

1. `mone.categories.icon text` (lucide-naam, null betekent: kies op naam zoals nu).
2. `mone.categories.hidden boolean not null default false`. De kiezers filteren erop; lijsten, Inzicht en budgetten niet.
3. Samenvoegen als **één transactie**: een Postgres-functie `mone.merge_categories(sources uuid[], target uuid, new_name text)`, die alleen op categorieën van `auth.uid()` werkt. In één transactie: indelingen naar het doel, regels naar het doel (dubbele weg), budgetkoppeling verplaatsen als het doel er geen heeft, de bronnen weg, de naam zetten. Geeft de aantallen terug. Daarnaast `mone.merge_preview(...)` met dezelfde aantallen zonder te schrijven, zodat de voorvertoning en wat er gebeurt nooit uit elkaar lopen. Verwijderen-met-samenvoegen gebruikt dezelfde functie.
4. Verwijderen naar Nakijken: ook als functie in één transactie (indelingen van die categorie weg, regels weg, budgetkoppeling weg, categorie weg).

## Klaar als

- [ ] Lijst per soort met netto, zoeken en verborgen onderaan; telefoon en desktop, licht en donker via tokens.
- [ ] Naam, kleur, icoon en soort wijzigen; naam uniek per persoon, maximaal 40 tekens.
- [ ] Regels per categorie zichtbaar als "Vanzelf … voor" met het aantal keer, weg te halen met Ongedaan maken.
- [ ] Samenvoegen met voorvertoning uit `merge_preview`, uitgevoerd door `merge_categories` in één transactie, met tests: aantallen kloppen, dubbele regels vallen samen, budgetten volgens punt 5, Imkes indelingen onaangeroerd.
- [ ] Verwijderen: leeg direct, anders samenvoegen of naar Nakijken, met aantallen.
- [ ] Beide Splits-rondes, elke stap met Ongedaan maken; koppelen verandert geen categorie van de uitgave.
- [ ] Tikvlakken minimaal 48px (knoppen in het paneel 44px), hover alleen op fijne pointers, geen browserdialogen, geen em-dashes of en-dashes in microcopy, `--danger` hier nergens.
