/**
 * De pure logica van `SegmentedChoice`: welke keuze een toets kiest, en of het
 * aantal keuzes past.
 */

export const MIN_OPTIONS = 2
export const MAX_OPTIONS = 4

/**
 * De keuze na een toets in de radiogroep, of `null` als de toets niets doet.
 * Pijltjes lopen rond, Home en End springen naar het begin en het eind.
 */
export function nextIndex(key: string, current: number, count: number): number | null {
  if (count < 1) return null
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (current + 1) % count
    case 'ArrowLeft':
    case 'ArrowUp':
      return (current - 1 + count) % count
    case 'Home':
      return 0
    case 'End':
      return count - 1
    default:
      return null
  }
}

/** De waarschuwing bij te weinig of te veel keuzes, of `null` als het past. */
export function optionCountWarning(count: number): string | null {
  if (count >= MIN_OPTIONS && count <= MAX_OPTIONS) return null
  return `SegmentedChoice: ${count} keuzes, verwacht ${MIN_OPTIONS} tot ${MAX_OPTIONS}. Meer past niet op een telefoon; gebruik dan een lijst.`
}
