/**
 * De browserkant van de toestand-check. Deze functies draaien in de pagina:
 * `run.ts` zet ze met de meetkunde uit `geometry.ts` via `toString()` in één
 * script, dus ze gebruiken alleen namen uit dat bestand en de DOM.
 */
import { clampRadii, clipped, ringShape, touching, type Box, type Radii } from './geometry.ts'

export type Problem = { rule: string; target: string; other: string; px: number }

export const TARGETS =
  'a[href], button, summary, label, [role="button"], [role="switch"], [role="tab"], [role="radio"], [role="option"], [role="menuitem"], [tabindex]:not([tabindex="-1"]), .rij, .zweeftint'

/** Wat een vlak kan tonen: een hovertint, een ingedrukte tint of een gekozen staat. */
export const FILLS = '.zweeftint, .rij, [aria-current]:not([aria-current="false"]), [aria-selected="true"], [aria-pressed="true"], [aria-checked="true"]'

export function describe(el: Element): string {
  const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 5).join('.') : ''
  const text = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)
  return `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}${text ? ` "${text}"` : ''}`
}

/** Een outline die je ziet: niet `none`, breder dan 0 en niet transparant (energ zet er een klaar voor hover). */
export function outlineWidth(s: CSSStyleDeclaration): number {
  const color = s.outlineColor.replace(/\s/g, '')
  if (s.outlineStyle === 'none' || color === 'transparent' || /rgba\([^)]*,0\)$/.test(color)) return 0
  return parseFloat(s.outlineWidth) || 0
}

export function boxOf(el: Element): Box {
  const r = el.getBoundingClientRect()
  return { l: r.left, t: r.top, r: r.right, b: r.bottom }
}

export function radiiOf(el: Element): Radii {
  const s = getComputedStyle(el)
  const r = el.getBoundingClientRect()
  const px = (v: string) => parseFloat(v) || 0
  return clampRadii({ tl: px(s.borderTopLeftRadius), tr: px(s.borderTopRightRadius), br: px(s.borderBottomRightRadius), bl: px(s.borderBottomLeftRadius) }, r.width, r.height)
}

/** De vorm waarbinnen een voorouder knipt: zijn padding-box met de binnenradius. Null als hij niet knipt. */
export function clipOf(el: Element): { box: Box; radii: Radii } | null {
  const s = getComputedStyle(el)
  if (s.overflowX === 'visible' && s.overflowY === 'visible') return null
  const outer = boxOf(el)
  const w = { l: parseFloat(s.borderLeftWidth), t: parseFloat(s.borderTopWidth), r: parseFloat(s.borderRightWidth), b: parseFloat(s.borderBottomWidth) }
  const r = radiiOf(el)
  const radii = { tl: Math.max(0, r.tl - Math.max(w.l, w.t)), tr: Math.max(0, r.tr - Math.max(w.r, w.t)), br: Math.max(0, r.br - Math.max(w.r, w.b)), bl: Math.max(0, r.bl - Math.max(w.l, w.b)) }
  return { box: { l: outer.l + w.l, t: outer.t + w.t, r: outer.r - w.r, b: outer.b - w.b }, radii }
}

export function visible(el: Element): boolean {
  if (el.matches('input, textarea, select') || el.closest('[aria-hidden="true"], [inert]')) return false
  const s = getComputedStyle(el)
  const r = el.getBoundingClientRect()
  return s.visibility !== 'hidden' && s.display !== 'contents' && r.width >= 2 && r.height >= 2
}

/** Het eerste afgeknipte stuk van `el` door een voorouder, of null. */
export function clippedByAncestor(el: Element, kind: 'ring' | 'fill'): Problem | null {
  const s = getComputedStyle(el)
  const outline = outlineWidth(s)
  const { box: shape, radii } = kind === 'ring' ? ringShape(boxOf(el), radiiOf(el), outline, parseFloat(s.outlineOffset) || 0) : { box: boxOf(el), radii: radiiOf(el) }
  for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
    const clip = clipOf(a)
    if (!clip || (kind === 'fill' && !clip.radii.tl && !clip.radii.tr && !clip.radii.br && !clip.radii.bl)) continue
    const px = clipped(shape, radii, clip.box, clip.radii, kind)
    if (px > 0) {
      return { rule: kind === 'ring' ? 'focusring afgeknipt door ronding' : 'vlak half afgeknipt door ronding', target: describe(el), other: describe(a).split(' "')[0], px }
    }
  }
  return null
}

/** Alles wat zonder interactie te meten is: vlakken in een hoekzone en afgeronde vlakken die elkaar raken. */
export function staticProblems(): Problem[] {
  const problems: Problem[] = []
  const fills: { el: Element; box: Box }[] = []
  for (const el of document.querySelectorAll(TARGETS)) {
    if (!visible(el)) continue
    const problem = clippedByAncestor(el, 'fill')
    if (problem) problems.push(problem)
    const r = radiiOf(el)
    if (el.matches(FILLS) && (r.tl || r.tr || r.br || r.bl)) fills.push({ el, box: boxOf(el) })
  }
  for (let i = 0; i < fills.length; i++) {
    for (let j = i + 1; j < fills.length; j++) {
      const a = fills[i]
      const b = fills[j]
      // Alleen buren in dezelfde lijst; een vaste nav of een sheet over een lijst raakt die toevallig.
      const neighbours = a.el.parentElement === b.el.parentElement || a.el.parentElement?.parentElement === b.el.parentElement?.parentElement
      if (!neighbours || a.el.contains(b.el) || b.el.contains(a.el) || !touching(a.box, b.box)) continue
      problems.push({ rule: 'afgeronde vlakken raken elkaar', target: describe(a.el), other: describe(b.el), px: 0 })
    }
  }
  return problems
}

/**
 * Wie de ring tekent als het element het zelf niet doet: een `::before` of
 * `::after` (dan 'pseudo', niet te meten), of een voorouder met een outline,
 * zoals een balk om een stuk dat hij knipt. Null als niemand het doet.
 */
export function ringHost(el: Element): Element | 'pseudo' | null {
  for (let a: Element | null = el, i = 0; a && i < 5; a = a.parentElement, i++) {
    for (const pseudo of ['::before', '::after']) {
      const p = getComputedStyle(a, pseudo)
      if (p.content !== 'none' && (p.boxShadow !== 'none' || outlineWidth(p) || parseFloat(p.borderTopWidth))) return 'pseudo'
    }
    const s = getComputedStyle(a)
    if (a !== el && outlineWidth(s)) return a
  }
  return null
}

/** `--accent` zoals getComputedStyle hem schrijft, om de ring van het DS te herkennen tussen andere schaduwen. */
export function accentColor(): string {
  const probe = document.createElement('i')
  probe.style.color = 'var(--accent)'
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

/** Of de outline er ook zonder focus is, zoals de markering van vandaag in een kalender: een ongefocuste kloon laat het zien. */
export function markedWithoutFocus(el: Element): boolean {
  const clone = el.cloneNode(false) as HTMLElement
  clone.style.position = 'absolute'
  clone.style.visibility = 'hidden'
  el.parentElement?.append(clone)
  const marked = outlineWidth(getComputedStyle(clone)) > 0
  clone.remove()
  return marked
}

/** Wat alleen in focus te zien is: de ring van het element dat nu focus heeft. */
export function focusProblems(): Problem[] {
  const el = document.activeElement
  if (!el || el === document.body || !visible(el) || !el.matches(':focus-visible')) return []
  const problems: Problem[] = []
  const s = getComputedStyle(el)
  // Geen eigen ring: dan moet een pseudo-element hem tekenen, zoals de rij in weekl.
  if (s.boxShadow === 'none' && !outlineWidth(s)) {
    const host = ringHost(el)
    if (!host) problems.push({ rule: 'geen zichtbare focusring', target: describe(el), other: '', px: 0 })
    const ring = host instanceof Element ? clippedByAncestor(host, 'ring') : null
    if (ring) problems.push({ ...ring, target: describe(el) })
    return problems
  }
  if (s.boxShadow.includes(accentColor()) && outlineWidth(s) && !markedWithoutFocus(el) && !matchMedia('(forced-colors: active)').matches) {
    problems.push({ rule: 'dubbele focusring', target: describe(el), other: '', px: 0 })
  }
  const ring = clippedByAncestor(el, 'ring')
  if (ring) problems.push(ring)
  const own = radiiOf(el)
  if (Math.max(own.tl, own.tr, own.br, own.bl) < 1) {
    const box = boxOf(el)
    for (const kid of el.querySelectorAll('*')) {
      const k = boxOf(kid)
      const fills = Math.abs(k.l - box.l) < 2 && Math.abs(k.r - box.r) < 2 && Math.abs(k.t - box.t) < 2 && Math.abs(k.b - box.b) < 2
      const round = radiiOf(kid)
      if (fills && Math.min(round.tl, round.tr, round.br, round.bl) >= 4) {
        problems.push({ rule: 'hoekige focusring om ronde inhoud', target: describe(el), other: describe(kid).split(' "')[0], px: round.tl })
        break
      }
    }
  }
  return problems
}
