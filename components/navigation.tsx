'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Lock, Monitor, Moon, Sun } from 'lucide-react'

import { DARK, nextTheme, subscribeDark, themeTip, type Thema } from '../thema'

export type NavigationRoute = {
  id: string
  label: string
  /** Een lucide-icoon; maat en lijndikte zet de navigatie zelf. */
  icon: React.ReactNode
  count?: number
  /** Met een href wordt het item een Link; anders alleen `onSelect`. */
  href?: string
}

export type NavigationAccount = {
  name: string
  household: string
  initial: string
  /** Een CSS-kleur, bijvoorbeeld `var(--member-yoran)`. */
  color: string
  /** Waar de avatar heen gaat: Instellingen, of in mone Profiel. */
  href: string
  /** Wat daar staat, voor de tooltip en de schermlezer. Standaard "Instellingen". */
  hrefLabel?: string
}

type Theme = Exclude<Thema, 'systeem'>

/** Zonder `system` twee keuzes, met `system` drie en is `theme` wat iemand
    koos, ook `systeem`. */
type ThemeProps =
  | { system?: false; theme?: Theme; onTheme?: (theme: Theme) => void }
  | { system: true; theme?: Thema; onTheme?: (theme: Thema) => void }

const THEMAS = [
  { id: 'licht', label: 'Licht', Icon: Sun },
  { id: 'donker', label: 'Donker', Icon: Moon },
  { id: 'systeem', label: 'Systeem', Icon: Monitor },
] as const

const SLUITEN_NA = 300

function useSystemDark() {
  return useSyncExternalStore(subscribeDark, () => window.matchMedia(DARK).matches, () => false)
}

/**
 * De navigatie, in twee vormen die hetzelfde ding zijn. Op de telefoon een
 * zwevende glazen capsule onderaan met de routes. Vanaf --bp-breed twee
 * capsules in de bovenhoeken: links het merk en de routes als iconen, rechts
 * thema, slot en account. Het verschil zit in `glas.css`.
 *
 * Op de telefoon staat de rechter capsule er niet: de app zet dan een avatar
 * in zijn paginakop en Weergave (`ThemeChoice`) in zijn accountsheet.
 *
 * Met één route is er niets om tussen te wisselen: dan staat er op de telefoon
 * geen capsule onderaan, en op desktop links alleen het merk, als link naar die
 * route. De rechter capsule blijft.
 */
export function Navigation({
  routes,
  active,
  onSelect,
  brand,
  account,
  system,
  theme,
  onTheme,
  onLock,
  onSignOut,
}: ThemeProps & {
  routes: NavigationRoute[]
  active: string
  onSelect?: (id: string) => void
  brand: React.ReactNode
  account?: NavigationAccount
  /** Alleen meegeven als de app een slot heeft; de sneltoets blijft in de app. */
  onLock?: () => void
  /** @deprecated Sinds 0.5.0 staat uitloggen op de profielpagina. */
  onSignOut?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [wijkt, setWijkt] = useState(false)
  const [gewisseld, setGewisseld] = useState(false)
  const links = useRef<HTMLElement>(null)
  const rechts = useRef<HTMLDivElement>(null)
  const sluiten = useRef<ReturnType<typeof setTimeout>>(undefined)
  const binnen = useRef(false)
  const aanwijzer = useRef('')
  const systemDark = useSystemDark()
  // Zonder `system` komen hier alleen licht en donker langs.
  const choose = onTheme as ((theme: Thema) => void) | undefined
  const signOutGiven = Boolean(onSignOut)
  const enkel = routes.length === 1

  if (routes.length === 0 || routes.length > 5) {
    console.warn(`Navigation is ontworpen voor 1 tot 5 routes, niet ${routes.length}.`)
  }

  useEffect(() => {
    if (signOutGiven) {
      console.warn('Navigation: onSignOut vervalt sinds 0.5.0. Uitloggen hoort op de profielpagina.')
    }
  }, [signOutGiven])

  useEffect(() => () => clearTimeout(sluiten.current), [])

  useEffect(() => {
    if (!open) return
    const toets = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const buiten = (e: PointerEvent) => {
      if (!links.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', toets)
    document.addEventListener('pointerdown', buiten)
    return () => {
      document.removeEventListener('keydown', toets)
      document.removeEventListener('pointerdown', buiten)
    }
  }, [open])

  // Glas over glas leest als een fout: past de linker capsule niet meer naast
  // de rechter, dan wijkt de rechter. Gemeten zonder transform, want die
  // verschuift de rechter zelf zodra hij wijkt.
  useEffect(() => {
    const nav = links.current
    const rechter = rechts.current
    if (!nav || !rechter) return
    const meet = () => {
      const rand = parseFloat(getComputedStyle(rechter).right) || 0
      const begin = document.documentElement.clientWidth - rand - rechter.offsetWidth
      setWijkt(rechter.offsetWidth > 0 && nav.getBoundingClientRect().right + 12 > begin)
    }
    const observer = new ResizeObserver(meet)
    observer.observe(nav)
    observer.observe(rechter)
    observer.observe(document.documentElement)
    nav.addEventListener('transitionend', meet)
    return () => {
      observer.disconnect()
      nav.removeEventListener('transitionend', meet)
    }
  }, [])

  const openen = () => {
    clearTimeout(sluiten.current)
    setOpen(true)
  }

  const found = routes.findIndex(({ id }) => id === active)
  const index = Math.max(0, found)
  const eerste = routes[0]
  const aanraking = () => aanwijzer.current === 'touch' || aanwijzer.current === 'pen'

  // Met een muis klapt het merk uit bij hover en navigeert een klik. Op touch
  // is er geen hover, dus daar zet een tik de labels open of dicht.
  const merk = {
    className: 'nav-brand',
    'aria-current': enkel && active === eerste.id ? ('page' as const) : undefined,
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse' && !enkel) openen()
    },
    onClick: (e: React.MouseEvent) => {
      if (aanraking() && !enkel) {
        e.preventDefault()
        setOpen((o) => !o)
      } else {
        onSelect?.(eerste.id)
      }
      aanwijzer.current = ''
    },
  }

  const volgende = theme ? nextTheme(theme, Boolean(system)) : undefined
  const ThemaIcoon = THEMAS.find(({ id }) => id === theme)?.Icon
  const accountLabel = account?.hrefLabel ?? 'Instellingen'

  return (
    <>
      <nav
        ref={links}
        aria-label="Pagina's"
        data-open={open || undefined}
        data-enkel={enkel || undefined}
        className="navigation glas sheen"
        style={{ '--i': index, '--n': routes.length } as React.CSSProperties}
        onPointerDown={(e) => {
          aanwijzer.current = e.pointerType
        }}
        onPointerEnter={(e) => {
          if (e.pointerType !== 'mouse') return
          binnen.current = true
          clearTimeout(sluiten.current)
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== 'mouse') return
          binnen.current = false
          clearTimeout(sluiten.current)
          sluiten.current = setTimeout(() => setOpen(false), SLUITEN_NA)
        }}
        onFocus={(e) => {
          if (e.target.matches(':focus-visible')) openen()
        }}
        onBlur={(e) => {
          if (!binnen.current && !e.currentTarget.contains(e.relatedTarget)) setOpen(false)
        }}
      >
        {eerste?.href ? (
          <Link href={eerste.href} {...merk}>
            {brand}
          </Link>
        ) : (
          <button type="button" {...merk}>
            {brand}
          </button>
        )}
        {enkel ? null : (
          <>
            <span aria-hidden="true" className="nav-scheiding" />

            <span className="nav-routes">
              {found >= 0 ? <span aria-hidden="true" className="nav-pill" /> : null}
              {routes.map(({ id, label, icon, count, href }) => {
                const inhoud = (
                  <>
                    {icon}
                    <span className="nav-label">
                      <span>{label}</span>
                    </span>
                    {count ? <span className="nav-count">{count}</span> : null}
                    <span aria-hidden="true" className="nav-tip nav-tip-onder">
                      {label}
                    </span>
                  </>
                )
                const vorm = {
                  'aria-current': id === active ? ('page' as const) : undefined,
                  'aria-label': count ? `${label}, ${count}` : label,
                  className: 'nav-item zweeftint',
                  onClick: () => {
                    onSelect?.(id)
                    if (aanraking()) setOpen(false)
                    aanwijzer.current = ''
                  },
                }

                return href ? (
                  <Link key={id} href={href} {...vorm}>
                    {inhoud}
                  </Link>
                ) : (
                  <button key={id} type="button" {...vorm}>
                    {inhoud}
                  </button>
                )
              })}
            </span>
          </>
        )}
      </nav>

      {(theme && choose) || onLock || account ? (
        <div ref={rechts} data-wijkt={wijkt || undefined} className="nav-rechts glas sheen">
          {theme && choose && volgende && ThemaIcoon ? (
            <button
              type="button"
              aria-label={`Weergave: ${themeTip(theme, theme, systemDark, volgende)}`}
              onClick={() => {
                setGewisseld(true)
                choose(volgende)
              }}
              className="nav-knop zweeftint"
            >
              <ThemaIcoon
                key={theme}
                size={18}
                strokeWidth={2}
                aria-hidden="true"
                className={gewisseld ? 'nav-draai' : undefined}
              />
              <span aria-hidden="true" className="nav-tip nav-tip-onder">
                {themeTip(theme, theme, systemDark, volgende)}
              </span>
            </button>
          ) : null}

          {onLock ? (
            <button
              type="button"
              aria-label="Vergrendelen"
              aria-keyshortcuts="Control+Alt+L"
              onClick={onLock}
              className="nav-knop zweeftint"
            >
              <Lock size={18} strokeWidth={2} aria-hidden="true" />
              <span aria-hidden="true" className="nav-tip nav-tip-onder">
                Vergrendelen · Ctrl+Alt+L
              </span>
            </button>
          ) : null}

          {account ? (
            <Link href={account.href} aria-label={`${accountLabel}, ${account.name}`} className="nav-knop zweeftint">
              <span aria-hidden="true" className="nav-avatar" style={{ background: account.color }}>
                {account.initial}
              </span>
              <span aria-hidden="true" className="nav-tip nav-tip-onder">
                {accountLabel}
              </span>
            </Link>
          ) : null}
        </div>
      ) : null}
    </>
  )
}

/**
 * Weergave als radiogroep, voor de accountsheet op de telefoon waar ruimte is
 * voor alle keuzes. Op desktop is het de ene knop in de navigatie.
 */
export function ThemeChoice({ system, theme, onTheme }: ThemeProps) {
  const knoppen = useRef<Array<HTMLButtonElement | null>>([])
  const systemDark = useSystemDark()
  const themas = system ? THEMAS : THEMAS.slice(0, 2)
  const choose = onTheme as ((theme: Thema) => void) | undefined

  if (!theme || !choose) return null

  // Een keuze is een radiogroep: zo hoor je "1 van 3" en lopen de pijltjes erdoor.
  return (
    <span
      role="radiogroup"
      aria-label="Weergave"
      className="glas-dun relative flex gap-0.5 rounded-[var(--radius-capsule)] p-[3px]"
    >
      {themas.map(({ id, label, Icon }, i) => {
        const aan = theme === id

        return (
          <button
            key={id}
            ref={(knop) => {
              knoppen.current[i] = knop
            }}
            type="button"
            role="radio"
            aria-checked={aan}
            aria-label={label}
            tabIndex={aan ? 0 : -1}
            onClick={() => choose(id)}
            onKeyDown={(e) => {
              if (!e.key.startsWith('Arrow')) return
              e.preventDefault()
              const stap = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1
              const ander = (i + stap + themas.length) % themas.length
              knoppen.current[ander]?.focus()
              choose(themas[ander].id)
            }}
            className={`nav-thema flex h-8 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-capsule)] text-[13px] font-medium transition-colors duration-[var(--dur-fast)] ${
              aan
                ? 'bg-[var(--glass-tint-strong)] text-[var(--text)] shadow-[inset_0_0_0_1px_var(--border-strong),var(--glass-rim)]'
                : system
                  ? 'text-[var(--text-muted)]'
                  : 'text-[var(--text-subtle)]'
            }`}
          >
            <Icon size={system ? 16 : 15} strokeWidth={2} aria-hidden="true" />
            {system ? (
              <span
                role="tooltip"
                className="nav-tip pointer-events-none absolute left-0 bottom-[calc(100%+8px)] flex h-8 items-center rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-3 text-[13px] font-medium whitespace-nowrap text-[var(--text)] shadow-[var(--shadow-raised)]"
              >
                {themeTip(id, theme, systemDark)}
              </span>
            ) : (
              label
            )}
          </button>
        )
      })}
    </span>
  )
}
