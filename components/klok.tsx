'use client'

import { useEffect, useState } from 'react'

import { tijdDelen } from '../auth/moment'

/**
 * De lopende tijd, tot op de seconde.
 *
 * Dit is het enige in het hele product dat vanzelf beweegt, en het beweegt
 * omdat het de waarheid vertelt. De begintijd komt van de server zodat het
 * eerste beeld gelijk klopt en er geen hydratieverschil ontstaat.
 */
export function Klok({ begin }: { begin: number }) {
  const [ms, setMs] = useState(begin)

  useEffect(() => {
    const tik = setInterval(() => setMs(Date.now()), 1000)

    return () => clearInterval(tik)
  }, [])

  const { dag, klok, seconden } = tijdDelen(ms)

  return (
    <span className="flex items-baseline gap-2 tabular-nums">
      <span className="text-[15px] text-[var(--text-muted)]">{dag}</span>
      <b className="text-[22px] font-semibold tracking-[-0.01em] text-[var(--text)]">
        {klok}
      </b>
      <i className="text-[15px] not-italic text-[var(--text-subtle)]">
        {seconden}
      </i>
    </span>
  )
}
