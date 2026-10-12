# @yoim/ds

Eén waarheid voor look en feel én voor inloggen, voor alle yoim-apps
(yoim.nl, weekl.yoim.nl, energ.yoim.nl, home.yoim.nl). Bronbestanden, geen
build: de app compileert de TypeScript en CSS zelf.

## Gebruiken in een app

```bash
npm i github:yymar/yoim-ds#v0.5.6
```

```ts
// next.config.ts
const nextConfig: NextConfig = { transpilePackages: ['@yoim/ds'] }
```

```css
/* app/globals.css */
@import "tailwindcss";

/* Verplicht. Tailwind v4 scant node_modules niet, en de componenten hieronder
   staan daar. Zonder deze regel komen de tokens en het glas wel door, maar
   worden de utility-klassen uit dit pakket nooit gegenereerd en valt de layout
   van het inlogscherm plat. */
@source "../node_modules/@yoim/ds";

@import "@yoim/ds/styles/tokens.css";
@import "@yoim/ds/styles/glas.css";
@import "@yoim/ds/styles/skeleton.css";
/* Alleen in een app die de auto als studio-render toont (energ): */
@import "@yoim/ds/styles/studio.css";
```

```bash
# .env: alleen op Vercel invullen, lokaal leeg laten. Hiermee geldt de
# sessiecookie voor alle subdomeinen en log je één keer in voor yoim.nl,
# weekl.yoim.nl, energ.yoim.nl en home.yoim.nl samen.
NEXT_PUBLIC_COOKIE_DOMEIN=.yoim.nl
```

```ts
// proxy.ts: de functie uit het pakket, de matcher blijft hier omdat Next die
// statisch uit dit bestand leest.
export { proxy } from '@yoim/ds/auth/proxy'
export const config = { matcher: ['/((?!api/|_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'] }
```

```ts
// lib/supabase/server.ts en client.ts: wikkel met je eigen Database-type en
// eventueel schema.
import { createServerSupabase } from '@yoim/ds/auth/server'
export const createClient = () => createServerSupabase<Database>('energy')
```

```tsx
// app/auth/login/page.tsx
import { InlogPagina } from '@yoim/ds/components/inlog-pagina'
export default async function Login(props: PageProps<'/auth/login'>) {
  const { fout } = await props.searchParams
  return <InlogPagina fout={typeof fout === 'string' ? fout : undefined} host="energ.yoim.nl" />
}
```

## Wat erin zit

- `styles/tokens.css`: kleuren (licht en donker), typografie, maten, motion,
  glas-tokens, `color-scheme` per thema, de Tailwind `@theme`, de utility
  `.veldtekst` voor invoervelden, en de varianten `breed:` en `plannen:`.
- `styles/glas.css`: `.glas`, `.glas-dun`, `.glas-dik`, `.sheen`, `.kaart`,
  `.rij`, `.kop`, `.groepkop`, `.schermkolom`, `.vastekop`, `.postertray`, `.overlay`,
  `.avatar-link` (een ronde focusring om een avatar als link), `.segment` en
  `.segment-*` (de vorm van `SegmentedChoice`), en de
  basisregels voor body, focus en selectie, en de scrollbalken in het thema
  (`.scroll-hoeken` voor een scrollcontainer tegen afgeronde hoeken). Ook de
  vormen van `Navigation` (`.navigation`, `.nav-rechts`, `.nav-*`): op de
  telefoon een capsule onderaan, vanaf `--bp-breed` twee capsules in de
  bovenhoeken. Een `.schermkolom` begint daar vanzelf onder de capsules
  (`padding-top: var(--nav-boven)` zodra er een `.navigation` op de pagina
  staat); een eigen eerste vlak geef je die padding zelf.
  Met één route staat er op de telefoon geen capsule onderaan (de `<nav>` krijgt
  `data-enkel`) en op desktop links alleen het merk. Reken de ruimte onder de
  inhoud daarom met `--nav-onder`, wat de capsule onderaan inneemt (0 vanaf
  `--bp-breed` en met één route), bijvoorbeeld
  `--onder-ruimte: calc(var(--nav-onder) + 2.5rem)`. Voor iets anders dat moet
  wijken: `:root:has(.navigation[data-enkel])`.
  Met twee of meer routes klapt de capsule op de telefoon in tot iconen zodra
  de pagina voorbij 40px gescrold is, en weer uit onder 12px. De `<nav>` krijgt
  dan `data-ingeklapt` en `<html>` krijgt `data-nav-ingeklapt`; op de telefoon
  is `--nav-nu` dan `--nav-h-klein` en `--nav-zak` (anders 0) wat de bovenkant
  van de capsule zakt. Chrome die op de capsule staat, zakt mee met
  `transform: translateY(var(--nav-zak))`. `--nav-onder` blijft de uitgeklapte
  maat, zodat de inhoud tijdens het scrollen niet verspringt. Uitzetten:
  `collapseOnScroll={false}`. Voor een kop die op hetzelfde moment wisselt:
  `useScrolled()` uit `components/navigation`, met dezelfde luisteraar.
- `styles/studio.css` (los te importeren): de auto als studio-render, de
  hero van energ /baymax, ontworpen in Claude Design. Tokens `--studio-spot`,
  `--studio-vloer`, `--studio-vloer-glans`, `--studio-laad`, `--studio-glans`
  (kleuren, licht en donker zoals `tokens.css`: systeem of `data-thema`) en
  `--studio-weg`, `--studio-slaap` (hoe ver de auto dimt, 0 tot 1; slapen dimt
  bijna niet). Klassen `.yoimStudio` (de laag, `position: absolute; inset: 0`),
  daarin `.yoimStudioSpot`, `.yoimStudioVloer`, `.yoimStudioVak` (het
  parkeervak), `.yoimStudioAuto` (de `<picture>` van de auto zonder licht),
  `.yoimStudioGlans.yoimStudioAuto` (met de render als `mask-image`), het licht
  als `<picture>` op zwart met `.yoimStudioAuto yoimStudioLicht` plus
  `.yoimStudioLichtDag` (lichtbalk en achterlichten) of `.yoimStudioLichtVol`
  (daarbij de koplampen), en de inrij-video `.yoimStudioRit.yoimStudioAuto`.
  Alles met `.yoimStudioAuto` krijgt de plaats en maat van de auto.
  - Het licht ligt met `mix-blend-mode: screen` over de auto. Dat mengt alleen
    met wat in dezelfde stacking context ligt, dus tussen de studio en de
    achtergrond van de pagina geen `z-index`, `isolation`, `opacity`,
    `transform`, `filter` of `will-change`; anders tekent het zwart als
    rechthoek.
  - Een voorouder krijgt `data-toestand`: `thuis` (dag-licht), `laadt`
    (dag-licht en een groene vloer die ademt), `slaapt` (lichten uit, geen
    glans), `weg` en `rijdt` (grijs, parkeervak), `los` (niet gekoppeld, 22%);
    buiten thuis en laadt zijn de lichten uit.
  - Welkom: de auto komt in 0,4 s aanzetten (vanaf opacity 0,01, dus meteen
    LCP) met vol licht, dat daarna in 600 ms overgaat in dag.
  - `data-knipper` op `.yoimStudio` of een voorouder: twee flitsen van vol,
    dan terug naar dag (1 s). Haal hem weg op `animationend`; opnieuw is
    weghalen en weer zetten.
  - De video: geef de `<video>` `width` en `height` (de verhouding voordat er
    metadata is). `data-rit="speelt"` op een voorouder zolang hij speelt (dan
    staat alleen de video er), op `ended` `data-rit="klaar"` en zo laten: de
    video vervaagt boven de stilstaande auto met vol licht, wat hetzelfde
    beeld is, en vol gaat over in dag.
  - De glans glijdt om de 11 s. Met `prefers-reduced-motion` geen welkom,
    knipper, video of glans: alles staat stil op dag-licht. Plaats en maat van
    de lagen zet de app zelf.
- `styles/skeleton.css`: laden (zie Laden hieronder). Tokens
  `--skeleton-fill`, `--skeleton-fill-canvas`, `--skeleton-fill-glass`,
  `--skeleton-line` (licht, donker en per `data-thema`), `--skeleton-pulse`,
  `--skeleton-ease`, `--skeleton-delay`, `--skeleton-reveal`; de klok
  (`@property --skeleton-tone`, een pulse op `<html>` zolang er een
  `[data-skeleton]` staat); de klassen `.skeleton-bone`, `.skeleton-line`,
  `.skeleton-circle`, `.skeleton-button`, `.skeleton-image`, `.skeleton-row`,
  `.skeleton-card`, `.skeleton-card-body`, `.skeleton-chart`,
  `.skeleton-calendar`, `.skeleton-page`, `.skeleton-reveal` en
  `.skeleton-stale`. Elke app importeert hem.
- `components/skeleton`: de bouwstenen van een skeleton, server components
  (geen `'use client'`), dus ook in `loading.tsx` en als Suspense-fallback.

  | Component | Props | Wat |
  | --- | --- | --- |
  | `Skeleton` | `width`, `height`, `radius` (`sm` `md` `lg` `xl` `capsule` `full` `none`), `className`, `style` | een vlak |
  | `SkeletonLine` | `size` (`title` `heading` `lead` `body` `small` `caption` `nav`) of `fontSize` + `lineHeight` (px), `width` (getal = %, of `'12ch'`), `variant` | een regel tekst: zo hoog als de regel, het vlak zo hoog als de letters |
  | `SkeletonNumber` | `fontSize`, `lineHeight`, `width` | een groot cijfer, met hoekjes |
  | `SkeletonCircle` | `size` | avatar, icoon, bolletje |
  | `SkeletonButton` | `width`, `height` | capsule |
  | `SkeletonImage` | `width`, `height` (intrinsiek), `radius` | vlak met de verhouding van het beeld |
  | `SkeletonGroupHead` | `title` (vaste tekst), `titleWidth`, `value` (node, of een breedte als string die met een cijfer begint) | de `.groepkop` |
  | `SkeletonRow` | `index`, `leading`, `leadingSize`, `lines`, `title`, `subtitle`, `trailing`, `trailingWidth`, `minHeight`, `padding` (`rij` of `none`), `gap` | een echte `.rij` |
  | `SkeletonCard` | `title`, `titleWidth`, `value`, `rows` + `row`, of `children` (inhoudkaart, p-5), `height`, `padding`, `className` (op de `.kaart`), `area` (`data-vak`), `slot` | groepkop plus kaart, `aria-busy` |
  | `SkeletonChart` | `height`, `xLabels`, `yLabels` | rustig vlak met as en hulplijnen |
  | `SkeletonCalendar` | `columns`, `rows`, `weekdays`, `cellHeight`, `gap` | raster met dagen |
  | `PageSkeleton` | `as`, `className` (de klassen van de echte pagina), `label`, `style` | `aria-busy`, één statusregel |

  `skeletonWidth(index, shift)` geeft per index een breedte in procent (44 tot
  76) die op server en client gelijk is.
- `auth/`: `proxy`, `createServerSupabase`, `createBrowserSupabase`,
  `cookieOptions`, `inlog-fout`, `moment`.
- `components/`: `InlogPagina`, `InlogTray`, `GoogleKnop`, `Klok`, `Merk`,
  `LeegStaat` (`leeg-staat`), `Navigation` en `ThemeChoice` (`navigation`), `StatusLine`
  (`status-line`), `Bar` (`bar`), `DonutList` (`donut-list`), `Amount`
  (`amount`), `SegmentedChoice` en het type `SegmentedOption`
  (`segmented-choice`). Iconen zijn lucide: `lucide-react` is een peer
  dependency, en een icoon geef je mee als element (`icon={<Wallet />}`).

  `SegmentedChoice` is een keuze uit twee tot vier als segmenten in een
  capsule, met een plaatje dat onder de gekozen optie meeglijdt. Een optie
  heeft een `icon`, of met `color` en `initial` een avatar; met `iconOnly`
  alleen het icoon. `description` staat eronder (of met
  `descriptionPlacement="above"` erboven) en wordt voorgelezen als hij
  verandert. `renderSelectedIcon` geeft de gekozen optie een ander icoon.
  `ThemeChoice` is er een dunne laag omheen.

  ```tsx
  import { SegmentedChoice } from '@yoim/ds/components/segmented-choice'

  <SegmentedChoice
    label="Wie kookt"
    options={[
      { id: 'yoran', label: 'Yoran', color: 'var(--member-yoran)', initial: 'Y' },
      { id: 'imke', label: 'Imke', color: 'var(--member-imke)', initial: 'I' },
      { id: 'auto', label: 'Automatisch', icon: <Sparkles size={16} /> },
    ]}
    value={kok}
    onChange={setKok}
  />
  ```
- `money.ts`: `formatAmount` (`−€ 42,18`, `+€ 2.400,00`), `barState` (binnen,
  bijna, over; precies op het budget is binnen) en `heatLevel` (terciles van
  de dagen met uitgaven).
- `thema.ts`: `SURFACE`, `THEMA_SCRIPT`, `THEMA_SLEUTEL`, `themeTip`,
  `nextTheme`, `subscribeDark`, en de keuze als store: `chooseTheme`,
  `chosenTheme` en `subscribeTheme`, voor
  `useSyncExternalStore(subscribeTheme, chosenTheme, () => 'systeem')`.
  De balk boven de app (`theme-color`) volgt de keuze, niet alleen het
  apparaat. Daarvoor zet de app in zijn root-layout twee kleuren, een per
  `prefers-color-scheme`, en `THEMA_SCRIPT` in de `<head>`:

  ```ts
  export const viewport: Viewport = {
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: SURFACE.licht },
      { media: '(prefers-color-scheme: dark)', color: SURFACE.donker },
    ],
  }
  ```

  Bij een keuze krijgt de meta van dat thema `media="all"` en de andere
  `media="not all"`; bij Systeem komt de oorspronkelijke `media` terug
  (`themeColorMedia`). Een enkele `themeColor` zonder `media`, zoals op het
  inlogscherm dat het uur volgt, blijft zoals hij is.
- `scroll.ts`: de stand waarop de capsule inklapt, `nextScrolled` (de
  drempels als pure functie) en de store `subscribeScrolled`/`isScrolled`.
- `week.ts`: de week van dit huishouden, zaterdag tot en met vrijdag. Zit hier
  en niet in een app omdat weekl.yoim.nl en de hub op yoim.nl allebei dezelfde
  week moeten tonen; twee kopieen lopen uit elkaar.

## Laden

Eén manier van laden voor alle apps, ontworpen in Claude Design
(`templates/skeletons/`). Bij twijfel over een maat wint de template.

1. **Wanneer wat.**
   - *Skeleton:* een tab die op data wacht (`loading.tsx`) en een kaart die op
     zijn eigen query wacht (Suspense). Alleen als de vorm vaststaat.
   - *Niets:* wat er misschien niet komt (de foutbalk van energ, `BankNotice`,
     `JointNotice`): `fallback={null}`. Inhoud die al staat en ververst (een
     andere periode, een filter) blijft staan; zet `className="skeleton-stale"`
     en `aria-busy` tijdens de transition, dan dimt hij pas na 150 ms naar 60%.
   - *Inline:* een knop die iets doet houdt zijn breedte, zegt wat hij doet
     ("Ophalen…", "Bezig met inloggen…"), is `disabled` (60%) en krijgt
     `aria-busy`. Nooit een spinner voor een pagina.
2. **De echte layoutklassen, alleen de inhoud is vlak.** Een skeleton gebruikt
   de klassen van de pagina zelf (`schermkolom`, `werkvlak`, `paneel`, `vak`,
   `lijstkolommen`, `plannen`, `zijkolom`, `receptkop`) en de echte `.kaart`,
   `.rij` en `.groepkop`. Zo kloppen breedte, rooster en breekpunten vanzelf.
   Vaste tekst (de paginatitel, "Zet aan om", "Uitgaven", de namen op de hub)
   staat er echt; alleen wat uit de database komt is een vlak.
3. **Precies de maat van wat er komt.** CLS 0. Hoogtes die variëren zijn
   gemeten en staan in de template; bij twijfel liever iets te hoog dan te
   laag. Een beeld krijgt zijn intrinsieke verhouding
   (`SkeletonImage width={1687} height={907}`).
4. **Verschijnen en overnemen.** Het skeleton staat meteen in de layout maar is
   de eerste 150 ms (`--skeleton-delay`) onzichtbaar; daarna een fade van
   200 ms (`--skeleton-reveal`). Wat sneller binnen is, flitst dus nooit. De
   echte inhoud krijgt `.skeleton-reveal`: dezelfde fade, geen sprong.
5. **Eén beweging.** Een pulse in de doorzichtigheid, 1,6 s, `--skeleton-ease`,
   op één klok op `<html>` zolang er een `[data-skeleton]` staat. Een pagina en
   drie kaarten die later binnenkomen lopen in de maat. Geen shimmer (op glas
   leest die als een reflectie, en synchroon over losse blokken kan alleen met
   `background-attachment: fixed`, wat iOS niet doet). `prefers-reduced-motion`
   of `[data-beweging="stil"]`: alles stil op de volle toon, en de fade is 0 ms.
6. **Toegankelijk.** `aria-busy` op het geheel, één `role="status"` sr-only
   "… laden…", elk vlak `aria-hidden`. Een kaart binnen een pagina die al staat
   zegt niets hardop: alleen `aria-busy` op zijn vak.
7. **Licht, donker, glas.** De vulling volgt de ondergrond vanzelf: canvas
   (`--skeleton-fill-canvas`), binnen `.kaart` (`--skeleton-fill`), binnen
   `.glas`, `.glas-dun`, `.glas-dik` (`--skeleton-fill-glass`, een sluier).
   Overschrijven met `data-skeleton-surface="canvas|card|glass"`.

De echte inhoud die een skeleton vervangt krijgt `className="skeleton-reveal"`
en `data-slot` met dezelfde naam als `slot` (of `area`) van het skeleton, voor
de maatcontrole.

## Tweaken en uitrollen

Wijzig hier, `npm test`, commit, tag (`git tag v0.5.6 && git push --tags`, pas als Yoran het zegt).
Per app: `npm i github:yymar/yoim-ds#v0.5.6`, build, deploy. Een app die je
niet bijwerkt blijft op zijn versie.

Ontwerpwerk gebeurt in Claude Design op de bestaande kit en landt hier als
component of token; nooit rechtstreeks in een app buiten de tokens om.
