/**
 * Het thema van de app.
 *
 * Standaard volgt de app de telefoon. Kiest iemand in de navigatie licht of
 * donker, dan staat die keuze als `data-thema` op `<html>` en blijft hij in
 * `localStorage`. Eén scherm gaat daar weer overheen: het inlogscherm zet
 * `data-thema` op zijn eigen `main`, want dat volgt het uur.
 */
export type Thema = 'licht' | 'donker' | 'systeem'

export const THEMA_SLEUTEL = 'yoim-thema'

/**
 * De twee `--surface`-waarden uit `app/globals.css`.
 *
 * Ze staan hier ook los, want `meta[name=theme-color]` kan geen CSS-variabele
 * lezen: de balk boven de app moet als losse hex mee. Verander je het palet,
 * dan verander je ze hier ook.
 */
export const SURFACE = {
  licht: '#f7f6f1',
  donker: '#131511',
} as const

/**
 * De metas die de balk boven de app kleuren, één per `prefers-color-scheme`.
 * Een enkele meta zonder `media` (het inlogscherm, dat het uur volgt) blijft
 * zoals hij is.
 */
const THEME_COLOR = 'meta[name=theme-color][media]'

/**
 * De `media` van zo'n meta bij een keuze. Licht of donker: de meta van dat
 * thema geldt altijd (`all`), de andere nooit (`not all`). De kleur blijft
 * staan, want React herkent een meta bij het hydrateren aan zijn `content`.
 * Systeem: de oorspronkelijke `media` terug.
 */
export function themeColorMedia(original: string, theme: Thema): string {
  if (theme === 'systeem') return original
  return /dark/.test(original) === (theme === 'donker') ? 'all' : 'not all'
}

/**
 * Dit draait als eerste in de `<head>`, vóór de eerste verf. Zonder dit staat
 * de app een frame lang in het systeemthema en flitst hij om zodra React
 * wakker wordt. Met een keuze zet het ook de balk boven de app goed, zoals
 * `themeColorMedia` (de metas staan in de HTML van Next vóór dit script).
 */
export const THEMA_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(THEMA_SLEUTEL)});if(t==='licht'||t==='donker'){document.documentElement.dataset.thema=t;document.querySelectorAll(${JSON.stringify(THEME_COLOR)}).forEach(function(m){var o=m.getAttribute('media')||'';m.setAttribute('data-media',o);m.setAttribute('media',/dark/.test(o)===(t==='donker')?'all':'not all')})}}catch(e){}`

/**
 * De tooltip bij een knop van Weergave; bij een gekozen Systeem ook wat het nu
 * volgt. Met `next` (de ene knop op desktop die doorschuift) ook waar een klik
 * heen gaat.
 */
export function themeTip(button: Thema, chosen: Thema | undefined, systemDark: boolean, next?: Thema): string {
  const tip =
    button === 'licht'
      ? 'Licht'
      : button === 'donker'
        ? 'Donker'
        : `Systeem · volgt je apparaat${chosen === 'systeem' ? `, nu ${systemDark ? 'donker' : 'licht'}` : ''}`
  return next ? `${tip}. Klik voor ${next}` : tip
}

/** Waar de ene themaknop op desktop heen schuift. */
export function nextTheme(current: Thema, system: boolean): Thema {
  if (current === 'licht') return 'donker'
  if (current === 'donker' && system) return 'systeem'
  return 'licht'
}

export const DARK = '(prefers-color-scheme: dark)'

/** Seint bij elke wissel van het apparaat tussen licht en donker. */
export function subscribeDark(onChange: () => void) {
  const query = window.matchMedia(DARK)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/** Het bericht dat `chooseTheme` zelf stuurt, want `storage` vuurt alleen in andere tabbladen. */
const GEKOZEN = 'yoim-thema'

function applyTheme(theme: string | null) {
  const chosen: Thema = theme === 'licht' || theme === 'donker' ? theme : 'systeem'
  if (chosen === 'systeem') document.documentElement.removeAttribute('data-thema')
  else document.documentElement.setAttribute('data-thema', chosen)
  document.querySelectorAll(THEME_COLOR).forEach((meta) => {
    const original = meta.getAttribute('data-media') ?? meta.getAttribute('media') ?? ''
    meta.setAttribute('data-media', original)
    meta.setAttribute('media', themeColorMedia(original, chosen))
  })
}

/**
 * De keuze als store voor `useSyncExternalStore`, samen met `chosenTheme`:
 * `useSyncExternalStore(subscribeTheme, chosenTheme, () => 'systeem')`.
 * Seint bij een keuze in dit tabblad en volgt een keuze in een ander.
 */
export function subscribeTheme(onChange: () => void) {
  const elders = (e: StorageEvent) => {
    // Zonder key is de hele opslag gewist, en dus ook de keuze.
    if (e.key !== null && e.key !== THEMA_SLEUTEL) return
    applyTheme(e.key === null ? null : e.newValue)
    onChange()
  }
  window.addEventListener('storage', elders)
  window.addEventListener(GEKOZEN, onChange)
  return () => {
    window.removeEventListener('storage', elders)
    window.removeEventListener(GEKOZEN, onChange)
  }
}

/** Wat iemand koos; zonder keuze volgt de app het systeem. */
export function chosenTheme(): Thema {
  const chosen = document.documentElement.getAttribute('data-thema')
  return chosen === 'licht' || chosen === 'donker' ? chosen : 'systeem'
}

/** Zet de keuze op `<html>` en in `localStorage`; Systeem haalt hem weg. */
export function chooseTheme(next: Thema) {
  try {
    if (next === 'systeem') localStorage.removeItem(THEMA_SLEUTEL)
    else localStorage.setItem(THEMA_SLEUTEL, next)
  } catch {}
  applyTheme(next)
  window.dispatchEvent(new Event(GEKOZEN))
}
