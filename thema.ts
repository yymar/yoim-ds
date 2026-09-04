/**
 * Het thema van de app.
 *
 * Standaard volgt de app de telefoon. Kiest iemand in de zijbalk licht of
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
 * Dit draait als eerste in de `<head>`, vóór de eerste verf. Zonder dit staat
 * de app een frame lang in het systeemthema en flitst hij om zodra React
 * wakker wordt.
 */
export const THEMA_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(THEMA_SLEUTEL)});if(t==='licht'||t==='donker'){document.documentElement.dataset.thema=t}}catch(e){}`
