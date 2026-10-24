import type { MaybeRefOrGetter } from 'vue'
import { contrastRatio, DARK_TEXT, fadeTowards, LIGHT_TEXT, MIN_CONTRAST, mixOklch, mixSrgb, normalizeHex, readableTextOn } from './color'
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
const SHADES = { 600: 85, 700: 70, 800: 55, 900: 40 } as const

const RADIUS: Record<CornerStyle, string> = { sharp: '0px', soft: '10px', round: '22px' }

// Neutrals, lightly tinted towards primary (share of primary).
const BG_TINT = 3
const TEXT_TINT = 20
const BORDER_TINT = 15

// Preferred strength of muted text per surface (it only fades this far if AA still holds).
const MUTED = 0.7
const ON_PRIMARY_MUTED = 0.75
const ON_DARK_MUTED = 0.7
const ON_PHOTO_MUTED = 0.8

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

  // Hex equivalents of the color-mix() values below, for contrast checks.
  const text = mixOklch(primary, DARK_TEXT, TEXT_TINT / 100)
  const soft = mixOklch(primary, LIGHT_TEXT, TINTS[50] / 100) // darkest light background
  const primary900 = mixOklch(primary, '#000000', SHADES[900] / 100)
  const onPrimary = readableTextOn(primary)

  const vars: Record<string, string> = {
    '--site-primary': primary,
    '--site-accent': accent,
    '--site-primary-500': 'var(--site-primary)',
    '--site-on-primary': onPrimary,
    '--site-on-primary-muted': fadeTowards(onPrimary, primary, ON_PRIMARY_MUTED),
    '--site-on-accent': readableTextOn(accent),
    '--site-on-dark': LIGHT_TEXT,
    '--site-on-dark-muted': fadeTowards(LIGHT_TEXT, primary900, ON_DARK_MUTED),
    '--site-on-photo-muted': `color-mix(in srgb, ${LIGHT_TEXT} ${pct(ON_PHOTO_MUTED * 100)}, transparent)`,
    '--site-photo-overlay': `color-mix(in srgb, var(--site-primary-900) ${pct(photoOverlayStrength(primary900))}, transparent)`,
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
  return vars
}

export function useSiteTheme(theme: MaybeRefOrGetter<SiteTheme>) {
  return computed(() => siteThemeVars(toValue(theme)))
}
