'use client'

import { CircleAlert, Clock, CloudOff } from 'lucide-react'

const VORM = {
  soon: {
    Icon: Clock,
    rondje: 'bg-[var(--botergoud-soft)] text-[var(--botergoud)]',
    tekst: 'text-[var(--text)]',
  },
  expired: {
    Icon: CircleAlert,
    rondje: 'bg-[var(--danger)] text-[var(--surface-raised)]',
    tekst: 'text-[var(--text)]',
  },
  failed: {
    Icon: CloudOff,
    rondje: 'bg-[var(--surface-sunken)] text-[var(--text-muted)]',
    tekst: 'text-[var(--text-muted)]',
  },
} as const

/**
 * De ene regel bovenaan de kolom, voor de titel, over de bankkoppeling.
 * Hooguit één tegelijk: de app kiest de ergste. Zonder `state` is alles goed
 * en staat er niets.
 */
export function StatusLine({
  state,
  text,
  action,
  onAction,
}: {
  state?: keyof typeof VORM
  text: string
  action?: string
  onAction?: () => void
}) {
  if (!state) return null

  const { Icon, rondje, tekst } = VORM[state]
  // De hele regel is de knop, zodat het tapvlak niet alleen het woord rechts is.
  const Regel = onAction ? 'button' : 'div'

  return (
    <div role={state === 'expired' ? 'alert' : 'status'}>
      <Regel
        {...(onAction ? { type: 'button' as const, onClick: onAction } : {})}
        className={`glas-dun flex min-h-[var(--tap)] w-full items-center gap-3 rounded-[var(--radius-capsule)] py-2 pr-4 pl-2 text-left text-[15px] leading-[1.35] ${
          onAction ? 'zweeftint' : ''
        }`}
      >
        <span
          aria-hidden="true"
          className={`grid size-[30px] shrink-0 place-items-center rounded-full ${rondje}`}
        >
          <Icon size={16} strokeWidth={2} />
        </span>
        <span className={`min-w-0 flex-1 ${tekst}`}>{text}</span>
        {action ? (
          <span className="shrink-0 font-semibold text-[var(--accent)]">{action}</span>
        ) : null}
      </Regel>
    </div>
  )
}
