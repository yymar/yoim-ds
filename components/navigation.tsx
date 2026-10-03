'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { LogOut, Moon, Sun } from 'lucide-react'

import type { Thema } from '../thema'

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
}

type Theme = Exclude<Thema, 'systeem'>

const THEMAS = [
  { id: 'licht', label: 'Licht', Icon: Sun },
  { id: 'donker', label: 'Donker', Icon: Moon },
] as const

/**
 * De navigatie, in twee vormen die hetzelfde ding zijn. Op de telefoon een
 * zwevende glazen capsule onderaan; vanaf --bp-breed een rail links met drie
 * zones: het merk (een slot, de app levert zijn woordmerk), de routes en de
 * voet met thema en account. Het verschil zit in `glas.css`, want het is een
 * layoutverschil en geen ander component.
 *
 * Op de telefoon staat het account niet in de capsule: de app zet dan een
 * avatar rechts in zijn paginakop.
 */
export function Navigation({
  routes,
  active,
  onSelect,
  brand,
  account,
  theme,
  onTheme,
  onSignOut,
}: {
  routes: NavigationRoute[]
  active: string
  onSelect?: (id: string) => void
  brand: React.ReactNode
  /** Zonder account, thema en uitloggen heeft de rail geen voet, en kan hij
      zonder client-wrapper vanuit een servercomponent. */
  account?: NavigationAccount
  theme?: Theme
  onTheme?: (theme: Theme) => void
  onSignOut?: () => void
}) {
  const themaknoppen = useRef<Array<HTMLButtonElement | null>>([])

  if (routes.length < 3 || routes.length > 5) {
    console.warn(`Navigation is ontworpen voor 3 tot 5 routes, niet ${routes.length}.`)
  }

  const index = Math.max(
    0,
    routes.findIndex(({ id }) => id === active),
  )

  return (
    <nav
      className="navigation glas sheen"
      style={{ '--i': index, '--n': routes.length } as React.CSSProperties}
    >
      <span className="nav-brand">{brand}</span>

      <span className="nav-routes">
        <span aria-hidden="true" className="nav-pill" />
        {routes.map(({ id, label, icon, count, href }) => {
          const inhoud = (
            <>
              {icon}
              <span className="nav-label">{label}</span>
              {count ? <span className="nav-count">{count}</span> : null}
            </>
          )
          const vorm = {
            'aria-current': id === active ? ('page' as const) : undefined,
            className: 'nav-item zweeftint',
            onClick: () => onSelect?.(id),
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

      <span className="nav-foot">
        {/* Een keuze uit twee is een radiogroep: zo hoor je "1 van 2" en lopen
            de pijltjes erdoor. */}
        {theme && onTheme ? (
          <span
            role="radiogroup"
            aria-label="Thema"
            className="glas-dun flex gap-0.5 rounded-[var(--radius-capsule)] p-[3px]"
          >
            {THEMAS.map(({ id, label, Icon }, i) => {
              const aan = theme === id

              return (
                <button
                  key={id}
                  ref={(knop) => {
                    themaknoppen.current[i] = knop
                  }}
                  type="button"
                  role="radio"
                  aria-checked={aan}
                  tabIndex={aan ? 0 : -1}
                  onClick={() => onTheme(id)}
                  onKeyDown={(e) => {
                    if (!e.key.startsWith('Arrow')) return
                    e.preventDefault()
                    const ander = 1 - i
                    themaknoppen.current[ander]?.focus()
                    onTheme(THEMAS[ander].id)
                  }}
                  className={`flex h-8 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-capsule)] text-[13px] font-medium transition-colors duration-[var(--dur-fast)] ${
                    aan
                      ? 'bg-[var(--glass-tint-strong)] text-[var(--text)] shadow-[var(--glass-rim)]'
                      : 'text-[var(--text-subtle)]'
                  }`}
                >
                  <Icon size={15} strokeWidth={2} />
                  {label}
                </button>
              )
            })}
          </span>
        ) : null}

        {account ? (
          <span className="flex items-center gap-2.5 pl-1.5">
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold text-[var(--accent-fg)]"
              style={{ background: account.color }}
            >
              {account.initial}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-px">
              <b className="truncate text-sm leading-[1.2] font-semibold text-[var(--text)]">
                {account.name}
              </b>
              <em className="truncate text-[11px] leading-[1.2] not-italic text-[var(--text-subtle)]">
                {account.household}
              </em>
            </span>
            {onSignOut ? (
              <button
                type="button"
                aria-label="Uitloggen"
                onClick={onSignOut}
                className="zweeftint grid size-12 shrink-0 place-items-center rounded-full text-[var(--text-muted)]"
              >
                <LogOut size={20} strokeWidth={1.8} />
              </button>
            ) : null}
          </span>
        ) : null}
      </span>
    </nav>
  )
}
