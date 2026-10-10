/**
 * Of de pagina van bovenaf weg is gescrold. Daarop klapt de capsule van
 * Navigation op de telefoon in tot iconen. Uit mone.yoim, met dezelfde drempels.
 */

/**
 * Hysterese: inklappen voorbij 40px, pas weer uitklappen onder 12px. Met één
 * drempel flipte de capsule heen en weer als je vinger of de uitrolbeweging
 * rond die lijn bleef hangen, en elke flip start een nieuwe glasanimatie.
 */
export const COLLAPSE_AFTER = 40
export const EXPAND_BELOW = 12

/** De volgende stand, uit de huidige stand en `scrollY`. */
export function nextScrolled(scrolled: boolean, y: number): boolean {
  return scrolled ? y > EXPAND_BELOW : y > COLLAPSE_AFTER
}

let scrolled = false
let frame = 0
const listeners = new Set<() => void>()

function measure() {
  frame = 0
  const next = nextScrolled(scrolled, window.scrollY)
  if (next === scrolled) return
  scrolled = next
  listeners.forEach((listener) => listener())
}

// Lezen in een frame, niet in de scrollhandler zelf: zo komt er per frame
// hooguit één meting, wat de browser ook aan scrollevents afvuurt.
function onScroll() {
  if (!frame) frame = requestAnimationFrame(measure)
}

/**
 * Eén scrollluisteraar voor iedereen, anders ziet de tweede de wijziging niet
 * meer: de eerste zet de gedeelde stand al om. Voor `useSyncExternalStore`.
 */
export function subscribeScrolled(listener: () => void) {
  if (listeners.size === 0) {
    scrolled = nextScrolled(false, window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
  }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size > 0) return
    window.removeEventListener('scroll', onScroll)
    cancelAnimationFrame(frame)
    frame = 0
  }
}

export function isScrolled() {
  return scrolled
}
