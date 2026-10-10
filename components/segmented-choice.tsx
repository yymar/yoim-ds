'use client'

import { useEffect, useId, useLayoutEffect, useRef } from 'react'

import { nextIndex, optionCountWarning } from '../segment'

export type SegmentedOption<T extends string = string> = {
  id: T
  label: string
  /** Een lucide-icoon op 16px. */
  icon?: React.ReactNode
  /** Alleen het icoon; het label gaat naar de schermlezer. */
  iconOnly?: boolean
  /** Met `color` of `initial` staat er een avatar (20px) in plaats van het icoon. */
  color?: string
  initial?: string
}

export type SegmentedChoiceProps<T extends string = string> = {
  /** De naam van de keuze. Zonder `showLabel` alleen voor de schermlezer. */
  label: string
  showLabel?: boolean
  /** Twee tot vier keuzes. */
  options: readonly SegmentedOption<T>[]
  value: T | undefined
  onChange: (id: T) => void
  /** Uitleg bij de keuze, voorgelezen als hij verandert. */
  description?: React.ReactNode
  descriptionPlacement?: 'above' | 'below'
  /** Wat de gekozen optie toont in plaats van zijn icoon of avatar; `null` houdt het gewone. */
  renderSelectedIcon?: (option: SegmentedOption<T>) => React.ReactNode
}

/**
 * Een keuze uit twee tot vier, als segmenten in een capsule. Het plaatje onder
 * de gekozen optie glijdt mee. Een radiogroep: de pijltjes kiezen en lopen
 * rond, Home en End springen naar het begin en het eind.
 */
export function SegmentedChoice<T extends string>({
  label,
  showLabel = false,
  options,
  value,
  onChange,
  description,
  descriptionPlacement = 'below',
  renderSelectedIcon,
}: SegmentedChoiceProps<T>) {
  const id = useId()
  const labelId = `${id}-label`
  const uitlegId = `${id}-uitleg`
  const baan = useRef<HTMLDivElement>(null)
  const knoppen = useRef<Array<HTMLButtonElement | null>>([])
  const gekozen = options.findIndex((option) => option.id === value)

  useEffect(() => {
    const waarschuwing = optionCountWarning(options.length)
    if (waarschuwing) console.warn(waarschuwing)
  }, [options.length])

  // Het plaatje meet de gekozen optie, want die groeit met zijn inhoud. Met de
  // schaal van de rects erbij, zodat een sheet die nog inschaalt niet meetelt.
  useLayoutEffect(() => {
    const el = baan.current
    if (!el) return
    let frame = 0

    const meet = () => {
      const knop = knoppen.current[gekozen]
      if (!knop) {
        el.removeAttribute('data-gemeten')
        return
      }
      const b = el.getBoundingClientRect()
      const k = knop.getBoundingClientRect()
      const schaal = el.offsetWidth ? b.width / el.offsetWidth : 1
      el.style.setProperty('--x', `${(k.left - b.left) / schaal - el.clientLeft}px`)
      el.style.setProperty('--w', `${k.width / schaal}px`)
      if (el.hasAttribute('data-gemeten')) return
      el.setAttribute('data-gemeten', '')
      // De eerste stand staat er meteen; pas daarna glijdt het plaatje.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => el.setAttribute('data-glijdt', ''))
      })
    }

    meet()
    const observer = new ResizeObserver(meet)
    observer.observe(el)
    knoppen.current.slice(0, options.length).forEach((knop) => knop && observer.observe(knop))
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [gekozen, options.length])

  const uitleg =
    description === undefined ? null : (
      <p id={uitlegId} aria-live="polite" className="segment-uitleg">
        {description}
      </p>
    )

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {showLabel ? (
        <span id={labelId} className="text-[13px] font-medium text-[var(--text-muted)]">
          {label}
        </span>
      ) : null}
      {descriptionPlacement === 'above' ? uitleg : null}

      <div
        ref={baan}
        role="radiogroup"
        aria-label={showLabel ? undefined : label}
        aria-labelledby={showLabel ? labelId : undefined}
        className="segment"
      >
        <span aria-hidden="true" className="segment-plaatje" />
        {options.map((option, i) => {
          const aan = i === gekozen
          const eigen = aan && renderSelectedIcon ? renderSelectedIcon(option) : null
          const avatar = option.color !== undefined || option.initial !== undefined

          return (
            <button
              key={option.id}
              ref={(knop) => {
                knoppen.current[i] = knop
              }}
              type="button"
              role="radio"
              aria-checked={aan}
              aria-label={option.iconOnly ? option.label : undefined}
              aria-describedby={uitleg ? uitlegId : undefined}
              tabIndex={aan || (gekozen === -1 && i === 0) ? 0 : -1}
              onClick={() => onChange(option.id)}
              onKeyDown={(e) => {
                const volgende = nextIndex(e.key, i, options.length)
                if (volgende === null) return
                e.preventDefault()
                knoppen.current[volgende]?.focus()
                onChange(options[volgende].id)
              }}
              className="segment-optie"
            >
              {eigen ??
                (avatar ? (
                  <span aria-hidden="true" className="segment-avatar" style={{ background: option.color }}>
                    {option.initial}
                  </span>
                ) : (
                  option.icon
                ))}
              {option.iconOnly ? null : <span className="truncate">{option.label}</span>}
            </button>
          )
        })}
      </div>

      {descriptionPlacement === 'below' ? uitleg : null}
    </div>
  )
}
