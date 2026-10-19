# Changelog

## 0.7.6

- Nieuw: `FoutScherm` (`components/fout-scherm`), het scherm voor `error.tsx` en
  `global-error.tsx`: `LeegStaat` met de stille knop Opnieuw proberen (`retry`
  van Next). Elke app had hier een eigen kopie met een eigen knop, en LeegStaat
  zegt dat zijn actie een stille knop is maar die bestond nergens.

Niet breaking. Een app kan zijn eigen `error.tsx` vervangen door
`<FoutScherm retry={retry} />`.

## 0.7.5

- Studio: de wegstrepen van de rij-loop lopen links en rechts zacht uit in
  plaats van hard op te houden aan de rand van het vak van de auto. Het masker
  op `.yoimStudioRijdt` was alleen links (0 tot 10%) en is nu aan beide kanten:
  helemaal uit in de buitenste 3%, vol vanaf 10,5% en tot 89%, waar de auto in
  de render begint en ophoudt. De auto zelf blijft ongemaskerd.

Let op bij het bijwerken (energ.yoim):

- Knip niet meer dan 3% van de video aan elke kant af, anders is de rand van
  de strepen weer te zien. Op de telefoon kan dat door de studio tot de rand
  van het scherm te laten lopen (zie `.autokaart-studio` in `app/globals.css`).

## 0.7.4

- Bij `weg` en `rijdt` geen spot en geen lichte vloer meer: dan staat de auto
  niet in de studio, en het studiolicht vocht met het licht van de auto zelf.
- Studio: rijden is een rijdende auto in plaats van een grijze spookauto, en de
  laadkabel zit in de poort.
  - Nieuw: `.yoimStudioRijdt` (met `.yoimStudioAuto`), een rij-loop als
    `<video>` met alpha en een `poster`. Alleen zichtbaar bij
    `data-toestand="rijdt"`; zodra hij er is, verbergt hij de stilstaande
    auto, het licht en de glans. `max-width: none` tegen de preflight van
    Tailwind, en een masker dat de linker 10% uitdooft (de koplampbundel en
    de strepen lopen tot de rand van het beeld). Met reduced motion speelt de
    app hem niet af en staat de poster.
  - Bij `rijdt` is de auto niet meer grijs en doorzichtig (`--studio-weg`,
    `grayscale`), dimmen spot en vloer niet meer en staat er geen parkeervak.
    `weg` blijft zoals hij was.
  - Nieuw: `.yoimStudioKabel` (de kabel, met alpha, normaal over de auto) en
    `.yoimStudioLed` (het ledje van de poort, op zwart, `screen`), allebei met
    `.yoimStudioAuto`. Bij `laadt` staan ze er en ademt het ledje (2,4 s,
    alleen opacity). Met `data-kabel` op `.yoimStudio` (kabel erin, niet aan
    het laden) staat de kabel er bij `thuis` en `slaapt` en brandt het ledje
    thuis op 35%. Anders zijn ze verborgen. Met reduced motion brandt het
    ledje stil.
  - Het ledje mengt met `screen`, dus dezelfde regel als bij het licht: geen
    stacking context tussen de studio en de achtergrond van de pagina.

Let op bij het bijwerken (energ.yoim):

- Renders uit `baymax-studio/renders/v3` naar `public/baymax/3/`: `rij-licht`
  en `rij-donker` (900 en 1600, WebM en MP4, met posters), `kabel` en
  `laadpoort-led` (600 tot 1600, AVIF en WebP), en de nieuwe `inrij` met
  draaiende wielen. `still-uit` en het licht zijn niet veranderd.
- `components/car-studio.tsx`: bij `rijdt` een
  `<video className="yoimStudioAuto yoimStudioRijdt">` met de video van het
  thema (WebKit HEVC, de rest VP9, zoals `rideSource`) en de poster; na het
  licht `<picture className="yoimStudioAuto yoimStudioKabel">` en
  `...yoimStudioLed` bij laden of kabel erin, en `data-kabel` op `.yoimStudio`
  als `kabel_erin` en hij niet laadt.
- Zonder die wijziging staat bij `rijdt` de stilstaande auto ongedimd met de
  lichten uit, in plaats van grijs.

## 0.7.3

- Studio: wat energ lokaal had bij de inrij-video staat nu in `studio.css`.
  `data-rit="wacht"` verbergt de stilstaande auto als voor de eerste paint al
  vaststaat dat de video komt; een masker dooft de rechterrand van de video uit
  zolang hij binnenrijdt (met `data-loopt` op de video zodra hij echt speelt);
  en `max-width: none` op `.yoimStudioRit` tegen de preflight van Tailwind.
  Let op bij het bijwerken (energ): de regels voor `wacht`, het masker,
  `autokaartRitRand` en `max-width` onder `.autokaart-studio` kunnen weg.

## 0.7.2

- `styles/studio.css`: echt licht en een echte inrij-video in plaats van een
  render die met CSS naar links schuift.
  - Nieuw: `.yoimStudioLicht` met `.yoimStudioLichtDag` (lichtbalk en
    achterlichten) of `.yoimStudioLichtVol` (daarbij de koplampen): een render
    op zwart als `<picture>`, met `mix-blend-mode: screen` over de auto en met
    `.yoimStudioAuto` voor plaats en maat. Vol bevat dag, dus ze wisselen elkaar
    af en stapelen niet.
  - Welkom: de auto komt aan met vol licht, dat na 0,2 s in 600 ms overgaat in
    dag.
  - Knipperen zoals bij ontgrendelen: `data-knipper` op `.yoimStudio` of een
    voorouder geeft twee flitsen van vol en dan weer dag (1 s). Loopt via
    `@property --studio-flits`, zodat het welkom niet opnieuw speelt.
  - Nieuw: `.yoimStudioRit` voor de inrij-video (met `.yoimStudioAuto`). Een
    voorouder krijgt `data-rit="speelt"` zolang hij speelt (dan staat alleen
    de video er) en daarna `data-rit="klaar"`: de video vervaagt in 0,25 s
    boven de stilstaande auto met vol licht, en vol gaat over in dag.
  - Toestanden: `thuis` en `laadt` hebben dag-licht (laadt houdt zijn groene
    vloer); `slaapt`, `weg`, `rijdt` en `los` hebben de lichten uit. Slapen
    dimt de lak niet meer grauw: geen `saturate`, en `--studio-slaap` is 0,97
    (donker 0,95) in plaats van 0,8 (0,72).
  - De auto rijdt niet meer met CSS in (`yoimStudioInrij` is weg): hij komt
    aanzetten in 0,4 s vanaf opacity 0,01, zodat hij meteen als LCP telt.
  - `.yoimStudio` heeft geen `z-index: 0` meer: het licht moet kunnen mengen
    met de achtergrond van de pagina.
  - Met `prefers-reduced-motion` geen welkom, geen knipper en geen video; alles
    staat stil op dag-licht.

Let op bij het bijwerken (energ.yoim, de enige afnemer van `studio.css`):

- Pin `#v0.7.2`. Zonder verdere wijziging blijft de hero werken, alleen rijdt
  de auto niet meer in maar komt hij aanzetten.
- Geen stacking context tussen de studio en de achtergrond van de pagina:
  `isolation: isolate` van `.autokaart` moet weg bij `.autokaart-studio`, en
  geen `z-index`, `opacity`, `transform`, `filter` of `will-change` op een
  voorouder. Anders tekent het zwart van de lichtlaag als rechthoek.
- `components/car-studio.tsx`: na de `<picture className="yoimStudioAuto">`
  twee `<picture className="yoimStudioAuto yoimStudioLicht yoimStudioLichtDag">`
  en `...LichtVol` met de renders uit `public/baymax/2/` (`still-uit` wordt de
  auto, `licht-dag`, `licht-vol`), en eventueel
  `<video className="yoimStudioAuto yoimStudioRit">` met `width` en `height`,
  `muted`, `playsInline`, `preload="none"` tot hij speelt. Zet
  `data-rit="speelt"` vlak voor `play()` en `data-rit="klaar"` op `ended`, en
  laat dat staan.
- Knipperen bij een live overgang: zet `data-knipper` en haal hem weg op
  `animationend` (of na 1 s).

## 0.7.1

- Fix: `.skeleton-reveal` vult met `backwards` in plaats van `both`. Met `both`
  bleef de echte inhoud na de fade een stacking context, en dan lag de
  navigatie (z-40) over een sheet binnen `<main>` (z-45). Let op bij het
  bijwerken: een lokale override (`animation-fill-mode: backwards`) kan weg.

## 0.7.0

- Nieuw: `styles/skeleton.css`, laden voor alle apps, letterlijk uit Claude
  Design (`tokens/skeleton.css`). Tokens `--skeleton-fill`,
  `--skeleton-fill-canvas`, `--skeleton-fill-glass`, `--skeleton-line` (licht,
  donker en per `data-thema`), `--skeleton-pulse`, `--skeleton-ease`,
  `--skeleton-delay`, `--skeleton-reveal`; de klok `@property --skeleton-tone`;
  de klassen `.skeleton-*`. Los bestand zoals `studio.css`, maar elke app
  importeert hem.
- Nieuw: `components/skeleton` met `Skeleton`, `SkeletonLine`,
  `SkeletonNumber`, `SkeletonCircle`, `SkeletonButton`, `SkeletonImage`,
  `SkeletonGroupHead`, `SkeletonRow`, `SkeletonCard`, `SkeletonChart`,
  `SkeletonCalendar`, `PageSkeleton` en `skeletonWidth` (met test). Server
  components, dus ook in `loading.tsx` en als Suspense-fallback.
- De regels (README, sectie Laden): een skeleton alleen als de vorm vaststaat,
  `fallback={null}` voor wat misschien niet komt, verversen dimt
  (`.skeleton-stale`), een bezige knop houdt zijn breedte en zegt wat hij doet.
  Het skeleton gebruikt de echte layoutklassen, `.kaart`, `.rij` en
  `.groepkop`; vaste tekst is echt, alleen data is een vlak. CLS 0. Zichtbaar
  na 150 ms, fade van 200 ms, de echte inhoud komt op met `.skeleton-reveal`.
  Eén pulse van 1,6 s op `<html>`, geen shimmer; stil met
  `prefers-reduced-motion` of `[data-beweging="stil"]`. `aria-busy` op het
  geheel, één sr-only statusregel, elk vlak `aria-hidden`. De vulling volgt
  canvas, `.kaart` of glas vanzelf.

Let op bij het bijwerken (niet breaking, maar elke app vervangt zijn eigen
laadstaat; de code staat in `design/skeletons/PROMPT-CLAUDE-CODE.md`, sectie 2,
de maten in `templates/skeletons/` in Claude Design):

- Elke app: pin `#v0.7.0`, zet `@import "@yoim/ds/styles/skeleton.css";` in
  `app/globals.css` onder `glas.css`, en geef de echte inhoud die een skeleton
  vervangt `className="skeleton-reveal"` en `data-slot` met dezelfde naam als
  `slot`/`area` van het skeleton. Controleer in de build dat `@property` en de
  pulse blijven staan (Chrome en Safari).
- mone.yoim:
  - Eerst de kaartregel van 0.5.1 afmaken: `Group`
    (`components/budgets.tsx`) krijgt `<h2 className="groepkop">` en de
    `gap-2` van de `section` gaat weg.
  - `components/page-loading.tsx` kan weg. `PAGE_CLASS` in
    `components/page.ts`, gebruikt door de routes en de skeletons.
  - Nieuw `components/skeletons.tsx` (`ROW`, `LIST`, `HeadSkeleton`,
    `PeriodNavSkeleton`, `DaySkeleton`, `BudgetRowSkeleton`) en een
    `loading.tsx` voor transacties, inzicht en budgetten. Volg de volgorde van
    `.zijkolom` in `transacties/page.tsx` en de plek van `-order-1` in
    `inzicht/page.tsx`; haal de `border-t` van `BudgetRowSkeleton` weg als de
    echte `BudgetRow` er geen heeft. Profiel nog niet.
- energ.yoim:
  - Weg: `components/skeleton.tsx`; in `app/globals.css` de oude
    `.skeleton`-animatie, `@keyframes skeleton` met zijn reduced-motion-regel,
    de `min-height`-lijst per `data-vak` met de twee media queries, en het
    opkomen van de blokken (`animation: opkomen` met de delays).
  - Nieuw `components/skeletons.tsx` met een skeleton per vak, als fallback
    op Vandaag, BaYmax en Geld, plus `loading.tsx` voor Vandaag, BaYmax, Geld
    en Profiel. `CardGroup` krijgt `data-slot={area}` en
    `className="vak skeleton-reveal"`. Haal `px-1.5 pt-1.5` uit
    `TripsSkeleton` als `.trips-kaart` die padding zelf zet.
- weekl.yoim: drie nieuwe `loading.tsx` (Boodschappen, Week, Recepten) met de
  klassen van de echte schermen (`lijstkolommen`, `plannen`, `receptkop`); de
  invoerbalk neemt de klassen over uit `lijst.tsx`.
- yoim (hub): `app/(app)/loading.tsx` met de echte kop en panelen, alleen de
  cijfers als vlak; de regels en `href` uit de echte panelen.
- home.yoim: alleen de pin en de import.

## 0.6.1

- Nieuw: `styles/studio.css`, de auto als studio-render (de hero van energ
  /baymax, uit Claude Design). Tokens `--studio-*` in licht en donker, de
  klassen `.yoimStudio…` voor spot, vloer, parkeervak, auto en glans, en de
  toestanden via `data-toestand` (`thuis`, `laadt`, `slaapt`, `weg`, `rijdt`,
  `los`). Inrijden en glans alleen in CSS, stil met `prefers-reduced-motion`.
  Niet in `tokens.css` of `glas.css`: een app die hem wil, importeert hem los.
  Niets te doen voor apps die hem niet gebruiken.

## 0.6.0

- Nieuw: `SegmentedChoice` (`@yoim/ds/components/segmented-choice`), een keuze
  uit twee tot vier als segmenten in een capsule, ontworpen in Claude Design.
  Props: `label`, `showLabel`, `options`, `value`, `onChange`, `description`,
  `descriptionPlacement` (`below` of `above`) en `renderSelectedIcon`. Een
  optie (`SegmentedOption`) heeft `id`, `label` en optioneel `icon`,
  `iconOnly`, en `color` met `initial` voor een avatar van 20px (op 75% als hij
  niet gekozen is). Met minder dan twee of meer dan vier keuzes waarschuwt hij
  in de console.
- De baan is geen glas maar `--text` op 7%, zodat hij op elk vlak te zien is,
  ook op een bijna wit vlak. Het dekkende plaatje onder de gekozen optie glijdt
  mee in `--dur-glas` met `--ease-glas`; bij de eerste verf en met
  `prefers-reduced-motion` springt het. Licht: `--surface-raised` met een
  haarlijn in `--border-strong`. Donker: `--text` op 14% door
  `--surface-raised`. Nieuwe token daarvoor: `--segment-plaat`.
- Een optie groeit met zijn inhoud, is met een muis 30px hoog en op touch 38,
  en heeft in beide gevallen een tikdoel van 44px. Gekozen: `--text` en
  halfvet; anders `--text-muted`.
- Toegankelijk als radiogroep: `aria-label` (of `aria-labelledby` met
  `showLabel`), per optie `role="radio"` met `aria-checked`, een roving
  tabindex, pijltjes die kiezen en rondlopen, Home en End. De uitleg is
  `aria-live` en elke optie verwijst ernaar met `aria-describedby`. De
  toetslogica en de waarschuwing als pure functies in `segment.ts`
  (`nextIndex`, `optionCountWarning`), met tests.
- `ThemeChoice` is nu een dunne laag om `SegmentedChoice`, met dezelfde props.
  Hij ziet er anders uit: elke keuze heeft een icoon en een label (ook met
  `system`, waar het eerst alleen iconen met een tooltip waren), en bij een
  gekozen Systeem staat eronder "Volgt je apparaat, nu donker" (of licht).
  `.nav-thema`, zijn tooltip en het tikdoel van 0.5.3 zijn weg uit `glas.css`.

Let op bij het bijwerken (niet breaking, wel per app):

- Eigen CSS op `.nav-thema` kan weg, maar geen app heeft die nog (de hub,
  weekl, energ, mone.yoim, home en mone.yymar nagekeken). Niets te doen.
- `ThemeChoice` houdt zijn props, dus de aanroepen typechecken zoals ze zijn:
  de hub (`components/theme-choice.tsx`), weekl (`components/account.tsx`,
  zonder `system`), energ (`components/thema-schakelaar.tsx`) en home
  (`components/theme.tsx`). Kijk op de telefoon of hij goed staat: hij is met
  de uitleg bij Systeem een regel hoger. mone.yoim gebruikt hem niet, en
  mone.yymar heeft in zijn menu eigen rijen met een vinkje.

## 0.5.6

- `Navigation` klapt op de telefoon zelf in bij scrollen, zoals mone.yoim en
  weekl het elk zelf deden (overgenomen uit mone.yoim, dezelfde drempels,
  maten en timing). Met twee of meer routes: voorbij 40px van de top klapt de
  capsule onderaan in tot iconen (labels weg, capsule smaller), onder 12px
  klapt hij weer uit. De hysterese houdt de glasanimatie rustig rond de lijn.
  Breedte en labels lopen in `--dur-glas` met `--ease-glas`, de labels
  vervagen in `--dur-fast`; met `prefers-reduced-motion` springt het. Een
  passieve scrollluisteraar die per frame hooguit een keer `scrollY` leest,
  gedeeld door iedereen die meeluistert. Uitzetten met
  `collapseOnScroll={false}`.
- De stand voor chrome die meebeweegt: de `<nav>` krijgt `data-ingeklapt` en
  `<html>` krijgt `data-nav-ingeklapt`. Op de telefoon is `--nav-nu` dan
  `--nav-h-klein` en `--nav-zak` het verschil met `--nav-h` (wat de bovenkant
  van de capsule zakt). Nieuwe token `--nav-zak`, standaard 0; iets dat op de
  capsule staat, zakt mee met `transform: translateY(var(--nav-zak))`.
  `--nav-onder` blijft de uitgeklapte maat: de ruimte onder de inhoud, en die
  mag tijdens het scrollen niet verspringen.
- `useScrolled(enabled = true)` uit `components/navigation`: dezelfde stand en
  dezelfde luisteraar, voor een kop die op hetzelfde moment wisselt. De
  drempels als pure functie in `scroll.ts` (`nextScrolled`, `COLLAPSE_AFTER`,
  `EXPAND_BELOW`), met tests.
- Een bewuste afwijking van mone.yoim: het label is uitgeklapt
  `calc(var(--lh-nav) * 1em + 0.5em)` hoog in plaats van `1.5em`. Door de
  border-box van Tailwind en de 2x 0,25em ruimte voor onderstokken (0.5.4)
  werd de labelregel in mone 11px in plaats van 13,2, en de capsule 61px in
  plaats van `--nav-h`. Nu is hij weer `--nav-h` hoog, net als in energ.

Let op bij het bijwerken:

- mone.yoim: haal het eigen inklappen weg, anders doet het twee keer hetzelfde
  en wint de app-CSS van het DS.
  - `components/app-navigation.tsx`: de import van `useScrolled` uit
    `@/components/use-scrolled`, `const collapsed = useScrolled()` en de
    wrapper `<div data-collapsed={collapsed || undefined} className="contents">`
    weg; `<Navigation>` staat dan direct in de return.
  - `components/use-scrolled.ts`: verwijderen (alleen app-navigation gebruikte
    hem).
  - `app/globals.css`: het hele blok onder "Op de telefoon klapt de capsule bij
    scrollen in tot iconen" weg, dus `@media (max-width: 744px)` met
    `.navigation`, `.navigation .nav-label`, `[data-collapsed] .navigation`
    (`--klein-b`) en `[data-collapsed] .navigation .nav-label`.
  - De capsule wordt 2,2px hoger (zie boven); de bankmelding, de melding van de
    gezamenlijke rekening en de toast rekenen al met `--nav-h` en staan dus
    goed.
- weekl: hetzelfde, en `.onderchrome` blijft gewoon meezakken.
  - `components/navigatie.tsx`: de import van `useGescrold` uit
    `@/lib/gescrold`, `const collapsed = useGescrold()` en de wrapper
    `<div data-collapsed={collapsed || undefined} className="contents">` weg.
  - `app/globals.css`: `:root { --nav-zak: 0px; }` met zijn comment weg (de
    token komt nu uit het DS), en het hele blok `@media (max-width: 744px)`
    onder "Op de telefoon klapt de capsule van Navigation bij scrollen in",
    met `:root:has([data-collapsed] .navigation)` (`--nav-nu`, `--nav-zak`),
    `.navigation`, `.navigation .nav-label`, `[data-collapsed] .navigation`
    (`--klein-b`) en `[data-collapsed] .navigation .nav-label`. `.onderchrome`
    met `transform: translateY(var(--nav-zak))` en zijn transitie blijft
    staan, net als `--nav-nu: 0px` vanaf 745px.
  - `lib/gescrold.ts` gebruiken ook de compacte kop (`components/scherm.tsx`,
    `components/plannen.tsx`, `components/recepten/lijst.tsx`). Vervang daar
    `useGescrold()` door `useScrolled()` uit `@yoim/ds/components/navigation`
    (dezelfde 40 en 12px, en een luisteraar voor kop en capsule samen) en
    verwijder `lib/gescrold.ts`.
- energ en mone.yymar: niets, alleen de versie ophogen. Ze hebben drie en vier
  routes en klappen vanaf nu vanzelf in.
- home: niets, een route en dus geen capsule onderaan.
- De hub (`../yoim`): niets, alleen de versie ophogen. Hij heeft vier routes
  en klapt vanaf nu vanzelf in.

## 0.5.5

- De balk boven de app (`meta[name=theme-color]`) volgt nu het gekozen thema.
  Koos iemand Donker op een lichte telefoon, dan bleef de statusbalk licht,
  want de twee metas uit de root-layout volgden alleen `prefers-color-scheme`.
  `THEMA_SCRIPT` (voor de eerste verf) en `chooseTheme`, ook bij een keuze in
  een ander tabblad via `subscribeTheme`, zetten de `media` van elke
  `meta[name=theme-color][media]`: `all` voor de meta van het gekozen thema,
  `not all` voor de andere. Systeem zet de oorspronkelijke `media` terug (die
  staat in `data-media`). De kleur zelf blijft staan: React herkent een meta
  bij het hydrateren aan zijn `content`, en een andere `content` gaf een
  tweede meta. Daardoor werkt het ook met eigen kleuren, zoals die van
  mone.yymar. Een meta zonder `media` (het inlogscherm, dat het uur volgt)
  blijft met rust. Nieuw: `themeColorMedia`, de regel als pure functie.
- Nieuwe klasse `.avatar-link` (`border-radius: var(--radius-full)`): een
  avatar als link in de paginakop op de telefoon. Het tikdoel (44 of 48px) is
  vierkant en groter dan de avatar, dus de focusring tekende een vierkant om
  een cirkel. Met de klasse is de ring rond.
- `Navigation`: de avatar rechtsboven krijgt `aria-current="page"` en dezelfde
  vulling en glasrand als een actieve route als je op zijn pagina staat
  (`usePathname()` is gelijk aan `account.href`), zodat je ziet dat je op
  Profiel of Instellingen bent.
- `Navigation`: de capsule onderaan op de telefoon is niet breder dan
  `--content-max` en staat in het midden. Tussen 600 en 744px (een iPad mini
  staand) was hij 712px breed onder een kolom van 512.

Let op bij het bijwerken (niet breaking, wel per app):

- theme-color: niets, zolang de root-layout twee `themeColor`s met `media`
  zet en `THEMA_SCRIPT` in de `<head>` heeft. Dat doen ze alle zes (de hub,
  weekl, energ, mone.yoim, home en mone.yymar). Een app met één vaste
  `themeColor` zonder `media` krijgt dit niet; geef hem dan de twee uit
  `SURFACE`.
- `.avatar-link` op de link om de avatar in de paginakop: de hub
  (`app/(app)/page.tsx`), home (`app/(app)/page.tsx`), energ
  (`components/page-title.tsx`) en mone.yoim (`PageHead` in
  `components/overview.tsx`). weekl (`components/account.tsx`) rondt zijn
  trigger al af met `rounded-[var(--radius-capsule)]` en mone.yymar heeft
  geen avatar in de kop.
- De smallere capsule onderaan werkt vanzelf in de hub, home, energ en
  mone.yymar. weekl en mone.yoim zetten in `app/globals.css` (de capsule die
  bij scrollen inklapt) zelf `max-width: 100vw` op `.navigation`, en die regel
  wint van het DS: maak er `max-width: var(--content-max)` van. `width:
  calc(100% - 2rem)` en de ingeklapte `max-width: var(--klein-b)` blijven.
  De `.onderchrome` van weekl heeft die `max-width` al en blijft dus even breed
  als de capsule.

## 0.5.4

- `Navigation`: op desktop knipte de actieve route de onderkant van zijn label
  af, zoals de staart van de g in "Vandaag". Het label klapt uit binnen een
  span met `overflow: hidden`, en vanaf `--bp-breed` heeft een item
  `line-height: 1`: de regel is dan precies zo hoog als de letter groot is, en
  onderstokken (g, j, p, y) en accenten vallen erbuiten. Het label en zijn span
  krijgen nu boven en onder `0.25em` padding met een even grote negatieve
  margin. Wat geknipt wordt is daardoor hoger, de regel en de capsule niet:
  hoogte en breedte blijven gelijk, dicht en open, op desktop en in de capsule
  onderaan op de telefoon.

Let op bij het bijwerken: niets, alleen de versie ophogen.

## 0.5.3

- `Navigation` met één of twee routes. Geen waarschuwing meer in de console,
  alleen nog bij 0 of meer dan 5. Met twee routes staat de capsule onderaan er
  gewoon. Met één route is er niets om tussen te wisselen: op de telefoon staat
  er geen capsule onderaan, en op desktop staat links alleen het merk, als link
  naar die route (met `aria-current` als je erop staat). Een pil met dezelfde
  naam naast het merk zou twee keer hetzelfde zeggen. Een tik op het merk
  navigeert dan ook op touch, want er zijn geen labels om uit te klappen. De
  rechter capsule (thema, slot, avatar) blijft.
- Nieuwe token `--nav-onder`: wat de capsule onderaan inneemt (`--onder-b` plus
  `--nav-h`), 0 vanaf `--bp-breed` en 0 met één route. `--nav-nu` is met één
  route ook 0. De `<nav>` krijgt dan `data-enkel`, dus iets anders dat moet
  wijken hangt aan `:root:has(.navigation[data-enkel])`.
- `ThemeChoice`: op touch heeft elk segment een tikdoel van 44px, met een
  onzichtbare rand van 6px boven en onder het segment van 32px. Het oogt niet
  groter. Het gekozen segment krijgt een haarlijn in `--border-strong` naast
  zijn glasrand, zodat het ook op een heel licht vlak te zien blijft (in het
  lichte palet van mone.yymar viel wit glas op wit glas weg).
- Nieuw in `@yoim/ds/thema`: `chooseTheme`, `chosenTheme` en `subscribeTheme`,
  de themakeuze als store voor `useSyncExternalStore`. Stonden als kopie in
  mone.yoim, de hub, home en mone.yymar. Een verschil met die kopie:
  `subscribeTheme` volgt nu echt een keuze in een ander tabblad. De kopie
  luisterde wel naar `storage`, maar las daarna `data-thema` van zijn eigen
  `<html>`, dat niet veranderd was. Hij luistert niet meer naar
  `prefers-color-scheme`: dat veranderde `chosenTheme` nooit. Wie het systeem
  wil volgen, gebruikt `subscribeDark`.
- `.schermkolom` begint vanaf `--bp-breed` zelf onder de capsules
  (`padding-top: var(--nav-boven)`), maar alleen als er een `Navigation` op de
  pagina staat. Het inlogscherm, een foutscherm en energ met zijn eigen kop
  houden hun 1rem. De regel heeft de specificiteit van `.schermkolom`, dus een
  regel in de app die later komt wint nog steeds. `.schermkolom` blijft buiten
  een laag: een Tailwind-utility wint er nog steeds niet van.

Let op bij het bijwerken (niet breaking, wel per app):

- Haal de eigen kopie van `subscribeTheme`, `chosenTheme` en `chooseTheme` weg
  en importeer ze uit `@yoim/ds/thema`: mone.yoim (`components/theme.tsx`),
  de hub (`components/theme.ts`), home (`components/theme.tsx`) en mone.yymar
  (`components/nav.tsx`). weekl (`components/thema-schakelaar.tsx`) kan
  `chooseTheme` ook gebruiken; het verschil is alleen dat die van het DS een
  opslag die niet mag overleeft.
- De regel `.schermkolom { padding-top: var(--nav-boven) }` vanaf `--bp-breed`
  in `app/globals.css` kan weg in de hub en weekl. Laten staan breekt niets,
  want hij zet dezelfde waarde.
- `breed:pt-[var(--nav-boven)]` naast `.schermkolom` kan weg: home (`page.tsx`
  en `profiel/page.tsx`) en de takken van energ. Die utility verloor altijd al
  van `.schermkolom` en deed dus niets; nu staat de padding er wel.
- mone.yoim en mone.yymar hoeven hiervoor niets te doen: hun schermen gebruiken
  geen `.schermkolom` maar zetten `breed:pt-[var(--nav-boven)]` zelf, en de
  `.schermkolom` op privacy, voorwaarden en het foutscherm staat zonder
  `Navigation`. Er verdubbelt niets, want het is een `padding-top` en geen
  optelling.
- home kan de regel voor `.nav-thema` in `app/globals.css` weghalen, die staat
  nu in het DS (alleen op touch).
- Een app met één route rekent `--onder-ruimte` op de telefoon met
  `--nav-onder` in plaats van een vaste maat, anders blijft er onderaan ruimte
  voor een capsule die er niet is.

## 0.5.2

- Nieuw: `--botergoud-tekst`, botergoud als tekstkleur, voor het bedrag van de
  vergoeding. In donker is het `--botergoud` (#d9b458); in licht
  `color-mix(in oklab, var(--botergoud) 62%, #000)` (#644b0b). Het ruwe goud haalt
  in licht maar 2,6:1 op de kaart. Contrast van de nieuwe tekstkleur: 8,2:1 op
  `--surface-raised` (#fff), 7,6:1 op `--surface` en 7,0:1 op `--botergoud-soft`;
  in donker 8,3:1 op `--surface-raised` en 9,3:1 op `--surface`.
- Fix: `Navigation` toont geen pil meer als `active` geen route is (zoals op
  Instellingen). Hij stond dan op de eerste route, alsof die actief was.
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
