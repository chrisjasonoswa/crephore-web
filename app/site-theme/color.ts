// Colour maths for the event-site theme: WCAG contrast plus an oklch mix that
// mirrors CSS `color-mix(in oklch, …)`, so contrast can be checked in JS.

export const LIGHT_TEXT = '#FFFFFF'
export const DARK_TEXT = '#111827'
export const MIN_CONTRAST = 4.5 // WCAG AA, body text

type Rgb = [number, number, number] // 0–255

export function normalizeHex(hex: string, fallback = '#000000'): string {
  const value = hex.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(value))
    return `#${[...value].map(c => c + c).join('')}`.toUpperCase()
  if (/^[0-9a-f]{6}$/i.test(value))
    return `#${value}`.toUpperCase()
  return fallback
}

function toRgb(hex: string): Rgb {
  const value = normalizeHex(hex).slice(1)
  return [0, 2, 4].map(i => Number.parseInt(value.slice(i, i + 2), 16)) as Rgb
}

function toHex(rgb: Rgb): string {
  return `#${rgb.map(c => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0')).join('')}`.toUpperCase()
}

const toLinear = (c: number) => {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const fromLinear = (c: number) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

export function relativeLuminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map(toLinear) as Rgb
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

const byContrastOn = (bg: string) => (a: string, b: string) => contrastRatio(b, bg) - contrastRatio(a, bg)

/** White or near-black, whichever reads better; pure black if neither reaches AA. */
export function readableTextOn(bg: string): string {
  const best = [LIGHT_TEXT, DARK_TEXT].sort(byContrastOn(bg))[0]!
  if (contrastRatio(best, bg) >= MIN_CONTRAST)
    return best
  return [LIGHT_TEXT, DARK_TEXT, '#000000'].sort(byContrastOn(bg))[0]!
}

/** `a` at `weight` (0–1) over `b`, as alpha compositing does it (sRGB). */
export function mixSrgb(a: string, b: string, weight: number): string {
  const [ca, cb] = [toRgb(a), toRgb(b)]
  return toHex(ca.map((c, i) => c * weight + cb[i]! * (1 - weight)) as Rgb)
}

function toOklch(hex: string): [number, number, number] {
  const [r, g, b] = toRgb(hex).map(toLinear) as Rgb
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
  return [L, Math.hypot(A, B), (Math.atan2(B, A) * 180) / Math.PI]
}

function fromOklch([L, C, H]: [number, number, number]): string {
  const A = C * Math.cos((H * Math.PI) / 180)
  const B = C * Math.sin((H * Math.PI) / 180)
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.2914855480 * B) ** 3
  return toHex([
    fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  ])
}

/** Same result as `color-mix(in oklch, a <weight*100>%, b)`. */
export function mixOklch(a: string, b: string, weight: number): string {
  const [ca, cb] = [toOklch(a), toOklch(b)]
  const achromatic = (c: number) => c < 1e-4 // hue is "powerless": take the other colour's hue
  let [ha, hb] = [ca[2], cb[2]]
  if (achromatic(ca[1]))
    ha = hb
  if (achromatic(cb[1]))
    hb = ha
  if (hb - ha > 180)
    ha += 360
  else if (ha - hb > 180)
    hb += 360
  return fromOklch([
    ca[0] * weight + cb[0] * (1 - weight),
    ca[1] * weight + cb[1] * (1 - weight),
    ha * weight + hb * (1 - weight),
  ])
}

/**
 * Fade `fg` towards `bg` (starting at `weight`) only as far as contrast allows.
 * Used for muted text: it looks softer but never drops below AA.
 */
export function fadeTowards(fg: string, bg: string, weight: number, min = MIN_CONTRAST): string {
  for (let w = Math.round(weight * 100); w < 100; w += 5) {
    const mixed = mixSrgb(fg, bg, w / 100)
    if (contrastRatio(mixed, bg) >= min)
      return mixed
  }
  return fg
}
