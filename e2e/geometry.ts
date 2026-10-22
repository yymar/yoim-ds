/**
 * Meetkunde voor de toestand-check: hoeken van een tikdoel tegen de ronding
 * van een voorouder die knipt. Pure functies zonder DOM, zodat de browserkant
 * (`page.ts`) ze via `toString()` kan meenemen en vitest ze los kan toetsen.
 */

export type Box = { l: number; t: number; r: number; b: number }
export type Radii = { tl: number; tr: number; br: number; bl: number }
export type Point = { x: number; y: number }

/** Onder deze afstand in px telt iets niet: subpixels en antialiasing. */
export const TOLERANCE = 0.75

/** Een radius kan nooit groter zijn dan de helft van de zijde, net als in CSS. */
export function clampRadii(r: Radii, width: number, height: number): Radii {
  const max = Math.min(width, height) / 2
  return { tl: Math.min(r.tl, max), tr: Math.min(r.tr, max), br: Math.min(r.br, max), bl: Math.min(r.bl, max) }
}

/** De vier hoeken van een vorm: een punt bij een scherpe hoek, negen punten op de boog bij een ronde. */
export function cornerPoints(b: Box, r: Radii): Point[] {
  const points: Point[] = []
  const corner = (radius: number, cx: number, cy: number, start: number, sharp: Point) => {
    if (radius <= 0) {
      points.push(sharp)
      return
    }
    for (let i = 0; i <= 8; i++) {
      const a = start + (i / 8) * (Math.PI / 2)
      points.push({ x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) })
    }
  }
  corner(r.tl, b.l + r.tl, b.t + r.tl, Math.PI, { x: b.l, y: b.t })
  corner(r.tr, b.r - r.tr, b.t + r.tr, 1.5 * Math.PI, { x: b.r, y: b.t })
  corner(r.br, b.r - r.br, b.b - r.br, 0, { x: b.r, y: b.b })
  corner(r.bl, b.l + r.bl, b.b - r.bl, 0.5 * Math.PI, { x: b.l, y: b.b })
  return points
}

/**
 * Hoever een punt buiten de afgeronde vorm valt, in px. Buiten de rechthoek
 * zelf telt alleen als `outside` aan staat: voor een vlak is dat scrollen of
 * bewuste overloop, voor een focusring is het gewoon weg.
 */
export function outsideRounding(p: Point, b: Box, r: Radii, outside = false): number {
  const dx = Math.max(b.l - p.x, p.x - b.r, 0)
  const dy = Math.max(b.t - p.y, p.y - b.b, 0)
  // Een ring die 1px over een scrollrand valt, blijft gewoon te zien.
  if (dx > TOLERANCE || dy > TOLERANCE) return outside && Math.hypot(dx, dy) > 1 ? Math.hypot(dx, dy) : 0
  const zones: [number, number, number, boolean][] = [
    [r.tl, b.l + r.tl, b.t + r.tl, p.x < b.l + r.tl && p.y < b.t + r.tl],
    [r.tr, b.r - r.tr, b.t + r.tr, p.x > b.r - r.tr && p.y < b.t + r.tr],
    [r.br, b.r - r.br, b.b - r.br, p.x > b.r - r.br && p.y > b.b - r.br],
    [r.bl, b.l + r.bl, b.b - r.bl, p.x < b.l + r.bl && p.y > b.b - r.bl],
  ]
  for (const [radius, cx, cy, inZone] of zones) {
    if (radius > 0 && inZone) {
      const d = Math.hypot(p.x - cx, p.y - cy) - radius
      if (d > TOLERANCE) return d
    }
  }
  return 0
}

/** Of een punt precies op een hoek van de voorouder ligt: dan volgt een vulling de ronding vanzelf. */
export function onCorner(p: Point, b: Box): boolean {
  const near = (a: number, c: number) => Math.abs(a - c) <= 1
  return (near(p.x, b.l) || near(p.x, b.r)) && (near(p.y, b.t) || near(p.y, b.b))
}

/**
 * Hoeveel px van een vorm de voorouder wegknipt.
 *
 * - `ring`: een focusring is een inset box-shadow langs de rand van het
 *   element; elk afgeknipt stukje is een gat in de ring.
 * - `fill`: een hover- of gekozen-vlak mag precies in de hoek van de voorouder
 *   liggen, want dan volgt het de ronding. Half in de hoekzone niet: dan blijft
 *   er een reep over of een hoek die er schuin af lijkt.
 */
export function clipped(shape: Box, shapeRadii: Radii, clip: Box, clipRadii: Radii, kind: 'ring' | 'fill'): number {
  let worst = 0
  for (const p of cornerPoints(shape, shapeRadii)) {
    if (kind === 'fill' && onCorner(p, clip)) continue
    worst = Math.max(worst, outsideRounding(p, clip, clipRadii, kind === 'ring'))
  }
  return Math.round(worst * 10) / 10
}

/** De vorm van een focusindicator: de rand van het element, of een outline die er buiten of binnen ligt. */
export function ringShape(b: Box, r: Radii, outlineWidth: number, outlineOffset: number): { box: Box; radii: Radii } {
  const grow = outlineWidth > 0 ? outlineOffset + outlineWidth : 0
  const radius = (x: number) => (x > 0 ? Math.max(0, x + grow) : 0)
  return {
    box: { l: b.l - grow, t: b.t - grow, r: b.r + grow, b: b.b + grow },
    radii: { tl: radius(r.tl), tr: radius(r.tr), br: radius(r.br), bl: radius(r.bl) },
  }
}

/** Twee vlakken die elkaar raken zonder in elkaar te zitten: tussen 1px overlap en 1px ruimte. */
export function touching(a: Box, b: Box): boolean {
  const overlapX = Math.min(a.r, b.r) - Math.max(a.l, b.l)
  const overlapY = Math.min(a.b, b.b) - Math.max(a.t, b.t)
  const gapX = Math.max(b.l - a.r, a.l - b.r)
  const gapY = Math.max(b.t - a.b, a.t - b.b)
  return (overlapX > 8 && Math.abs(gapY) < 1) || (overlapY > 8 && Math.abs(gapX) < 1)
}
