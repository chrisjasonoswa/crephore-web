// Colour maths for the event-site theme: WCAG contrast plus an oklch mix that
// mirrors CSS `color-mix(in oklch, …)`, so contrast can be checked in JS.

export const LIGHT_TEXT = '#FFFFFF'
export const DARK_TEXT = '#111827'
// The least contrast any site text has: 3:1, WCAG's floor for large text, chosen for every size so hosts' colours show
// as picked more often (below AA, 4.5:1, for small text: a deliberate choice).
export const MIN_CONTRAST = 3

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

/*
 * White text wins whenever it reaches this contrast, even where near-black would contrast more: white on a colour
 * usually looks better. Lower it for more white; below MIN_CONTRAST, white text gets less contrast than other text, and
 * the contrast tests in useSiteTheme.test.ts follow it (`textContrastFloor`).
 */
export const PREFER_WHITE_FROM = 2.2

/** The least contrast text from `readableTextOn` has: PREFER_WHITE_FROM for white, MIN_CONTRAST otherwise. */
export function textContrastFloor(text: string): number {
  return normalizeHex(text) === LIGHT_TEXT ? Math.min(PREFER_WHITE_FROM, MIN_CONTRAST) : MIN_CONTRAST
}

/** White or near-black, whichever contrasts more; pure black if neither reaches MIN_CONTRAST. No preference for white. */
function bestContrastOn(bg: string): string {
  const best = [LIGHT_TEXT, DARK_TEXT].sort(byContrastOn(bg))[0]!
  if (contrastRatio(best, bg) >= MIN_CONTRAST)
    return best
  return [LIGHT_TEXT, DARK_TEXT, '#000000'].sort(byContrastOn(bg))[0]!
}

/** Text on a colour: white when it reaches PREFER_WHITE_FROM, else whichever of white and near-black reads better. */
export function readableTextOn(bg: string): string {
  if (contrastRatio(LIGHT_TEXT, bg) >= PREFER_WHITE_FROM)
    return LIGHT_TEXT
  return bestContrastOn(bg)
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

/** oklch → linear sRGB (0–1 when the colour is displayable; outside that range it is out of gamut). */
function oklchToLinearRgb([L, C, H]: [number, number, number]): Rgb {
  const A = C * Math.cos((H * Math.PI) / 180)
  const B = C * Math.sin((H * Math.PI) / 180)
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.2914855480 * B) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ]
}

function fromOklch(lch: [number, number, number]): string {
  return toHex(oklchToLinearRgb(lch).map(fromLinear) as Rgb)
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
 * Used for muted text: it looks softer but never drops below MIN_CONTRAST.
 */
export function fadeTowards(fg: string, bg: string, weight: number, min = MIN_CONTRAST): string {
  for (let w = Math.round(weight * 100); w < 100; w += 5) {
    const mixed = mixSrgb(fg, bg, w / 100)
    if (contrastRatio(mixed, bg) >= min)
      return mixed
  }
  return fg
}

/**
 * `color` if it reaches `min` contrast on every background in `bgs`; otherwise the same colour made darker or
 * lighter, whichever reaches `min` with the smaller change (e.g. a teal on a mid pink becomes a pale teal or a deep
 * one, whichever is nearer). Only the oklch lightness changes, so hue and saturation are kept: a pink stays pink.
 * Used when a brand colour is used as text, a button or a highlight.
 */
export function ensureContrast(color: string, bgs: string[], min = MIN_CONTRAST): string {
  const passes = (candidate: string) => bgs.every(bg => contrastRatio(candidate, bg) >= min)
  const normalized = normalizeHex(color)
  if (passes(normalized))
    return normalized

  // Step away from the colour in both directions at once; the first that passes is the nearer one
  const [lightness, chroma, hue] = toOklch(normalized)
  for (let change = 0.02; change < 1; change += 0.02) {
    for (const l of [lightness - change, lightness + change]) {
      if (l <= 0 || l >= 1)
        continue
      const adjusted = fromOklch([l, chroma, hue])
      if (passes(adjusted))
        return adjusted
    }
  }
  // Neither gets there: whichever end reads best (not the white preference), so it always reaches `min` if anything can
  return bestContrastOn(bgs[0]!)
}

/**
 * `color` if it `passes`; otherwise the same colour made lighter (oklch lightness only, keeping the hue) until it does,
 * or white. For colours that must stay light, e.g. brand text on a photo under its dark overlay.
 */
export function lightenUntil(color: string, passes: (candidate: string) => boolean): string {
  const normalized = normalizeHex(color)
  if (passes(normalized))
    return normalized
  const [lightness, chroma, hue] = toOklch(normalized)
  for (let l = lightness + 0.02; l < 1; l += 0.02) {
    const adjusted = fromOklch([l, chroma, hue])
    if (passes(adjusted))
      return adjusted
  }
  return LIGHT_TEXT
}

/** Perceptual distance between two colours (Euclidean distance in OKLab; 0 = identical, ~0.02 = barely visible). */
export function colorDistance(a: string, b: string): number {
  const toOklab = (hex: string) => {
    const [L, C, H] = toOklch(hex)
    return [L, C * Math.cos((H * Math.PI) / 180), C * Math.sin((H * Math.PI) / 180)]
  }
  const [la, aa, ba] = toOklab(a) as [number, number, number]
  const [lb, ab, bb] = toOklab(b) as [number, number, number]
  return Math.hypot(la - lb, aa - ab, ba - bb)
}

// Below this chroma a colour counts as grey: its hue is meaningless, so no colour is added to it.
const NEUTRAL_CHROMA = 0.01

/**
 * A dark "tonal" version of a colour: the same hue at a fixed oklch lightness, with at least
 * `minChroma` of colour. Unlike mixing with black, every colour ends up equally dark and pale
 * colours keep their character (pale pink → deep wine, not taupe). Greys stay grey.
 * Chroma is reduced if needed so the result can be displayed (sRGB gamut) without shifting the hue.
 */
export function tonalShade(hex: string, lightness: number, minChroma: number): string {
  const [, chroma, hue] = toOklch(hex)
  let c = chroma < NEUTRAL_CHROMA ? chroma : Math.max(chroma, minChroma)

  const inGamut = (candidate: number) =>
    oklchToLinearRgb([lightness, candidate, hue]).every(channel => channel >= -1e-4 && channel <= 1 + 1e-4)
  while (c > 0 && !inGamut(c))
    c = Math.max(0, c - 0.002)

  return fromOklch([lightness, c, hue])
}

/**
 * `hex` kept light enough for a light page background: oklch lightness raised to at least `minLightness`
 * and chroma capped at `maxChroma` (a soft tint, not a pastel), keeping the hue. Colours that are
 * already light enough come back unchanged.
 */
export function ensureLight(hex: string, minLightness: number, maxChroma: number): string {
  const normalized = normalizeHex(hex)
  const [lightness, chroma, hue] = toOklch(normalized)
  if (lightness >= minLightness && chroma <= maxChroma)
    return normalized

  const l = Math.max(lightness, minLightness)
  let c = Math.min(chroma, maxChroma)
  const inGamut = (candidate: number) =>
    oklchToLinearRgb([l, candidate, hue]).every(channel => channel >= -1e-4 && channel <= 1 + 1e-4)
  while (c > 0 && !inGamut(c))
    c = Math.max(0, c - 0.002)

  return fromOklch([l, c, hue])
}

/**
 * `hex` kept dark: oklch lightness lowered to at most `maxLightness`, keeping the hue (and the chroma, reduced only if
 * needed to stay displayable). Colours already that dark come back unchanged.
 */
export function ensureDark(hex: string, maxLightness: number): string {
  const normalized = normalizeHex(hex)
  const [lightness, chroma, hue] = toOklch(normalized)
  if (lightness <= maxLightness)
    return normalized

  let c = chroma
  const inGamut = (candidate: number) =>
    oklchToLinearRgb([maxLightness, candidate, hue]).every(channel => channel >= -1e-4 && channel <= 1 + 1e-4)
  while (c > 0 && !inGamut(c))
    c = Math.max(0, c - 0.002)

  return fromOklch([maxLightness, c, hue])
}
