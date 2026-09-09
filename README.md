# @yoim/ds

Eén waarheid voor look en feel én voor inloggen, voor alle yoim-apps
(yoim.nl, weekl.yoim.nl, energ.yoim.nl, home.yoim.nl). Bronbestanden, geen
build: de app compileert de TypeScript en CSS zelf.

## Gebruiken in een app

```bash
npm i github:yymar/yoim-ds#v0.3.0
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
  glas-tokens, de Tailwind `@theme` en de varianten `breed:` en `plannen:`.
- `styles/glas.css`: `.glas`, `.glas-dun`, `.glas-dik`, `.sheen`, `.kaart`,
  `.rij`, `.kop`, `.schermkolom`, `.vastekop`, `.postertray`, `.overlay`, en de
  basisregels voor body, focus en selectie.
- `auth/`: `proxy`, `createServerSupabase`, `createBrowserSupabase`,
  `cookieOptions`, `inlog-fout`, `moment`.
- `components/`: `InlogPagina`, `InlogTray`, `GoogleKnop`, `Klok`, `Merk`.
- `thema.ts`: `SURFACE`, `THEMA_SCRIPT`, `THEMA_SLEUTEL`.
- `week.ts`: de week van dit huishouden, zaterdag tot en met vrijdag. Zit hier
  en niet in een app omdat weekl.yoim.nl en de hub op yoim.nl allebei dezelfde
  week moeten tonen; twee kopieen lopen uit elkaar.

## Tweaken en uitrollen

Wijzig hier, `npm test`, commit, tag (`git tag v0.3.0 && git push --tags`).
Per app: `npm i github:yymar/yoim-ds#v0.3.0`, build, deploy. Een app die je
niet bijwerkt blijft op zijn versie.

Ontwerpwerk gebeurt in Claude Design op de bestaande kit en landt hier als
component of token; nooit rechtstreeks in een app buiten de tokens om.
