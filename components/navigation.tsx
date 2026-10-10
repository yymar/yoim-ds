'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Lock, Monitor, Moon, Sun } from 'lucide-react'

import { isScrolled, subscribeScrolled } from '../scroll'
import { DARK, nextTheme, subscribeDark, themeTip, type Thema } from '../thema'
import { SegmentedChoice } from './segmented-choice'

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
  /** Waar de avatar heen gaat: Instellingen, of in mone Profiel. Sta je daar, dan is de avatar actief. */
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

const geen = () => () => {}

/**
 * Of de pagina van bovenaf weg is gescrold (voorbij 40px, terug onder 12px).
 * Dezelfde stand en dezelfde scrollluisteraar als waarop de capsule inklapt,
 * voor een app die er ook een kop aan hangt. Met `enabled={false}` altijd false.
 */
export function useScrolled(enabled = true) {
  return useSyncExternalStore(enabled ? subscribeScrolled : geen, () => enabled && isScrolled(), () => false)
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
 *
 * Met twee of meer routes klapt de capsule op de telefoon bij scrollen in tot
 * iconen, en weer uit als je terug bent bij de top. Dan staat
 * `data-nav-ingeklapt` op `<html>` en zakt `--nav-zak` wat erop staat mee
 * (`glas.css`). `collapseOnScroll={false}` zet dat uit.
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
  collapseOnScroll = true,
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
  /** Op de telefoon inklappen tot iconen bij scrollen. Standaard aan. */
  collapseOnScroll?: boolean
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
  const pathname = usePathname()
  // Zonder `system` komen hier alleen licht en donker langs.
  const choose = onTheme as ((theme: Thema) => void) | undefined
  const signOutGiven = Boolean(onSignOut)
  const enkel = routes.length === 1
  const ingeklapt = useScrolled(collapseOnScroll && routes.length > 1)

  if (routes.length === 0 || routes.length > 5) {
    console.warn(`Navigation is ontworpen voor 1 tot 5 routes, niet ${routes.length}.`)
  }

  useEffect(() => {
    if (signOutGiven) {
      console.warn('Navigation: onSignOut vervalt sinds 0.5.0. Uitloggen hoort op de profielpagina.')
    }
  }, [signOutGiven])

  useEffect(() => () => clearTimeout(sluiten.current), [])

  // Voor de paint, zodat chrome die aan --nav-zak hangt in hetzelfde frame zakt als de capsule.
  useLayoutEffect(() => {
    const html = document.documentElement
    html.toggleAttribute('data-nav-ingeklapt', ingeklapt)
    return () => html.removeAttribute('data-nav-ingeklapt')
  }, [ingeklapt])

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
  const accountHier = account ? pathname === account.href : false

  return (
    <>
      <nav
        ref={links}
        aria-label="Pagina's"
        data-open={open || undefined}
        data-enkel={enkel || undefined}
        data-ingeklapt={ingeklapt || undefined}
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
            <Link
              href={account.href}
              aria-label={`${accountLabel}, ${account.name}`}
              aria-current={accountHier ? 'page' : undefined}
              className="nav-knop zweeftint"
            >
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
 * Weergave als `SegmentedChoice`, voor de accountsheet op de telefoon waar
 * ruimte is voor alle keuzes. Op desktop is het de ene knop in de navigatie.
 */
export function ThemeChoice({ system, theme, onTheme }: ThemeProps) {
  const systemDark = useSystemDark()
  const choose = onTheme as ((theme: Thema) => void) | undefined

  if (!theme || !choose) return null

  const themas = system ? THEMAS : THEMAS.slice(0, 2)
  // "Systeem · volgt je apparaat, nu donker" wordt "Volgt je apparaat, nu donker".
  const volgt = themeTip('systeem', 'systeem', systemDark).split(' · ')[1]

  return (
    <SegmentedChoice<Thema>
      label="Weergave"
      options={themas.map(({ id, label, Icon }) => ({
        id,
        label,
        icon: <Icon size={16} strokeWidth={2} aria-hidden="true" />,
      }))}
      value={theme}
      onChange={choose}
      description={system ? (theme === 'systeem' ? volgt[0].toUpperCase() + volgt.slice(1) : '') : undefined}
    />
  )
}
