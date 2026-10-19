import { RefreshCw } from 'lucide-react'

import { LeegStaat } from './leeg-staat'

/**
 * Het scherm bij een storing, voor `error.tsx` en `global-error.tsx`: LeegStaat met de stille knop
 * die het opnieuw probeert (`retry` van Next). Zonder dit scherm geeft Next een kaal scherm, en in
 * de app op het beginscherm is dat doodlopend: er is geen adresbalk om te herladen.
 */
export function FoutScherm({
  retry,
  kop = 'Dat lukte even niet.',
  tekst = 'De verbinding met de database haperde. Meestal is het zo weer terug.',
}: {
  retry: () => void
  kop?: string
  tekst?: string
}) {
  return (
    <main className="schermkolom grid min-h-dvh place-items-center">
      <LeegStaat
        kop={kop}
        tekst={tekst}
        actie={
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex min-h-[var(--tap)] items-center gap-1.5 rounded-[var(--radius-capsule)] border border-[var(--border)] bg-[var(--surface-raised)] px-[18px] text-[15px] font-medium text-[var(--text)]"
          >
            <RefreshCw size={15} strokeWidth={1.9} aria-hidden />
            Opnieuw proberen
          </button>
        }
      />
    </main>
  )
}
