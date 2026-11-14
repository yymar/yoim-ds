/**
 * De meetkunde van het ronde menu (`components/radial-menu` en wat erop staat):
 * de helderheidsboog, het kleurenwiel en de ring van knoppen. Hoeken in graden
 * zoals op het scherm: 0 is rechts, met de klok mee (y wijst omlaag).
 */

/** De boog loopt van linksonder over de bovenkant naar rechtsonder; de opening van 90° zit onderaan. */
export const ARC_START = 135
export const ARC_END = 405
export const ARC_RADIUS = 96

/** Het kleurenwiel is 164 px; de verzadiging loopt van straal 34 (wit) tot 74 (vol). */
export const WHEEL_RADIUS = 82
export const WHEEL_INNER = 34
export const WHEEL_OUTER = 74

export type WheelColor = { hue: number; saturation: number }

/** Wat de boog meet: helderheid, graden, volume, minuten. */
export type ArcRange = { min: number; max: number; step: number }

/** Helderheid in procenten, de boog zonder meer. */
export const PERCENT: ArcRange = { min: 1, max: 100, step: 1 }

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const decimals = (step: number) => (String(step).split('.')[1] ?? '').length

/** Een waarde op de dichtstbijzijnde stap binnen het bereik. */
export function snap(value: number, { min, max, step }: ArcRange): number {
  return clamp(Number((min + Math.round((value - min) / step) * step).toFixed(decimals(step))), min, max)
}

/** Hoe ver een waarde over de boog is, van 0 tot 1. */
export function arcFraction(value: number, { min, max }: ArcRange = PERCENT): number {
  return max > min ? clamp((value - min) / (max - min), 0, 1) : 0
}

/** De hoek van een punt ten opzichte van het midden, van 0 tot 360. */
export function pointAngle(dx: number, dy: number): number {
  const a = (Math.atan2(dy, dx) * 180) / Math.PI
  return a < 0 ? a + 360 : a
}

/** Waar de duim op de boog staat bij een waarde. */
export function arcAngle(value: number, range: ArcRange = PERCENT): number {
  return ARC_START + (ARC_END - ARC_START) * arcFraction(value, range)
}

/**
 * De waarde bij een hoek, op een stap. In de opening onderaan klemt de helft
 * links van het midden naar het minimum en de helft rechts naar het maximum.
 */
export function arcValue(angle: number, range: ArcRange = PERCENT): number {
  const a = ((angle % 360) + 360) % 360
  if (a >= 90 && a < ARC_START) return range.min
  if (a >= ARC_END - 360 && a < 90) return range.max
  const b = a < 90 ? a + 360 : a
  return snap(range.min + ((b - ARC_START) / (ARC_END - ARC_START)) * (range.max - range.min), range)
}

/** Het pad van de hele boog, voor een SVG met het midden van het menu in 0,0. */
export function arcPath(radius = ARC_RADIUS): string {
  const at = (deg: number) => [radius * Math.cos((deg * Math.PI) / 180), radius * Math.sin((deg * Math.PI) / 180)]
  const [x0, y0] = at(ARC_START)
  const [x1, y1] = at(ARC_END)
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${radius} ${radius} 0 1 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`
}

/** Een pijltoets op de boog, `by` per stap (5% bij helderheid). Null bij een andere toets. */
export function arcKey(value: number, key: string, range: ArcRange = PERCENT, by = 5): number | null {
  if (key === 'ArrowRight' || key === 'ArrowUp') return snap(value + by, range)
  if (key === 'ArrowLeft' || key === 'ArrowDown') return snap(value - by, range)
  return null
}

/** De kleur bij een punt op het wiel: de tint is de hoek, de verzadiging de afstand tot het midden. */
export function wheelColor(dx: number, dy: number): WheelColor {
  const saturation = ((Math.hypot(dx, dy) - WHEEL_INNER) / (WHEEL_OUTER - WHEEL_INNER)) * 100
  return { hue: Math.round(pointAngle(dx, dy)) % 360, saturation: Math.round(clamp(saturation, 0, 100)) }
}

/** Waar de duim op het wiel staat bij een tint en verzadiging. */
export function wheelPoint({ hue, saturation }: WheelColor): { x: number; y: number } {
  const r = WHEEL_INNER + ((WHEEL_OUTER - WHEEL_INNER) * clamp(saturation, 0, 100)) / 100
  const a = (hue * Math.PI) / 180
  return { x: r * Math.cos(a), y: r * Math.sin(a) }
}

/** Een pijltoets op het wiel: links en rechts de tint (10°), omhoog en omlaag de verzadiging (5%). */
export function wheelKey(color: WheelColor, key: string): WheelColor | null {
  if (key === 'ArrowRight') return { ...color, hue: (color.hue + 10) % 360 }
  if (key === 'ArrowLeft') return { ...color, hue: (color.hue + 350) % 360 }
  if (key === 'ArrowUp') return { ...color, saturation: clamp(color.saturation + 5, 0, 100) }
  if (key === 'ArrowDown') return { ...color, saturation: clamp(color.saturation - 5, 0, 100) }
  return null
}

/** Waar knop i van n op de ring staat: twee links en rechts, meer gelijk verdeeld vanaf boven. */
export function ringAngle(i: number, n: number): number {
  return n === 2 ? 180 - i * 180 : -90 + (360 / n) * i
}

/** Hoe een tint en verzadiging op het scherm staan: in een staal, de duim van het wiel. */
export function tint({ hue, saturation }: WheelColor): string {
  return `hsl(${Math.round(hue)} ${Math.round(35 + saturation * 0.6)}% ${Math.round(72 - saturation * 0.16)}%)`
}

const NAMES = ['rood', 'oranje', 'geel', 'groen', 'groen', 'cyaan', 'blauw', 'blauw', 'paars', 'paars', 'roze', 'roze']

/** De naam van een tint, voor de schermlezer en de waarde tijdens het slepen. */
export function hueName(hue: number): string {
  return NAMES[Math.floor((((hue + 15) % 360) + 360) % 360 / 30)]
}
