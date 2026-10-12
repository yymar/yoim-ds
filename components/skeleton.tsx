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
