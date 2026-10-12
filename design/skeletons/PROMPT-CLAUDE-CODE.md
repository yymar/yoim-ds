# @yoim/ds 0.7.0: skeletons voor alle apps, daarna per app

Eén manier van laden voor yoim.nl, weekl, energ, mone en home. Ontwerp in het design-systemproject:

- `templates/skeletons/Skeletons.dc.html`: principes, tijdlijn, alle bouwstenen in licht en donker, op een kaart, op het canvas en op glas, in rust en met reduced motion.
- `templates/skeletons/Weekl.dc.html`, `Energ.dc.html`, `Mone.dc.html`, `Hub.dc.html`: elke tab op 393, 402, 1280 en 1512, licht en donker. Dit is de bron voor de `loading.tsx` hieronder; bij twijfel over een maat wint de template.
- `templates/skeletons/KaartNiveau.dc.html`: een losse kaart die binnen een staande pagina laadt (Suspense), met de overgang.
- `tokens/skeleton.css`: de tokens en klassen, letterlijk wat `styles/skeleton.css` wordt.
- `templates/skeletons/skeleton.js`: dezelfde bouwstenen als functies, met dezelfde props en dezelfde markup als de React-componenten hieronder.

Volgorde: eerst `yymar/yoim-ds` (0.7.0), dan elke app in een eigen sessie en een eigen commit. Niet breaking: er komen een stylesheet en componenten bij.

## De regels (staan ook in de README van het design system, sectie Laden)

1. **Wanneer wat.**
   - *Skeleton:* een tab die op data wacht (`loading.tsx`) en een kaart die op zijn eigen query wacht (Suspense). Alleen als de vorm vaststaat.
   - *Niets:* wat er misschien niet komt (de foutbalk van energ, `BankNotice`, `JointNotice`): `fallback={null}`. Inhoud die al staat en ververst (een andere periode, een filter) blijft staan; zet `className="skeleton-stale"` en `aria-busy` tijdens de transition, dan dimt hij pas na 150 ms naar 60%.
   - *Inline:* een knop die iets doet houdt zijn breedte, zegt wat hij doet ("Ophalen…", "Bezig met inloggen…"), is `disabled` (60%) en krijgt `aria-busy`. Nooit een spinner voor een pagina.
2. **De echte layoutklassen, alleen de inhoud is vlak.** Een skeleton gebruikt de klassen van de pagina zelf (`schermkolom`, `werkvlak`, `paneel`, `vak`, `lijstkolommen`, `plannen`, `zijkolom`, `receptkop`) en de echte `.kaart`, `.rij` en `.groepkop`. Zo kloppen breedte, rooster en breekpunten vanzelf. Vaste tekst (de paginatitel, "Zet aan om", "Uitgaven", de namen op de hub) staat er echt; alleen wat uit de database komt is een vlak.
3. **Precies de maat van wat er komt.** CLS 0. Hoogtes die variëren zijn gemeten en staan in de template; bij twijfel liever iets te hoog dan te laag. Een beeld krijgt zijn intrinsieke verhouding (`SkeletonImage width={1687} height={907}`).
4. **Verschijnen en overnemen.** Het skeleton staat meteen in de layout maar is de eerste 150 ms (`--skeleton-delay`) onzichtbaar; daarna een fade van 200 ms (`--skeleton-reveal`). Wat sneller binnen is, flitst dus nooit. De echte inhoud krijgt `.skeleton-reveal`: dezelfde fade, geen sprong.
5. **Eén beweging.** Een pulse in de doorzichtigheid, 1,6 s, `--skeleton-ease`, op één klok op `<html>` zolang er een `[data-skeleton]` staat. Een pagina en drie kaarten die later binnenkomen lopen in de maat. Geen shimmer (op glas leest die als een reflectie, en synchroon over losse blokken kan alleen met `background-attachment: fixed`, wat iOS niet doet). `prefers-reduced-motion` of `[data-beweging="stil"]`: alles stil op de volle toon, en de fade is 0 ms.
6. **Toegankelijk.** `aria-busy` op het geheel, één `role="status"` sr-only "… laden…", elk vlak `aria-hidden`. Een kaart binnen een pagina die al staat zegt niets hardop: alleen `aria-busy` op zijn vak.
7. **Licht, donker, glas.** De vulling volgt de ondergrond vanzelf: canvas (`--skeleton-fill-canvas`), binnen `.kaart` (`--skeleton-fill`), binnen `.glas`, `.glas-dun`, `.glas-dik` (`--skeleton-fill-glass`, een sluier). Overschrijven met `data-skeleton-surface="canvas|card|glass"`.

## 1. In `yymar/yoim-ds`

### `styles/skeleton.css`
Kopieer `tokens/skeleton.css` uit het design-systemproject letterlijk naar `styles/skeleton.css`. Daar staan de tokens (`--skeleton-fill`, `--skeleton-fill-canvas`, `--skeleton-fill-glass`, `--skeleton-line` in licht, donker en per `data-thema`; `--skeleton-pulse`, `--skeleton-ease`, `--skeleton-delay`, `--skeleton-reveal`), de klok (`@property --skeleton-tone`) en de klassen (`.skeleton-bone`, `.skeleton-line`, `.skeleton-circle`, `.skeleton-button`, `.skeleton-image`, `.skeleton-row`, `.skeleton-card`, `.skeleton-card-body`, `.skeleton-chart`, `.skeleton-calendar`, `.skeleton-page`, `.skeleton-reveal`, `.skeleton-stale`). Los bestand zoals `studio.css`, maar elke app importeert hem.

Lightning CSS laat `@property` en de custom property in `@keyframes` staan; controleer dat in de build van één app (de pulse moet in Chrome en Safari lopen).

### `components/skeleton.tsx`
Server components, geen `'use client'`. Namen in het Engels (CLAUDE.md: code is Engels); in de brief stonden ze als voorbeeld in het Nederlands (`SkeletonRegel` is `SkeletonLine`, `SkeletonRij` is `SkeletonRow`, `SkeletonKaart` is `SkeletonCard`).

```tsx
import type { CSSProperties, ReactNode } from 'react'

/*
 * Laden: de bouwstenen van een skeleton. Server components, geen 'use client':
 * ze renderen alleen klassen uit styles/skeleton.css en werken dus ook in
 * loading.tsx en als Suspense-fallback zonder JavaScript.
 *
 * Elk vlak draagt data-skeleton en aria-hidden; de klok van de pulse loopt op
 * <html> zolang er een data-skeleton op de pagina staat.
 */

type Length = number | string
type Radius = 'sm' | 'md' | 'lg' | 'xl' | 'capsule' | 'full' | 'none'
export type SkeletonTextSize = 'title' | 'heading' | 'lead' | 'body' | 'small' | 'caption' | 'nav'

const px = (v?: Length) => (typeof v === 'number' ? `${v}px` : v)
const percent = (v?: Length) => (typeof v === 'number' ? `${v}%` : v)
const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ')

const RADIUS: Record<Radius, string> = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  capsule: 'var(--radius-capsule)',
  full: '50%',
  none: '0',
}

const WIDTHS = [64, 48, 76, 56, 70, 44, 60, 52, 68, 58]

/** Een breedte in procent die per index verschilt maar op server en client gelijk is. */
export function skeletonWidth(index: number, shift = 0): number {
  return WIDTHS[(((index + shift) % WIDTHS.length) + WIDTHS.length) % WIDTHS.length]
}

export function Skeleton({
  width,
  height,
  radius = 'sm',
  className,
  style,
}: {
  width?: Length
  height?: Length
  radius?: Radius
  className?: string
  style?: CSSProperties
}) {
  return (
    <span
      data-skeleton=""
      aria-hidden
      className={cx('skeleton-bone', className)}
      style={{ width: px(width), height: px(height), borderRadius: RADIUS[radius], ...style }}
    />
  )
}

export type SkeletonLineProps = {
  /** Een tekststijl uit de tokens. Genegeerd als fontSize gezet is. */
  size?: SkeletonTextSize
  /** Eigen maat in px, voor een regel die niet op een tekststijl staat (text-[13px]). */
  fontSize?: number
  lineHeight?: number
  /** Getal = procent van de ouder, string = letterlijk ('12ch', '40%'). */
  width?: Length
  variant?: 'text' | 'number'
  style?: CSSProperties
}

export function SkeletonLine({
  size = 'body',
  fontSize,
  lineHeight = 1.5,
  width = '60%',
  variant,
  style,
}: SkeletonLineProps) {
  return (
    <span
      data-skeleton=""
      aria-hidden
      className="skeleton-line"
      data-size={fontSize ? undefined : size}
      data-variant={variant === 'number' ? 'number' : undefined}
      style={
        {
          ...(fontSize ? { '--skeleton-fs': `${fontSize}px`, '--skeleton-lh': lineHeight } : {}),
          width: percent(width),
          ...style,
        } as CSSProperties
      }
    />
  )
}

/** Een groot cijfer: 72%, 106,9 km, € 0,242. */
export function SkeletonNumber({
  fontSize = 30,
  lineHeight = 1.15,
  width = '5ch',
  style,
}: {
  fontSize?: number
  lineHeight?: number
  width?: Length
  style?: CSSProperties
}) {
  return <SkeletonLine fontSize={fontSize} lineHeight={lineHeight} width={width} variant="number" style={style} />
}

export function SkeletonCircle({ size = 36, style }: { size?: number; style?: CSSProperties }) {
  return <Skeleton width={size} height={size} radius="full" className="skeleton-circle" style={style} />
}

export function SkeletonButton({ width = 120, height = 48 }: { width?: Length; height?: Length }) {
  return <Skeleton width={width} height={height} radius="capsule" className="skeleton-button" />
}

/** Een beeld met zijn intrinsieke maat, zodat de <img width height> er straks precies in valt. */
export function SkeletonImage({
  width,
  height,
  radius = 'lg',
  style,
}: {
  /** Intrinsieke breedte van het beeld, bijvoorbeeld 1687. */
  width: number
  /** Intrinsieke hoogte, bijvoorbeeld 907. */
  height: number
  radius?: Radius
  style?: CSSProperties
}) {
  return (
    <Skeleton
      radius={radius}
      className="skeleton-image"
      style={{ aspectRatio: `${width} / ${height}`, ...style }}
    />
  )
}

/**
 * De titel boven een kaart. Staat de tekst vast ("Zet aan om", "Uitgaven"),
 * dan is hij echt; anders een regel. value: een vaste node (Alles ›), of een
 * breedte voor een regel rechts.
 */
export function SkeletonGroupHead({
  title,
  titleWidth = '38%',
  value,
}: {
  title?: ReactNode
  titleWidth?: Length
  value?: ReactNode | Length | true
}) {
  const right =
    value === undefined || value === false ? null : value === true || typeof value === 'number' || (typeof value === 'string' && /^\d/.test(value)) ? (
      <SkeletonLine fontSize={13} lineHeight={1.3} width={value === true ? '7ch' : (value as Length)} />
    ) : (
      value
    )

  return (
    <h2 className="groepkop">
      {title ? <span>{title}</span> : <SkeletonLine fontSize={13} lineHeight={1.3} width={titleWidth} />}
      {right}
    </h2>
  )
}

export type SkeletonRowProps = {
  /** Varieert de breedtes van de tekst. Geef de index in de lijst mee. */
  index?: number
  leading?: 'icon' | 'avatar' | 'bullet' | 'logo' | 'none' | ReactNode
  leadingSize?: number
  lines?: 1 | 2
  title?: { fontSize?: number; lineHeight?: number; width?: Length }
  subtitle?: { fontSize?: number; lineHeight?: number; width?: Length }
  trailing?: 'amount' | 'pill' | 'chevron' | 'none' | ReactNode
  trailingWidth?: Length
  minHeight?: Length
  /** 'rij' is de padding van .rij; 'none' voor een lijst die zijn ruimte op de kaart zet (mone). */
  padding?: 'rij' | 'none'
  gap?: Length
}

export function SkeletonRow({
  index = 0,
  leading = 'icon',
  leadingSize = 36,
  lines = 2,
  title = {},
  subtitle = {},
  trailing = 'amount',
  trailingWidth = '7ch',
  minHeight,
  padding = 'rij',
  gap,
}: SkeletonRowProps) {
  const before =
    leading === 'icon' || leading === 'avatar' || leading === 'bullet' ? (
      <SkeletonCircle size={leadingSize} />
    ) : leading === 'logo' ? (
      <Skeleton width={leadingSize} height={leadingSize} />
    ) : leading === 'none' ? null : (
      leading
    )

  const after =
    trailing === 'amount' ? (
      <SkeletonLine fontSize={15} lineHeight={1.3} width={trailingWidth} variant="number" />
    ) : trailing === 'pill' ? (
      <Skeleton width={56} height={24} radius="capsule" />
    ) : trailing === 'chevron' ? (
      <Skeleton width={8} height={14} radius="capsule" />
    ) : trailing === 'none' ? null : (
      trailing
    )

  return (
    <div
      aria-hidden
      className="rij skeleton-row"
      data-padding={padding}
      style={{ minHeight: px(minHeight), gap: px(gap) }}
    >
      {before}
      <span className="skeleton-row-text">
        <SkeletonLine
          fontSize={title.fontSize ?? 15}
          lineHeight={title.lineHeight ?? 1.3}
          width={title.width ?? skeletonWidth(index)}
        />
        {lines > 1 ? (
          <SkeletonLine
            fontSize={subtitle.fontSize ?? 13}
            lineHeight={subtitle.lineHeight ?? 1.25}
            width={subtitle.width ?? skeletonWidth(index, 3) - 8}
          />
        ) : null}
      </span>
      {after}
    </div>
  )
}

export type SkeletonCardProps = {
  /** Vaste titel boven de kaart (.groepkop). Weglaten voor een kaart die zichzelf uitlegt. */
  title?: ReactNode
  /** Een titel die uit data komt: alleen de breedte van de regel. */
  titleWidth?: Length
  value?: ReactNode | Length | true
  /** Lijstkaart: zoveel rijen. */
  rows?: number
  row?: Omit<SkeletonRowProps, 'index'>
  /** Inhoudkaart (p-5): de inhoud. */
  children?: ReactNode
  /** Vaste hoogte van de .kaart, gemeten aan de echte kaart. */
  height?: Length
  padding?: Length
  /** Klassen op de .kaart, bijvoorbeeld 'px-4 py-1' in mone. */
  className?: string
  /** data-vak, zodat het skeleton in het rooster van de app op zijn plek valt. */
  area?: string
  /** Naam voor de maatcontrole (data-skeleton-slot tegenover data-slot op de echte kaart). */
  slot?: string
  style?: CSSProperties
}

export function SkeletonCard({
  title,
  titleWidth,
  value,
  rows,
  row,
  children,
  height,
  padding,
  className,
  area,
  slot,
  style,
}: SkeletonCardProps) {
  return (
    <div
      data-skeleton=""
      aria-busy
      data-vak={area}
      data-skeleton-slot={slot ?? area}
      className="skeleton-card flex min-w-0 flex-col"
      style={style}
    >
      {title || titleWidth ? <SkeletonGroupHead title={title} titleWidth={titleWidth} value={value} /> : null}
      <div aria-hidden className={cx('kaart', className)} style={{ height: px(height) }}>
        {rows
          ? Array.from({ length: rows }, (_, i) => <SkeletonRow key={i} index={i} {...row} />)
          : children !== undefined
            ? <div className="skeleton-card-body" style={{ padding: px(padding) }}>{children}</div>
            : null}
      </div>
    </div>
  )
}

/** Een rustig vlak met een basislijn en hulplijnen. Geen nep-staafjes. */
export function SkeletonChart({
  height = 200,
  xLabels = 6,
  yLabels = 0,
  className,
}: {
  height?: Length
  xLabels?: number
  yLabels?: number
  className?: string
}) {
  return (
    <div data-skeleton="" aria-hidden className={cx('skeleton-chart', className)} style={{ height: px(height) }}>
      <div className="flex min-h-0 flex-1 gap-2">
        {yLabels ? (
          <span className="flex flex-col justify-between pb-5">
            {Array.from({ length: yLabels }, (_, i) => <SkeletonLine key={i} fontSize={11} lineHeight={1.3} width="4ch" />)}
          </span>
        ) : null}
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="skeleton-chart-plot" />
          {xLabels ? (
            <div className="skeleton-chart-axis">
              {Array.from({ length: xLabels }, (_, i) => <SkeletonLine key={i} fontSize={11} lineHeight={1.3} width="3ch" />)}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/** Een maandkalender: weekdagen erboven, het raster staat, de dagen zijn vlakken. */
export function SkeletonCalendar({
  columns = 7,
  rows = 5,
  weekdays = true,
  cellHeight,
  gap = 4,
}: {
  columns?: number
  rows?: number
  weekdays?: boolean
  /** Weglaten voor vierkante cellen. */
  cellHeight?: number
  gap?: number
}) {
  return (
    <div
      data-skeleton=""
      aria-hidden
      className="skeleton-calendar"
      data-cell={cellHeight ? 'fixed' : undefined}
      style={
        {
          '--skeleton-columns': columns,
          '--skeleton-gap': `${gap}px`,
          '--skeleton-cell-h': px(cellHeight),
        } as CSSProperties
      }
    >
      {weekdays
        ? Array.from({ length: columns }, (_, i) => (
            <span key={`d${i}`} className="skeleton-calendar-head">
              <SkeletonLine fontSize={11} lineHeight={1.5} width="2ch" />
            </span>
          ))
        : null}
      {Array.from({ length: columns * rows }, (_, i) => <Skeleton key={i} className="skeleton-calendar-cell" />)}
    </div>
  )
}

/**
 * De pagina die laadt. Eén statusregel voor de schermlezer, aria-busy op het
 * geheel. className: de klassen van de echte pagina (schermkolom, het rooster),
 * zodat de ruimte onder de navigatie en de kolom vanzelf kloppen.
 */
export function PageSkeleton({
  as: Tag = 'main',
  className = 'schermkolom',
  label = 'Laden…',
  style,
  children,
}: {
  as?: 'main' | 'div' | 'section'
  className?: string
  label?: string
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <Tag data-skeleton="" aria-busy className={cx('skeleton-page', className)} style={style}>
      <span role="status" className="sr-only">
        {label}
      </span>
      {children}
    </Tag>
  )
}
```

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

### `components/skeleton.test.ts`
`skeletonWidth` is pure logica, dus een test ernaast:

```ts
import { describe, expect, it } from 'vitest'

import { skeletonWidth } from './skeleton'

describe('skeletonWidth', () => {
  it('geeft per index een vaste breedte', () => {
    expect(skeletonWidth(0)).toBe(64)
    expect(skeletonWidth(1)).toBe(48)
    expect(skeletonWidth(3, 2)).toBe(skeletonWidth(5))
  })

  it('loopt rond en blijft tussen 44 en 76 procent', () => {
    for (let i = -20; i < 40; i++) {
      const w = skeletonWidth(i)
      expect(w).toBeGreaterThanOrEqual(44)
      expect(w).toBeLessThanOrEqual(76)
    }
    expect(skeletonWidth(10)).toBe(skeletonWidth(0))
  })
})
```

### Verder in het pakket
- `README.md`: in "Gebruiken in een app" de regel `@import "@yoim/ds/styles/skeleton.css";` onder `glas.css`, en bij "Wat erin zit" `styles/skeleton.css` en `components/skeleton` met de tabel hierboven. Neem de zeven regels hierboven over als sectie "Laden".
- `CLAUDE.md`, bij de invarianten: "Een pagina laadt in de vorm van wat er komt: `PageSkeleton` en `SkeletonCard` met de layoutklassen van de echte pagina, nooit een spinner. Vaste tekst is echt, alleen data is een vlak."
- `CHANGELOG.md`, blok **0.7.0**: nieuw `styles/skeleton.css` en `components/skeleton`; de regels in het kort; "Let op bij het bijwerken" met per app de punten uit sectie 2 hieronder (het pakket breekt niets, maar elke app vervangt zijn eigen laadstaat).
- `package.json`: `version` naar `0.7.0`. De exports dekken `./styles/*` en `./components/*` al.
- `npm test`, `npm run typecheck`, commit. Tag `v0.7.0` pas als Yoran het zegt.

## 2. Per app

Elke app: pin `github:yymar/yoim-ds#v0.7.0`, zet in `app/globals.css` onder de import van `glas.css`:

```css
@import "@yoim/ds/styles/skeleton.css";
```

en geef de echte inhoud die een skeleton vervangt `className="skeleton-reveal"` (het wortelelement van een kaart of de `<main>` van een pagina) en `data-slot="<naam>"` met dezelfde naam als `slot`/`area` van het skeleton, voor de maatcontrole in sectie 3.

### mone.yoim

**Eerst de kaartregel van 0.5.1 afmaken.** `Group` (`components/budgets.tsx:40`) zet zijn titel nog als eigen `h2` (`px-1 pt-1 text-[13px]`, 4px hoger en 6,6px hoger dan `.groepkop`) met `gap-2` naar de kaart. Maak er `<h2 className="groepkop">` van en haal de `gap-2` van de `section` (de groepkop heeft zijn eigen 8px). Pas daarna kloppen de skeletons per pixel, en is mone gelijk aan de andere apps. De dagkoppen van Transacties (`DayList`, `account-view.tsx:670`) blijven zoals ze zijn; het skeleton tekent die met `fontSize={13} lineHeight={1.5}` en `px-1 pt-1`.

**Wat weg kan:** `components/page-loading.tsx`.

**Eén plek voor de paginaklassen.** De `<main>` van elke route en het skeleton moeten dezelfde klassen hebben. Zet de string in `components/page.ts` en gebruik hem in de routes en in de skeletons:

```ts
export const PAGE_CLASS =
  'mx-auto flex w-full max-w-[var(--content-max)] flex-col gap-4 px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(var(--onder-ruimte)+env(safe-area-inset-bottom))] breed:gap-5 breed:px-10 breed:pt-[var(--nav-boven)] plannen:max-w-[1000px]'
```

**`components/skeletons.tsx`** (gedeeld door de drie routes):

```tsx
import type { ReactNode } from 'react'
import { Skeleton, SkeletonCard, SkeletonCircle, SkeletonLine, SkeletonNumber, type SkeletonRowProps } from '@yoim/ds/components/skeleton'

/** Een rij van mone: 60px, badge van 36, geen eigen padding (die staat op de kaart). */
export const ROW: Omit<SkeletonRowProps, 'index'> = { leadingSize: 36, minHeight: 60, padding: 'none', gap: 12 }
export const LIST = 'flex flex-col gap-0.5 px-4 py-1'

/** Dezelfde maat als PageHead: 48px op de telefoon; vanaf breed alleen wat rechts staat. */
export function HeadSkeleton({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className={`flex items-center justify-between gap-3 pl-2 breed:justify-end breed:pl-0 ${children ? '' : 'breed:contents'}`}>
      <h1 className="flex-1 text-[30px] font-semibold tracking-[-0.02em] breed:sr-only">{title}</h1>
      {children}
      <span aria-hidden className="flex items-center gap-2 breed:hidden">
        <span className="grid size-12 place-items-center"><SkeletonCircle size={22} /></span>
        <span className="grid size-12 place-items-center"><SkeletonCircle size={36} /></span>
      </span>
    </div>
  )
}

export function PeriodNavSkeleton({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden data-skeleton-surface="card" className={`flex h-12 items-center rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-0.5 ${className}`}>
      <span className="grid size-12 place-items-center"><Skeleton width={8} height={14} radius="capsule" /></span>
      <SkeletonLine size="small" width="13ch" />
      <span className="grid size-12 place-items-center"><Skeleton width={8} height={14} radius="capsule" /></span>
    </div>
  )
}

export function DaySkeleton({ rows, index }: { rows: number; index: number }) {
  return (
    <section className="flex flex-col gap-1.5">
      <div className="flex justify-between px-1 pt-1">
        <SkeletonLine fontSize={13} lineHeight={1.5} width={`${[18, 14, 16][index % 3]}ch`} />
        <SkeletonNumber fontSize={13} lineHeight={1.5} width="7ch" />
      </div>
      <SkeletonCard rows={rows} row={ROW} className={LIST} slot={`dag-${index}`} />
    </section>
  )
}

export function BudgetRowSkeleton({ index }: { index: number }) {
  return (
    <div aria-hidden className={`grid grid-cols-[36px_1fr] gap-3.5 py-3 ${index ? 'border-t border-[var(--border)]' : ''}`}>
      <SkeletonCircle size={36} />
      <div className="flex flex-col gap-2">
        <div className="flex min-h-5 items-center justify-between">
          <SkeletonLine fontSize={15} lineHeight={1.33} width={`${[54, 38, 66][index % 3]}%`} />
          <SkeletonNumber fontSize={15} lineHeight={1.33} width="7ch" />
        </div>
        <Skeleton width="100%" height={6} radius="capsule" />
        <SkeletonLine fontSize={12} lineHeight={1.5} width={`${[44, 60, 52][index % 3]}%`} />
      </div>
    </div>
  )
}
```

Elke rij van `BudgetRowSkeleton` heeft een haarlijn bovenaan; de echte `BudgetRow` heeft er in de lijst ook een. Controleer dat in de app; heeft de echte er geen, haal dan de `border-t` weg.

**`app/(app)/transacties/loading.tsx`:**

```tsx
import { PageSkeleton, SkeletonButton, SkeletonCard, SkeletonCircle, SkeletonLine, SkeletonNumber, Skeleton } from '@yoim/ds/components/skeleton'
import { PAGE_CLASS } from '@/components/page'
import { DaySkeleton, HeadSkeleton } from '@/components/skeletons'

function Chip({ i }: { i: number }) {
  return (
    <div aria-hidden className="glas-dun flex h-12 flex-none items-center gap-2 rounded-[14px] pr-3.5 pl-1.5">
      <Skeleton width={32} height={32} />
      <div className="flex flex-col">
        <SkeletonLine fontSize={13} lineHeight={1.3} width={`${[9, 7, 8][i]}ch`} />
        <SkeletonNumber fontSize={12} lineHeight={1.3} width="7ch" />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <PageSkeleton className={`${PAGE_CLASS} min-h-[calc(100dvh+360px)]`} label="Transacties laden…">
      <HeadSkeleton title="Transacties" />
      {/* De kop met saldo, rekeningen en filters: op glas, zoals AccountHeader. Initieel 170px (fold.tsx:296). */}
      <div data-skeleton-slot="fold" className="glas sheen flex flex-col gap-3 rounded-[var(--radius-lg)] px-3.5 pt-3.5 pb-0.5 breed:px-[18px] breed:pt-[18px]">
        <div className="flex items-center justify-between gap-3">
          <SkeletonNumber fontSize={26} width="9ch" />
          <SkeletonButton width={104} height={44} />
        </div>
        <div className="flex gap-2 overflow-hidden">{[0, 1, 2].map((i) => <Chip key={i} i={i} />)}</div>
        <div className="-mx-3.5 h-px bg-[var(--glass-border)]" />
        <div className="flex min-h-11 items-center gap-2">
          <SkeletonButton width={116} height={36} />
          <SkeletonButton width={128} height={36} />
          <span className="ml-auto grid size-11 place-items-center"><SkeletonCircle size={36} /></span>
        </div>
      </div>
      <div className="zijkolom flex flex-col gap-4 breed:gap-5 plannen:grid plannen:items-start">
        <aside className="flex flex-col gap-4 plannen:sticky plannen:order-2 plannen:gap-5">
          {/* Telefoon en breed: BudgetsLine. */}
          <div aria-hidden className="kaart flex min-h-[60px] items-center gap-3 px-3 py-2.5 plannen:hidden">
            <SkeletonCircle size={36} />
            <div className="flex flex-1 flex-col gap-1.5">
              <SkeletonLine fontSize={15} lineHeight={1.3} width="44%" />
              <Skeleton width="100%" height={5} radius="capsule" />
            </div>
          </div>
          {/* Vanaf plannen: BudgetsCard. */}
          <div className="hidden plannen:block">
            <SkeletonCard title="Budgetten" value={<span className="font-medium">Alles ›</span>} padding={18} slot="budgetten">
              <SkeletonNumber fontSize={24} lineHeight={1.2} width="7ch" />
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="grid min-h-[52px] grid-cols-[28px_1fr_auto] items-center gap-2.5">
                  <SkeletonCircle size={28} />
                  <div className="flex flex-col gap-1.5">
                    <SkeletonLine fontSize={14} lineHeight={1.3} width={`${[64, 48, 76, 56, 70][i]}%`} />
                    <Skeleton width="100%" height={5} radius="capsule" />
                  </div>
                  <SkeletonNumber fontSize={13} lineHeight={1.3} width="6ch" />
                </div>
              ))}
            </SkeletonCard>
          </div>
        </aside>
        <div className="flex flex-col gap-4 breed:gap-5">
          <DaySkeleton index={0} rows={3} />
          <DaySkeleton index={1} rows={4} />
          <DaySkeleton index={2} rows={3} />
          <DaySkeleton index={3} rows={4} />
        </div>
      </div>
    </PageSkeleton>
  )
}
```

Controleer de structuur van `.zijkolom` tegen `transacties/page.tsx:117`: de aside staat daar vóór de lijst en gaat op plannen met `order-2` naar rechts. Neem precies die volgorde en die klassen over; het skeleton hierboven volgt hem.

**`app/(app)/inzicht/loading.tsx`:**

```tsx
import { PageSkeleton, SkeletonButton, SkeletonCalendar, SkeletonCard, SkeletonCircle, SkeletonLine, SkeletonNumber, Skeleton } from '@yoim/ds/components/skeleton'
import { PAGE_CLASS } from '@/components/page'
import { HeadSkeleton, LIST, PeriodNavSkeleton, ROW } from '@/components/skeletons'

export default function Loading() {
  return (
    <PageSkeleton className={PAGE_CLASS} label="Inzicht laden…">
      <HeadSkeleton title="Inzicht"><PeriodNavSkeleton className="hidden breed:flex" /></HeadSkeleton>
      <div className="flex justify-center breed:hidden"><PeriodNavSkeleton /></div>
      <SkeletonCard title="Gezamenlijke rekening" value="9ch" className="[&>.skeleton-card-body]:gap-5 plannen:[&>.skeleton-card-body]:p-6" slot="gezamenlijk">
        <SkeletonLine fontSize={15} lineHeight={1.4} width="40%" />
        <SkeletonNumber fontSize={28} width="8ch" />
        <span className="plannen:hidden"><SkeletonButton width={120} height={44} /></span>
        <div className="hidden grid-cols-3 gap-6 plannen:grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-1">
              <SkeletonLine fontSize={13} lineHeight={1.3} width="60%" />
              <SkeletonNumber fontSize={17} lineHeight={1.25} width="6ch" />
            </div>
          ))}
        </div>
      </SkeletonCard>
      <div className="flex flex-col gap-4 plannen:grid plannen:grid-cols-2 plannen:items-start plannen:gap-6">
        <SkeletonCard title="Overzicht" className="[&>.skeleton-card-body]:gap-0" slot="overzicht">
          <div className="flex min-h-[58px] items-center justify-between">
            <div className="flex flex-col gap-1">
              <SkeletonLine fontSize={13} lineHeight={1.3} width="10ch" />
              <SkeletonNumber fontSize={30} width="8ch" />
            </div>
            <SkeletonButton width={84} height={32} />
          </div>
          <Skeleton width="100%" height={230} radius="md" style={{ marginTop: 20 }} />
          <div className="grid grid-cols-2 gap-y-0.5 pt-2.5">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex min-h-8 items-center gap-2">
                <SkeletonCircle size={10} />
                <SkeletonLine fontSize={13} lineHeight={1.3} width={`${[58, 42, 70, 50, 64, 38][i]}%`} />
              </div>
            ))}
          </div>
        </SkeletonCard>
        <div className="contents plannen:flex plannen:flex-col plannen:gap-6">
          <div className="-order-1 plannen:order-none">
            <SkeletonCard title="Vaste lasten en abonnementen" className="[&>.skeleton-card-body]:gap-4" slot="vaste-lasten">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex min-h-8 items-center gap-3">
                  <SkeletonCircle size={28} />
                  <span className="flex-1"><SkeletonLine fontSize={15} lineHeight={1.33} width={`${[64, 52, 70, 46][i]}%`} /></span>
                  <SkeletonNumber fontSize={15} lineHeight={1.33} width="7ch" />
                </div>
              ))}
            </SkeletonCard>
          </div>
          <SkeletonCard title="Per dag" value="9ch" className="[&>.skeleton-card-body]:gap-2.5" slot="per-dag">
            <SkeletonCalendar rows={5} />
          </SkeletonCard>
        </div>
        <SkeletonCard title="Uitgaven" value="8ch" rows={5} row={ROW} className={LIST} slot="uitgaven" />
        <SkeletonCard title="Inkomsten" value="8ch" rows={2} row={ROW} className={LIST} slot="inkomsten" />
      </div>
    </PageSkeleton>
  )
}
```

De gezamenlijke rekening staat erin omdat jullie er een hebben; laat hem weg als `JointSection` voor dit huishouden ooit `null` kan zijn bij het eerste laden. De `-order-1` volgt de echte `RecurringCard`: kijk in `inzicht/page.tsx` waar die klasse precies staat en zet hem op hetzelfde element.

**`app/(app)/budgetten/loading.tsx`:** de budgetrijen staan in een kaart met `px-4 py-1`, dus de kaart staat hier uitgeschreven:

```tsx
import { PageSkeleton, SkeletonButton, SkeletonLine } from '@yoim/ds/components/skeleton'
import { PAGE_CLASS } from '@/components/page'
import { BudgetRowSkeleton, HeadSkeleton, PeriodNavSkeleton } from '@/components/skeletons'

function Budgets({ title, note, slot }: { title: string; note: string; slot: string }) {
  return (
    <div data-skeleton="" aria-busy data-skeleton-slot={slot} className="skeleton-card flex min-w-0 flex-col">
      <h2 className="groepkop">
        <span>{title}</span>
        <span className="flex items-baseline gap-1 font-medium"><SkeletonLine fontSize={13} lineHeight={1.3} width="7ch" />{note}</span>
      </h2>
      <div aria-hidden className="kaart px-4 py-1">
        {[0, 1, 2].map((i) => <BudgetRowSkeleton key={i} index={i} />)}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <PageSkeleton className={PAGE_CLASS} label="Budgetten laden…">
      <HeadSkeleton title="Budgetten">
        <PeriodNavSkeleton className="hidden breed:flex" />
        <span className="hidden breed:block"><SkeletonButton width={148} height={48} /></span>
      </HeadSkeleton>
      <div className="flex justify-center breed:hidden"><PeriodNavSkeleton /></div>
      <div className="flex flex-col gap-4 plannen:grid plannen:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] plannen:items-start plannen:gap-5">
        <Budgets title="Potjes" note="nog in potje" slot="potjes" />
        <Budgets title="Vaste lasten" note="nog af te schrijven" slot="vaste-lasten" />
      </div>
      <div className="flex justify-center breed:hidden"><SkeletonButton width={176} height={48} /></div>
    </PageSkeleton>
  )
}
```

**Profiel** heeft nog geen `loading.tsx`. Niet in deze ronde; wel dezelfde aanpak als er een komt.

### energ.yoim

**Wat weg kan:**
- `components/skeleton.tsx`.
- In `app/globals.css`: `.paneel [data-vak].skeleton` met zijn `animation`, `@keyframes skeleton`, de reduced-motion-regel ervoor en de hele lijst `.skeleton[data-vak=…] { min-height }` met de twee media queries. De hoogtes staan nu op de skeletons zelf.
- Het opkomen van de blokken (`.paneel [data-vak] { animation: opkomen … }`, de `animation-delay` per vak en de reduced-motion-regel): één beweging, dus de echte inhoud krijgt `.skeleton-reveal`. Zet die klasse op het wortelelement van elke kaart (`CardGroup`, `Prijzennu`, `section.autokaart`, de curve, `Meer`), of één keer in `CardGroup` en de vier losse.

**De vier bugs van nu verdwijnen daarmee:** het podium op BaYmax klapte vanaf 768px in (geen hoogte buiten `.paneel`), Laadkosten had geen hoogte (2px rand), geen skeleton had de groepkop (25px te laag), de curve was een kaart terwijl de echte curve geen kaart is, en op BaYmax en Geld pulseerde niets.

**`components/skeletons.tsx`:** één skeleton per vak, met de gemeten hoogtes (393, 800 en 1440, uit `globals.css`, nu min de groepkop van 25px voor de kaart):

```tsx
import { Skeleton, SkeletonButton, SkeletonCalendar, SkeletonCard, SkeletonChart, SkeletonCircle, SkeletonImage, SkeletonLine, SkeletonNumber, skeletonWidth } from '@yoim/ds/components/skeleton'

export function PricesSkeleton() {
  return (
    <div data-skeleton="" aria-busy data-vak="prijzen" data-skeleton-slot="prijzen" className="skeleton-card">
      <div aria-hidden className="kaart flex h-[137px]">
        <div className="flex flex-1 flex-col justify-center gap-1.5 px-4 py-2.5">
          <SkeletonLine size="nav" width="7ch" />
          <SkeletonNumber fontSize={32} width="7ch" />
          <SkeletonLine fontSize={15} lineHeight={1.4} width="86%" />
        </div>
        <div className="flex w-[38%] flex-none flex-col justify-center gap-1.5 border-l border-[var(--border)] px-4 py-2.5">
          <SkeletonLine size="nav" width="4ch" />
          <SkeletonNumber fontSize={24} width="6ch" />
          <SkeletonLine fontSize={13} lineHeight={1.3} width="80%" />
        </div>
      </div>
    </div>
  )
}

export function UsageSkeleton() {
  return (
    <SkeletonCard title="Verbruik" value={<Skeleton width={44} height={20} radius="capsule" />} area="verbruik" height={418} padding="20px 20px 4px" className="flex flex-col [&>.skeleton-card-body]:flex-1">
      <div className="grid grid-cols-2 gap-x-3 gap-y-4">
        {[60, 48, 66, 54].map((w, i) => (
          <div key={i} className="flex flex-col gap-1">
            <SkeletonLine fontSize={12} lineHeight={1.3} width={`${w}%`} />
            <SkeletonNumber fontSize={26} width="5ch" />
          </div>
        ))}
      </div>
      <SkeletonChart height={190} xLabels={5} className="mt-2" />
      <div className="mt-auto flex items-center justify-center gap-1.5 py-[19px]">{Array.from({ length: 6 }, (_, i) => <SkeletonCircle key={i} size={6} />)}</div>
    </SkeletonCard>
  )
}

/** "Zet aan om": 338 op de telefoon, 317 vanaf 768, vanaf 1280 rekt hij mee in het rooster. */
export function DevicesSkeleton() {
  return (
    <div data-skeleton="" aria-busy data-vak="apparaten" data-skeleton-slot="apparaten" className="skeleton-card vak">
      <h2 className="groepkop">
        <span>Zet aan om</span>
        <span aria-hidden className="-my-3 -mr-1 grid size-11 place-items-center"><SkeletonCircle size={20} /></span>
      </h2>
      <div aria-hidden className="kaart h-[313px] overflow-hidden px-4 py-3 md:h-[292px] md:px-5 xl:h-auto">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={`flex items-center gap-3 py-2.5 ${i ? 'border-t border-[var(--border)]' : ''}`}>
            <div className="flex w-[4.75rem] flex-none flex-col gap-px">
              <SkeletonNumber fontSize={17} lineHeight={1.25} width="5ch" />
              <SkeletonLine fontSize={11} lineHeight={1.3} width="4ch" />
            </div>
            <SkeletonCircle size={18} />
            <div className="flex min-w-0 flex-1 flex-col gap-px">
              <SkeletonLine fontSize={15} lineHeight={1.35} width={skeletonWidth(i, 2)} />
              <SkeletonLine fontSize={11} lineHeight={1.3} width={skeletonWidth(i, 6) - 10} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** De curve is geen kaart: op het canvas, 313 / 404 / 450 hoog. */
export function CurveSkeleton() {
  return (
    <div data-skeleton="" aria-busy data-vak="curve" data-skeleton-slot="curve" className="skeleton-card flex h-[313px] flex-col gap-1.5 md:h-[404px] xl:h-[450px]">
      <div className="flex items-center justify-between md:hidden">
        <SkeletonLine fontSize={13} lineHeight={1.3} width="44%" />
        <Skeleton width={96} height={32} radius="capsule" />
      </div>
      <SkeletonChart height="auto" xLabels={0} yLabels={3} className="flex-1" />
      <Skeleton width="100%" height={6} radius="capsule" style={{ marginTop: 4 }} />
      <div className="mt-1 flex justify-between">{Array.from({ length: 7 }, (_, i) => <SkeletonLine key={i} fontSize={11} lineHeight={1.45} width="4ch" />)}</div>
    </div>
  )
}

/** Het podium (zolang de studio-hero er niet is): 482 op de telefoon, 322 vanaf 768, in het rooster rekt hij mee. */
export function PodiumSkeleton() {
  return (
    <div data-skeleton="" aria-busy data-vak="podium" data-skeleton-slot="podium" className="skeleton-card flex min-h-[482px] md:min-h-[322px]">
      <div aria-hidden className="kaart relative flex flex-1 flex-col gap-2.5 p-[clamp(18px,2.6cqw,26px)]">
        <SkeletonNumber fontSize={44} lineHeight={1} width="4ch" />
        <SkeletonLine fontSize={14} lineHeight={1.4} width="46%" />
        <Skeleton width={112} height={28} radius="capsule" />
        <span className="flex-1" />
        <SkeletonImage width={4} height={3} radius="xl" style={{ width: '78%', alignSelf: 'center', opacity: 'calc(var(--skeleton-tone) * .7)' }} />
      </div>
    </div>
  )
}

export function PotjeSkeleton() {
  return (
    <SkeletonCard title="Het potje" area="potje" className="flex h-[413px] xl:h-[388px] [&>.skeleton-card-body]:flex-1">
      <div className="flex min-h-0 flex-1 gap-5">
        <Skeleton width={96} height="100%" radius="xl" />
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <SkeletonNumber fontSize={30} width="6ch" />
          <SkeletonLine fontSize={14} lineHeight={1.45} width="100%" />
          <SkeletonLine fontSize={14} lineHeight={1.45} width="100%" />
          <SkeletonLine fontSize={14} lineHeight={1.45} width="54%" />
          <span className="flex-1" />
          <div className="flex flex-wrap gap-1.5"><SkeletonButton width={84} height={32} /><SkeletonButton width={72} height={32} /><SkeletonButton width={96} height={32} /></div>
          <SkeletonButton width="100%" height={48} />
        </div>
      </div>
    </SkeletonCard>
  )
}

/** De maandkalender: 759 op de telefoon en in een halve kolom, 772 vanaf 768, 547 naast elkaar vanaf 1280. */
export function CalendarSkeleton({ title = 'Laden', wide = true }: { title?: string; wide?: boolean }) {
  return (
    <div data-skeleton="" aria-busy data-vak="laden" data-skeleton-slot="laden" className="skeleton-card flex min-w-0 flex-col">
      <h2 className="groepkop"><span className="flex items-baseline gap-1">{title} · <SkeletonLine fontSize={13} lineHeight={1.3} width="7ch" /></span></h2>
      <div aria-hidden className={`kaart flex h-[759px] flex-col md:h-[772px] ${wide ? 'xl:grid xl:h-[547px] xl:grid-cols-[1fr_2fr]' : ''}`}>
        <div className={`flex flex-col gap-2 border-b border-[var(--border)] p-5 ${wide ? 'xl:border-r xl:border-b-0' : ''}`}>
          <SkeletonLine fontSize={13} lineHeight={1.3} width="40%" />
          <SkeletonNumber fontSize={36} lineHeight={1.05} width="6ch" />
          <SkeletonLine fontSize={14} lineHeight={1.45} width="82%" />
          <div className="mt-2 grid grid-cols-3 gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} height={64} radius="md" />)}</div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2"><SkeletonCircle size={40} /><SkeletonLine fontSize={15} lineHeight={1.4} width="12ch" /><SkeletonCircle size={40} /></div>
            <SkeletonButton width={152} height={48} />
          </div>
          <SkeletonCalendar rows={5} />
          <SkeletonLine fontSize={12} lineHeight={1.4} width="58%" />
        </div>
      </div>
    </div>
  )
}

export function ChargeCostsSkeleton() {
  return (
    <SkeletonCard title="Laadkosten" value="7ch" area="laadkosten">
      <SkeletonNumber fontSize={36} lineHeight={1} width="6ch" />
      <SkeletonLine fontSize={14} lineHeight={1.45} width="74%" />
      <div className="mt-1 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} data-skeleton-surface="card" className="flex flex-col gap-1 rounded-[var(--radius)] bg-[var(--surface-sunken)] p-3">
            <SkeletonLine fontSize={12} lineHeight={1.3} width="70%" />
            <SkeletonNumber fontSize={17} lineHeight={1.25} width="5ch" />
          </div>
        ))}
      </div>
    </SkeletonCard>
  )
}

export function MoreSkeleton() {
  return <SkeletonCard area="meer" rows={1} row={{ leading: 'none', lines: 1, trailing: 'chevron', title: { width: '44%' } }} />
}

export function TripsSkeleton() {
  return (
    <div className="trips flex flex-col gap-5 breed:gap-6">
      <div data-skeleton="" aria-busy data-skeleton-slot="trips-week" className="skeleton-card flex flex-col">
        <h2 className="groepkop"><SkeletonLine fontSize={13} lineHeight={1.3} width="40%" /><SkeletonLine fontSize={13} lineHeight={1.3} width="12ch" /></h2>
        <div aria-hidden className="kaart trips-kaart px-1.5 pt-1.5">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className={`flex h-[58px] flex-col items-center justify-center gap-0.5 rounded-xl ${i === 6 ? 'bg-[var(--surface-sunken)]' : ''}`}>
                <SkeletonLine fontSize={12} lineHeight={1.3} width="2ch" />
                <SkeletonNumber fontSize={15} lineHeight={1.3} width="2ch" />
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-2 px-3.5 pt-3.5 pb-[18px]">
            <SkeletonNumber fontSize={60} lineHeight={1} width="4.5ch" />
            <SkeletonLine fontSize={14} lineHeight={1.45} width="42%" />
          </div>
        </div>
      </div>
      <SkeletonCard title="Trips · vandaag" value="6ch" slot="trips-vandaag" rows={2} row={{ leading: 'avatar', leadingSize: 16, minHeight: 56, subtitle: { fontSize: 12 } }} />
    </div>
  )
}

export function PageTitleSkeleton({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-5 flex items-start justify-between gap-4 breed:sr-only">
      <div className="min-w-0 flex-1">
        <h1 className="text-[34px] leading-[1.1] font-semibold tracking-[-0.02em]">{title}</h1>
        {subtitle ? <div className="mt-1"><SkeletonLine size="lead" width={subtitle} /></div> : null}
      </div>
      <span aria-hidden className="mt-1 grid size-11 place-items-center"><SkeletonCircle size={36} /></span>
    </header>
  )
}
```

`TripsSkeleton` komt samen op het gemeten vak van 420. Haal `px-1.5 pt-1.5` weg als `.trips-kaart` die padding (`6px 6px 0`) al zelf zet.

**Vandaag (`app/(app)/page.tsx`):** vervang de fallbacks, de Suspense-grenzen blijven:
- `prijzen`: `<PricesSkeleton />`, `verbruik`: `<UsageSkeleton />`
- `PricePanelCard`: `<><PodiumSkeleton /><DevicesSkeleton /><CurveSkeleton /></>`
- `potje`: `<PotjeSkeleton />`, `laden`: `<CalendarSkeleton />`, `meer`: `<MoreSkeleton />`

en zet **`app/(app)/loading.tsx`** met precies dezelfde opbouw, zodat de wissel van tab al meteen dit beeld geeft en er daarna niets verandert:

```tsx
import { PageSkeleton } from '@yoim/ds/components/skeleton'
import { CalendarSkeleton, CurveSkeleton, DevicesSkeleton, MoreSkeleton, PageTitleSkeleton, PodiumSkeleton, PotjeSkeleton, PricesSkeleton, UsageSkeleton } from '@/components/skeletons'

export default function Loading() {
  return (
    <PageSkeleton className="schermkolom werkvlak" label="Vandaag laden…">
      <PageTitleSkeleton title="Vandaag" />
      <div className="paneel">
        <PricesSkeleton /><UsageSkeleton /><PodiumSkeleton /><DevicesSkeleton /><CurveSkeleton /><PotjeSkeleton /><CalendarSkeleton /><MoreSkeleton />
      </div>
    </PageSkeleton>
  )
}
```

Het rooster (`.paneel` met `grid-template-areas`) plaatst de skeletons via `data-vak`, en verbergt op de telefoon het podium, het potje, de laadmaand en "meer", net als bij de echte kaarten. Op 1280 rekken het podium en de apparaten mee met het verbruik (443): dat doet het rooster, en daarom hebben die twee vanaf `xl` geen eigen hoogte.

**BaYmax (`app/(app)/baymax/page.tsx` en `baymax/loading.tsx`):** podium: `<PodiumSkeleton />`; trips: `<TripsSkeleton />`; laden: `<CalendarSkeleton wide={false} />`. In `loading.tsx`: `PageTitleSkeleton title="BaYmax" subtitle="14ch"`, het podium, dan op de telefoon de tabwoorden "Trips" en "Laden" als echte tekst (`-mt-2 -mb-3 flex gap-5 px-1 breed:hidden`, `h-11`, `--text-lead`, semibold, Laden in `--text-muted`), en `grid gap-6 breed:grid-cols-2` met Trips en de kalender. Komt de studio-hero (templates/baymax-hero, @yoim/ds 0.6.1), dan wordt het podium een hero van 500 / 540 px vast: echte h1 "BaYmax" met de vaste regel eronder, het glazen statuskaartje (op glas: de vulling is vanzelf een sluier) en `SkeletonImage width={1687} height={907}` op de plek van de auto. Zie `Energ.dc.html` met `hero=studio`.

**Geld (`geld/page.tsx` en `geld/loading.tsx`):** `PotjeSkeleton`, `ChargeCostsSkeleton`, `CalendarSkeleton title="Kalender"` (in `breed:col-span-2`), `MoreSkeleton` (in `breed:col-span-2`), in hetzelfde `flex flex-col gap-5 breed:grid breed:grid-cols-2 breed:items-start breed:gap-6`. Titel: `PageTitleSkeleton title="Geld" subtitle="10ch"`.

**Profiel (`instellingen/loading.tsx`):** de pagina wacht nu op alles. `PageTitleSkeleton title="Profiel" subtitle="18ch"`, dan in de container van de pagina (`breed:max-w-[45rem]!`): "Gespaard met BaYmax" (kaart p-5, `breed:p-6`: getal 30, balk 14, regel), `mt-6` het segment voor geluid (label, capsule 44, regel), "Weergave" (kaart met capsule 44 en regel), "Diensten" (twee regels en een knop van 48) en `mt-6` de Uitloggen-rij (kaart, één rij met icoon 18). De groepkoppen zijn echte tekst. Zie `Energ.dc.html`, tab Profiel.

**`CardGroup`:** geef hem `data-slot={area}` en `className="vak skeleton-reveal"`.

### weekl.yoim

weekl heeft nu niets, dus een tik op een tab doet even niets. Drie `loading.tsx`. Hergebruik de klassen van de echte schermen: dan schakelen `.schermkolom:has(.lijstkolommen)` (74rem op desktop), `.plannen` (het planbord vanaf 1120, op schermhoogte) en `.receptkop` (sticky glas op de telefoon) vanzelf mee.

**`app/(app)/loading.tsx` (Boodschappen):**

```tsx
import { PageSkeleton, Skeleton, SkeletonCircle, SkeletonLine, skeletonWidth } from '@yoim/ds/components/skeleton'

function Group({ rows, index, pills = [] }: { rows: number; index: number; pills?: number[] }) {
  return (
    <section className="lijstgroep mb-[18px]" data-skeleton-slot={`groep-${index}`}>
      <div className="mb-2 px-1"><SkeletonLine size="nav" width={`${[14, 10, 18, 12, 16, 9][index % 6]}ch`} /></div>
      <ul aria-hidden className="kaart">
        {Array.from({ length: rows }, (_, r) => (
          <li key={r} className="rij relative flex-col items-stretch gap-0 p-0">
            <div className="flex min-h-[var(--tap)] items-center gap-3.5 py-[11px] pr-2 pl-3.5">
              <SkeletonCircle size={26} />
              <span className="flex-1"><SkeletonLine fontSize={16} width={skeletonWidth(r + index, 1)} /></span>
              {pills.includes(r) ? <Skeleton width={64} height={24.5} radius="capsule" /> : null}
              <span className="w-11 self-stretch" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Loading() {
  return (
    <PageSkeleton className="schermkolom" label="Boodschappen laden…">
      <div className="flex items-start justify-between gap-3 breed:items-center">
        <div className="min-w-0 flex-1">
          <h1 className="text-[34px] leading-[1.1] font-semibold tracking-[-0.02em] breed:sr-only">Boodschappen</h1>
          <p className="mt-0.5 flex h-7 items-center gap-2 text-[15px]">
            <SkeletonLine fontSize={15} width="9ch" />
            <span className="inline-flex breed:hidden"><Skeleton width={62} height={28} radius="capsule" /></span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden breed:inline-flex"><Skeleton width={62} height={28} radius="capsule" /></span>
          <span aria-hidden className="grid size-11 place-items-center"><SkeletonCircle size={24} /></span>
          <span aria-hidden className="grid size-11 place-items-center breed:hidden"><SkeletonCircle size={36} /></span>
        </div>
      </div>
      <div className="mt-4">
        <div className="lijstinvoer onderchrome">
          <div aria-hidden className="capsuleveld glas sheen flex items-center gap-2.5 rounded-[var(--radius-capsule)] py-2 pr-2 pl-[18px]">
            <span className="flex-1"><SkeletonLine fontSize={16} width="38%" /></span>
            <SkeletonCircle size={44} />
          </div>
        </div>
        <div className="lijstkolommen">
          <Group index={0} rows={4} pills={[2]} />
          <Group index={1} rows={3} />
          <Group index={2} rows={5} pills={[0, 3]} />
          <Group index={3} rows={3} />
          <Group index={4} rows={4} pills={[1]} />
          <Group index={5} rows={2} />
        </div>
      </div>
    </PageSkeleton>
  )
}
```

Neem de klassen van de invoerbalk over uit `lijst.tsx:863-886`: het skeleton moet op de telefoon op precies dezelfde plek zweven (boven de navigatie) en vanaf breed statisch onder de kop staan. De sneltoetsregel (alleen breed en een fijne pointer, `min-h-[22px] mt-3`) hoort er ook in als die in de echte DOM onder de balk staat.

**`app/(app)/week/loading.tsx`:** in `main.plannen`, zoals `components/plannen.tsx`:
- Telefoon en breed (`plannen:hidden` op de kop): h1 "Week" (34px) met de weeknavigatie eronder (twee knoppen van 44 rond een regel van 15px, `12ch`) en rechts Wissen (44); `mb-2.5`. Dan `ul.paneelrol flex flex-col gap-2.5` met zeven dagkaarten: `kaart flex gap-3.5 p-3.5`, links `w-11` een regel van 11px (`3ch`) en een getal van 20px (`2ch`), rechts `gap-1.5` een regel van 17px en een capsule van 22,5 hoog (de soortchip). Onderaan de tray "Hele week naar lijst" als `onderchrome glas sheen rounded-[var(--radius-tray)] p-2` met `SkeletonButton width="100%" height={52}`.
- Vanaf plannen (zelfde route, het planbord): links de weekkolom (h2 "Week" 20px, weeknav met knoppen van 36, de zeven dagkaarten, de tray statisch `mt-2.5`), rechts het receptenpaneel: h1 "Recepten" (20px) met een regel voor het aantal en de +, het zoekveld (`glas-dun`, 48 hoog, regel `22%`), de chips (capsules van 38), `h-2.5`, en `.receptenrijen` met compacte kaarten (`kaart gap-1.5 p-3.5`: regel 17px, regel 13px). De kolommen zijn `.paneelrol`, dus ze scrollen zelf en het skeleton hoeft niet langer dan het scherm.
- Gebruik dezelfde wrapperklassen als `plannen.tsx` (`.paneel-week`, `.paneel-recepten` of hoe ze heten): `.paneel-recepten` is onder 1120 `display: none`, dus één skeleton dekt beide.

**`app/(app)/recepten/loading.tsx`:** in `main.schermkolom.receptenkolom`:
- `.receptkop` met de klassen van de echte kop (sticky glas op de telefoon, statisch vanaf breed): de titelrij (h1 "Recepten" 17px en de + van 44; vanaf breed is de h1 `sr-only` en staat rechts de tray "Nieuw recept" van 70), het zoekveld, de chips. Dan `p.mt-4 mb-4 breed:…` met een regel van 15px (`10ch`) voor "N recepten".
- `.receptenrijen` met zes rijke kaarten: `kaart flex flex-col gap-2 px-[15px] py-3.5`: regel 18px plus soortchip, regel 13px, vanaf breed de macrostrook (vier cellen: getal 14px en regel 10px, plus een balk van 5px), regel 13px voor de ingrediënten. Zie `Weekl.dc.html`, tab Recepten.

### yoim (hub)

**`app/(app)/loading.tsx`:** de kop is vaste tekst en staat er dus echt; de panelen ook, alleen hun cijfers zijn vlakken. Home heeft geen data: dat paneel is gewoon het echte paneel.

```tsx
import { Merk } from '@yoim/ds/components/merk'
import { PageSkeleton, SkeletonChart, SkeletonCircle, SkeletonLine, SkeletonNumber } from '@yoim/ds/components/skeleton'
import { Paneel } from '@/components/paneel'

function Numbers() {
  return (
    <div className="flex gap-8">
      {[0, 1].map((i) => (
        <div key={i}>
          <SkeletonNumber fontSize={18} lineHeight={1.5} width="5ch" />
          <SkeletonLine fontSize={12} lineHeight={1.33} width="11ch" />
        </div>
      ))}
    </div>
  )
}

export default function Loading() {
  return (
    <PageSkeleton className="schermkolom flex flex-col gap-4" label="Overzicht laden…">
      <header className="flex items-center justify-between gap-3 py-2 breed:sr-only">
        <h1 className="flex items-center gap-2.5 text-[length:var(--text-title)] font-semibold tracking-[-0.035em]">
          <Merk grootte={26} aria-hidden className="text-[var(--accent)]" />
          <span>Yo<span className="text-[var(--botergoud)]">Im</span><span className="text-text-muted">.nl</span></span>
        </h1>
        <span aria-hidden className="-mr-1.5 grid size-12 place-items-center breed:hidden"><SkeletonCircle size={36} /></span>
      </header>
      <div className="grid gap-4 breed:grid-cols-2">
        <Paneel naam="Weekl" regel="Boodschappen, recepten en de week." href="https://weekl.yoim.nl">
          <div aria-busy data-skeleton="" data-skeleton-slot="weekl">
            <ul className="flex justify-between gap-1">
              {Array.from({ length: 7 }, (_, i) => (
                <li key={i} className="flex flex-col items-center gap-1.5"><SkeletonLine fontSize={12} lineHeight={1.33} width="2ch" /><SkeletonCircle size={10} /></li>
              ))}
            </ul>
            <div className="mt-4"><Numbers /></div>
          </div>
        </Paneel>
        <Paneel naam="Energ" regel="Stroom, gas en de auto, per kwartier." href="https://energ.yoim.nl">
          <div aria-busy data-skeleton="" data-skeleton-slot="energ">
            <Numbers />
            <SkeletonChart height={36} xLabels={0} className="mt-4" />
          </div>
        </Paneel>
        <Paneel naam="Home" regel="Molenberg 2a, van binnenuit." href="https://home.yoim.nl" />
      </div>
    </PageSkeleton>
  )
}
```

Neem `href` over uit de echte panelen, en laat de regels uit `*-paneel.tsx` komen (een constante per paneel) in plaats van ze hier te herhalen. Zijn de panelen async server components die elk zelf ophalen, dan kan de pagina ook per paneel een `Suspense` krijgen met dezelfde inhoud als fallback: dan staat de hub meteen en komen de cijfers per paneel binnen.

### home.yoim
Alleen de pin bijwerken en de import van `skeleton.css` toevoegen. Een laadstaat komt als er een scherm is dat op data wacht.

## 3. Controleren dat er niets verspringt

Per app, op 393 en 1280 (DevTools, apparaatmodus), licht en donker.

1. **Laad langzaam, alleen in development.** Een helper in `lib/dev-delay.ts`:
   ```ts
   export async function devDelay() {
     const ms = Number(process.env.SKELETON_DELAY ?? 0)
     if (process.env.NODE_ENV === 'development' && ms > 0) await new Promise((r) => setTimeout(r, ms))
   }
   ```
   Roep hem aan bovenin de functie die de data van een kaart of pagina ophaalt (`queries()` in energ, de loaders in mone, weekl en de hub). `SKELETON_DELAY=1500 npm run dev` laat elk skeleton anderhalve seconde staan; met `600000` blijft het staan voor een schermafbeelding.
2. **Meet in de console.** Plak dit voordat je navigeert (of als snippet in DevTools) en klik dan naar de tab:
   ```js
   (() => {
     const m = {}
     const meet = () => {
       document.querySelectorAll('[data-skeleton-slot]').forEach((el) => { const k = el.dataset.skeletonSlot; (m[k] ??= {}).s = el.getBoundingClientRect() })
       document.querySelectorAll('[data-slot]').forEach((el) => { const k = el.dataset.slot; if (m[k]?.s && !m[k].e) m[k].e = el.getBoundingClientRect() })
     }
     new MutationObserver(meet).observe(document.body, { subtree: true, childList: true })
     meet()
     new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && e.value > 0 && console.warn('verspringing', e.value.toFixed(4), e.sources?.map((s) => s.node)))).observe({ type: 'layout-shift', buffered: true })
     window.skeletonRapport = () => console.table(Object.fromEntries(Object.entries(m).map(([k, v]) => [k, { skelet: v.s && Math.round(v.s.height), echt: v.e && Math.round(v.e.height), hoogte: v.s && v.e ? Math.round(v.e.height - v.s.height) : '?', boven: v.s && v.e ? Math.round(v.e.top - v.s.top) : '?' }])))
   })()
   ```
   Na het laden: `skeletonRapport()`. Per slot moet `boven` 0 zijn en `hoogte` 0 (±1). Een positieve `hoogte` (echt hoger) is altijd fout. Een negatieve mag alleen bij een lijst onderaan de pagina waarvan de lengte varieert, en dan hooguit één rij. Er mag geen enkele `verspringing` gelogd worden.
3. **Leg ze over elkaar.** Twee schermafbeeldingen op dezelfde maat, met `SKELETON_DELAY=600000` en zonder, op 50% over elkaar: elke kaartrand, elke groepkop en elke rij valt samen. De templates in het design-systemproject zijn op dezelfde maten getekend; daar mag je ook tegen vergelijken.
4. **Beweging.** De pulse loopt op alle vlakken tegelijk (ook als er later een kaart via Suspense bij komt). Met "Emulate CSS prefers-reduced-motion: reduce" staat alles stil en verschijnt de inhoud zonder fade. Een load onder 150 ms toont geen skeleton.
5. **Schermlezer.** VoiceOver zegt één keer "… laden…" en daarna de pagina; nooit de vlakken.

Commit per app met de punten uit "Let op bij het bijwerken". Push en deploy pas als Yoran het zegt.
