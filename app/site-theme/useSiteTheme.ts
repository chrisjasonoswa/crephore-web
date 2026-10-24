import type { MaybeRefOrGetter } from 'vue'
import { colorDistance, contrastRatio, DARK_TEXT, ensureContrast, fadeTowards, LIGHT_TEXT, MIN_CONTRAST, mixOklch, mixSrgb, normalizeHex, readableTextOn, tonalShade } from './color'
import { fontStack, getFontPairing } from './fontPairings'

export type CornerStyle = 'sharp' | 'soft' | 'round'

export interface SiteTheme {
  primaryColor: string // hex, e.g. '#1E2A44'
  accentColor: string // hex, e.g. '#E8A598'
  fontPairingKey: string
  cornerStyle: CornerStyle
}

// Share of primary in each tint (mixed with white) and shade (mixed with black).
const TINTS = { 50: 7, 100: 14, 200: 28, 300: 45, 400: 70 } as const
const SHADES = { 600: 85, 700: 70, 800: 55 } as const

// The 900 shade (behind photos) is tonal: same hue at a fixed lightness with a minimum of colour,
// so every theme's photo overlay is equally dark and pale colours don't turn grey-brown
// (see tonalShade in color.ts).
const DARK_LIGHTNESS = 0.27
const DARK_MIN_CHROMA = 0.06

const RADIUS: Record<CornerStyle, string> = { sharp: '0px', soft: '10px', round: '22px' }

// Neutrals, lightly tinted towards primary (share of primary).
const BG_TINT = 3
const TEXT_TINT = 20
const BORDER_TINT = 15

// Preferred strength of muted text per background (it only fades this far if AA still holds).
const MUTED = 0.7
const ON_PRIMARY_MUTED = 0.75
const ON_PHOTO_MUTED = 0.8

// WCAG minimum for non-text elements (a button against its background).
const MIN_BUTTON_CONTRAST = 3

const pct = (share: number) => `${share}%`

/**
 * Strength of the photo overlay. Starts at 55% and goes up until white (and
 * muted white) text passes AA even over the brightest part of a photo.
 */
function photoOverlayStrength(primary900: string): number {
  for (let strength = 55; strength < 95; strength += 5) {
    const worst = mixSrgb(primary900, LIGHT_TEXT, strength / 100)
    const muted = mixSrgb(LIGHT_TEXT, worst, ON_PHOTO_MUTED)
    if (contrastRatio(muted, worst) >= MIN_CONTRAST)
      return strength
  }
  return 95
}

/** The theme as CSS variables, applied to the `.crephore-site` wrapper (never `:root`). */
export function siteThemeVars(theme: SiteTheme): Record<string, string> {
  const primary = normalizeHex(theme.primaryColor, '#1E2A44')
  const accent = normalizeHex(theme.accentColor, '#E8A598')
  const fonts = getFontPairing(theme.fontPairingKey)

  // Hex values for contrast checks (the light tints mirror the color-mix() values below;
  // the dark 900 shades are computed here and used as-is).
  const text = mixOklch(primary, DARK_TEXT, TEXT_TINT / 100)
  const soft = mixOklch(primary, LIGHT_TEXT, TINTS[50] / 100) // darkest light background
  const primary900 = tonalShade(primary, DARK_LIGHTNESS, DARK_MIN_CHROMA)
  const onPrimary = readableTextOn(primary)
  const onAccent = readableTextOn(accent)
  const overlayStrength = photoOverlayStrength(primary900)
  // Brightest a photo can get under the overlay (a white pixel), i.e. the worst case for light text.
  const photoWorst = mixSrgb(primary900, LIGHT_TEXT, overlayStrength / 100)

  const vars: Record<string, string> = {
    '--site-primary': primary,
    '--site-accent': accent,
    '--site-primary-500': 'var(--site-primary)',
    '--site-on-primary': onPrimary,
    '--site-on-primary-muted': fadeTowards(onPrimary, primary, ON_PRIMARY_MUTED),
    '--site-on-accent': onAccent,
    '--site-on-accent-muted': fadeTowards(onAccent, accent, ON_PRIMARY_MUTED),
    // Photo background: dark main colour behind the photo (and when there is none), light text on it
    '--site-primary-900': primary900,
    '--site-on-dark': LIGHT_TEXT,
    // Brand colours used as text: kept as chosen when readable, otherwise nudged until they pass AA.
    // Any colour a host picks then still works (e.g. a pale main colour, a navy accent).
    '--site-primary-text': ensureContrast(primary, [soft]),
    '--site-accent-on-photo': ensureContrast(accent, [photoWorst, primary900]),
    '--site-on-photo-muted': `color-mix(in srgb, ${LIGHT_TEXT} ${pct(ON_PHOTO_MUTED * 100)}, transparent)`,
    '--site-photo-overlay': `color-mix(in srgb, var(--site-primary-900) ${pct(overlayStrength)}, transparent)`,
    '--site-bg': `color-mix(in oklch, var(--site-primary) ${pct(BG_TINT)}, white)`,
    '--site-text': `color-mix(in oklch, var(--site-primary) ${pct(TEXT_TINT)}, ${DARK_TEXT})`,
    '--site-muted': fadeTowards(text, soft, MUTED),
    '--site-border': `color-mix(in oklch, var(--site-primary) ${pct(BORDER_TINT)}, white)`,
    '--site-font-heading': fontStack(fonts.heading),
    '--site-font-body': fontStack(fonts.body),
    '--site-radius': RADIUS[theme.cornerStyle] ?? RADIUS.soft,
  }
  for (const [step, share] of Object.entries(TINTS))
    vars[`--site-primary-${step}`] = `color-mix(in oklch, var(--site-primary) ${pct(share)}, white)`
  for (const [step, share] of Object.entries(SHADES))
    vars[`--site-primary-${step}`] = `color-mix(in oklch, var(--site-primary) ${pct(share)}, black)`

  // Buttons use the other brand colour on every background: primary on light and accent backgrounds,
  // accent on primary and photo backgrounds. Neither colour is assumed to be the dark one: if the other
  // colour doesn't stand out from the background (3:1), its lightness is adjusted, keeping its hue.
  // `name` is the section background (light, primary, …); `behind` are its colours as hex.
  const button = (name: string, color: string, behind: string[]) => {
    const fill = ensureContrast(color, behind, MIN_BUTTON_CONTRAST)
    vars[`--site-button-${name}`] = fill
    vars[`--site-on-button-${name}`] = readableTextOn(fill)
  }
  button('light', primary, [soft])
  button('primary', accent, [primary])
  button('accent', primary, [accent])
  button('photo', accent, [photoWorst, primary900])

  return vars
}

export function useSiteTheme(theme: MaybeRefOrGetter<SiteTheme>) {
  return computed(() => siteThemeVars(toValue(theme)))
}

// Below these, two colours are too alike to tell apart at a glance.
const MIN_COLOR_DISTANCE = 0.12
const MIN_BACKGROUND_CONTRAST = 1.5

/**
 * Design hints for a theme. Text and buttons always stay readable (see siteThemeVars); these catch
 * colour choices that work but look flat: sections that blend into the page, or a one-colour theme.
 */
export function siteThemeWarnings(theme: SiteTheme): string[] {
  const primary = normalizeHex(theme.primaryColor, '#1E2A44')
  const accent = normalizeHex(theme.accentColor, '#E8A598')
  const warnings: string[] = []

  if (colorDistance(primary, accent) < MIN_COLOR_DISTANCE)
    warnings.push('The accent is very close to the main colour, so the site will look like a single colour and buttons will be a shade of the section colour.')
  if (contrastRatio(primary, LIGHT_TEXT) < MIN_BACKGROUND_CONTRAST)
    warnings.push('The main colour is very light, so main-colour sections will barely stand out from the page.')

  return warnings
}
