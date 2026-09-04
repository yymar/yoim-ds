# Brief voor het Claude Design-project: @yoim/ds is nu de bron

Plak dit als context in het Claude Design-project van yoim.

---

Sinds 4 september 2026 is het design system geen onderdeel meer van de yoim-app maar een
eigen pakket: `@yoim/ds` (github.com/yymar/yoim-ds). Alle yoim-apps nemen het af en pinnen
een versie. Het is de enige waarheid voor look en feel én voor inloggen. Wat jij hier
ontwerpt landt daar als token of component, en rolt van daaruit naar alle apps.

## Het landschap

Eén huishouden (Yoran en Imke, Molenberg 2a), één Google-login, meerdere apps op subdomeinen:

- **yoim.nl**: nu de boodschappen-, recepten- en weekplanning-app. Wordt later de
  startpagina: het inlogscherm plus een raster met tegels per app (een app picker). De
  huidige app verhuist dan naar een eigen subdomein, naam nog te kiezen.
- **energ.yoim.nl**: energiedashboard. Dynamisch stroomcontract per kwartier, gas per dag,
  de Tesla die thuis laadt, een spaarpotje tegen de jaarafrekening. Mobile-first, wordt op
  de telefoon bekeken.
- **home.yoim.nl**: op desktop een 3D-scene van het huis (Sims-achtig, maar strak en
  minimalistisch zoals de Tesla FSD-visualisatie: geen texturen, één materiaal per object,
  state is de enige opvallende kleur) waarin je objecten aanklikt die de echte apparaten
  aansturen via Home Assistant. Naast de scene een glazen zijpaneel per objectsoort. Op de
  telefoon later een compacte broekzak-UI.

Alle apps: Next.js, Tailwind v4, Nederlands, glas als materiaallaag, inhoud dekkend.

## Wat @yoim/ds v0.1 bevat (ongewijzigd uit de Liquid Glass v5-overdracht)

- `styles/tokens.css`: kleuren licht en donker (olijf-linnen, één accent, botergoud als
  warme steunkleur), typografie (Instrument Sans), maten, radii (concentrisch, capsules),
  motion (twee curves), glas-tokens in drie diktes, de horizon-kleuren van het inlogscherm.
- `styles/glas.css`: `.glas`, `.glas-dun`, `.glas-dik`, `.sheen`, `.kaart`, `.rij`, `.kop`,
  `.schermkolom`, `.vastekop` (de ingeklapte glazen kop), `.postertray`, `.overlay` (bottom
  sheet op de telefoon, gecentreerde modal vanaf 745px), focus, selectie, hover als tint.
- Componenten: het inlogscherm met de horizon die met het uur meebeweegt, de klok op glas,
  het merkteken, de tray met de Google-knop.
- Auth: de sessie-proxy en de Supabase-clients.

Alles wat van yoim zelf is (navigatie-capsule, zijrail, planningsweergave, receptkaarten)
zit niet in het DS en blijft in de yoim-app.

## Regels die overeind blijven

- Componenten verwijzen naar tokens, nooit naar een losse hex-waarde.
- Glas is de materiaallaag, de inhoud blijft dekkend. Verliest tekst op glas contrast, maak
  het veld dekkender, nooit de sheet.
- Nooit een buitenschaduw op iets met backdrop-filter; `--glass-rim` is inset.
- Knoppen zijn capsules, radii nesten concentrisch (ouder minus padding).
- Press is `scale(0.97)` op kaarten en knoppen, nooit op een lijstrij.
- Hover hangt aan `(hover: hover) and (pointer: fine)`, nooit aan een breedte, en is alleen
  een tint. Layout hangt wel aan breedte: 745px (`breed`) en 1120px (`plannen`).
- Een tekstveld krijgt geen focusring; focus is de accentrand of de oplichtende capsule.
- Geen em-dashes in microcopy; komma, dubbele punt of twee zinnen.

## Wat er ontworpen moet worden, in volgorde van behoefte

Elk onderdeel als aanvulling op de bestaande kit, met dezelfde tokens en glasregels, en
opgeleverd als iets dat één op één naar `tokens.css`, `glas.css` of een component kan.

1. **Energie (energ.yoim.nl)**: een prijscurve per kwartier voor morgen met het goedkoopste
   aaneengesloten laadvenster gemarkeerd; een live vermogen-weergave (huis en auto, per
   fase); stat-tegels met één getal, eenheid en een korte trend; een maandkaart met
   meerdere geldstromen die nooit tot één "netto" worden samengevoegd; een voorschot-check
   (potje versus verwachte bijbetaling, met projectie); invoer voor bedragen en datums
   (ledger). Datavisualisatie-kleuren ontbreken nog in de tokens: sequentieel en
   categorisch, licht en donker, met contrast dat op 13px leesbaar blijft.
2. **Startpagina (yoim.nl)**: de app-tegel. Naam, één regel, één live getal of status,
   het merk van de app. Raster op telefoon en desktop.
3. **Huis (home.yoim.nl)**: het zijpaneel naast de 3D-scene per objectsoort (lamp:
   aan/uit, helderheid, kleur, scènes; auto: laadstatus, laad nu, goedkoopste venster;
   meter: vermogen per fase); een verbindingsindicator (thuis, remote, geen verbinding);
   een pending-toestand als subtiele puls, nooit een spinner; de FSD-achtige kleurtaal
   voor state die ook buiten de scene terugkomt; camera-presets per kamer als chips.
4. **Generiek**: tabellen op de telefoon, getalvelden, lege staten voor data die nog niet
   binnen is, een compacte statusregel bovenaan een scherm.

## Hoe opleveren

Zoals de Liquid Glass-overdracht: een map met `WIJZIGINGEN.md` (wat is nieuw, wat is
beslist en waarom), de artboards, en waar mogelijk de CSS-tokens en componentcode zodat
het rechtstreeks in `@yoim/ds` kan. Nieuwe tokens komen bovenaan in de overdracht met
hun naam, licht- en donkerwaarde en waarvoor ze zijn.
