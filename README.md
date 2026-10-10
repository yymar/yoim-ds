# @yoim/ds

Eén waarheid voor look en feel én voor inloggen, voor alle yoim-apps
(yoim.nl, weekl.yoim.nl, energ.yoim.nl, home.yoim.nl). Bronbestanden, geen
build: de app compileert de TypeScript en CSS zelf.

## Gebruiken in een app

```bash
npm i github:yymar/yoim-ds#v0.5.5
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
  `.avatar-link` (een ronde focusring om een avatar als link), en de
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
- `auth/`: `proxy`, `createServerSupabase`, `createBrowserSupabase`,
  `cookieOptions`, `inlog-fout`, `moment`.
- `components/`: `InlogPagina`, `InlogTray`, `GoogleKnop`, `Klok`, `Merk`,
  `LeegStaat` (`leeg-staat`), `Navigation` en `ThemeChoice` (`navigation`), `StatusLine`
  (`status-line`), `Bar` (`bar`), `DonutList` (`donut-list`), `Amount`
  (`amount`). Iconen zijn lucide: `lucide-react` is een peer dependency, en
  een icoon geef je mee als element (`icon={<Wallet />}`).
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
- `week.ts`: de week van dit huishouden, zaterdag tot en met vrijdag. Zit hier
  en niet in een app omdat weekl.yoim.nl en de hub op yoim.nl allebei dezelfde
  week moeten tonen; twee kopieen lopen uit elkaar.

## Tweaken en uitrollen

Wijzig hier, `npm test`, commit, tag (`git tag v0.5.5 && git push --tags`, pas als Yoran het zegt).
Per app: `npm i github:yymar/yoim-ds#v0.5.5`, build, deploy. Een app die je
niet bijwerkt blijft op zijn versie.

Ontwerpwerk gebeurt in Claude Design op de bestaande kit en landt hier als
component of token; nooit rechtstreeks in een app buiten de tokens om.
