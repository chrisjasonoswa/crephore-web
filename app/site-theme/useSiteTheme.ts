import type { MaybeRefOrGetter } from 'vue'
import type { SiteMotion } from '~/features/site-motion/site-motion.type'
import { colorDistance, contrastRatio, DARK_TEXT, ensureContrast, ensureLight, fadeTowards, LIGHT_TEXT, lightenUntil, MIN_CONTRAST, mixOklch, mixSrgb, normalizeHex, readableTextOn, relativeLuminance, tonalShade } from './color'
import { fontStack, getFontPairing } from './fontPairings'

export type CornerStyle = 'sharp' | 'soft' | 'round'

// How big headings are set (the hero's, and the other sections'): each scales the heading's own sizes, so every layout
// keeps its proportions and phones stay smaller than desktops. Stored on saved websites (the API's
// WebsiteKeys.HeadingSizes), so never rename one.
export const headingSizes = ['small', 'medium', 'large', 'extra-large'] as const
export type HeadingSize = (typeof headingSizes)[number]
export const headingSizeLabels: Record<HeadingSize, string> = { 'small': 'Small', 'medium': 'Medium', 'large': 'Large', 'extra-large': 'XL' }
export const HEADING_SCALE: Record<HeadingSize, number> = { 'small': 0.85, 'medium': 1, 'large': 1.15, 'extra-large': 1.3 }

export interface SiteTheme {
  // hex, e.g. '#1E2A44'. The only colour a theme needs.
  primaryColor: string
  // hex, optional: the second brand colour (its own section background, labels, the other colour in buttons).
  // Unset: one made from the primary (see secondaryFor).
  secondaryColor?: string
  // hex, optional: a small highlight colour for buttons, icons, ornaments and dots (`accent` in section.background.ts).
  // Unset: those use the other brand colour, as before there was an accent.
  accentColor?: string
  // The page and `light` section background, hex (e.g. ivory '#FFFCF4'). Unset: plain white.
  // Always kept light (see lightBackground), since dark text and the light-background buttons assume it.
  backgroundColor?: string
  fontPairingKey: string
  cornerStyle: CornerStyle
  // The hero's heading (the names or title) and the other sections' headings; medium when unset
  heroHeadingSize?: HeadingSize
  headingSize?: HeadingSize
  // The intro animation (features/site-motion)
  motion: SiteMotion
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

// A chosen background stays at least this light (oklch) and at most this colourful, so it stays a light page.
const BG_MIN_LIGHTNESS = 0.92
const BG_MAX_CHROMA = 0.05
const TEXT_TINT = 20
const BORDER_TINT = 15

// Preferred strength of muted text per background (it only fades this far if AA still holds).
const MUTED = 0.7
const ON_PRIMARY_MUTED = 0.75
const ON_PHOTO_MUTED = 0.8

// WCAG minimum for non-text elements (a button against its background).
const MIN_BUTTON_CONTRAST = 3
// A button or highlight this different in colour from its background (colorDistance, hue as well as lightness) stands
// out without 3:1 too: teal on a pink of the same lightness (about 0.34), coral or gold on white (0.29–0.34), a strong
// yellow on white (0.21). Fainter ones are still adjusted: lemon or mint on white (0.13–0.15), a lighter shade of the
// background (0.04).
const MIN_BUTTON_DISTANCE = 0.2

const pct = (share: number) => `${share}%`
const DEFAULT_PRIMARY = '#1E2A44'

/** The light background a theme uses: the host's colour kept light, or plain white. */
export function lightBackground(theme: Pick<SiteTheme, 'backgroundColor'>): string {
  if (theme.backgroundColor)
    return ensureLight(normalizeHex(theme.backgroundColor, LIGHT_TEXT), BG_MIN_LIGHTNESS, BG_MAX_CHROMA)
  return LIGHT_TEXT
}

// Without a secondary colour: a soft tint of a dark primary, or a deep shade of a light one, so secondary sections
// still stand apart from primary ones (share of primary in the tint, oklch lightness of the shade)
const SECONDARY_TINT = 28
const SECONDARY_SHADE_LIGHTNESS = 0.35

/** The secondary colour a theme uses: the host's, or one made from the primary. */
export function secondaryFor(theme: Pick<SiteTheme, 'primaryColor' | 'secondaryColor'>): string {
  const primary = normalizeHex(theme.primaryColor, DEFAULT_PRIMARY)
  if (theme.secondaryColor)
    return normalizeHex(theme.secondaryColor, primary)
  return readableTextOn(primary) === LIGHT_TEXT
    ? mixOklch(primary, LIGHT_TEXT, SECONDARY_TINT / 100)
    : tonalShade(primary, SECONDARY_SHADE_LIGHTNESS, DARK_MIN_CHROMA)
}

// The darker of two light colours (the worst case for dark text)
const darker = (a: string, b: string) => (relativeLuminance(a) <= relativeLuminance(b) ? a : b)

/**
 * Strength of the photo overlay. Starts at 55% and goes up until white (and
 * muted white) text passes AA even over the brightest part of a photo.
 */
// Sections lay the overlay this much stronger than the least that keeps text readable, so the primary's tint shows
// over the photo (the Full hero with its text off-centre keeps the least, `--site-photo-overlay-edge`, under its fade)
const PHOTO_OVERLAY_BOOST = 10
function photoOverlayStrength(primary900: string): number {
  for (let strength = 55; strength < 95; strength += 5) {
    const worst = mixSrgb(primary900, LIGHT_TEXT, strength / 100)
    const muted = mixSrgb(LIGHT_TEXT, worst, ON_PHOTO_MUTED)
    if (contrastRatio(muted, worst) >= MIN_CONTRAST)
      return strength
  }
  return 95
}

/**
 * A button or highlight colour that stands out from `behind`: as picked when it's clearly a different colour
 * (MIN_BUTTON_DISTANCE) or reaches 3:1, otherwise made darker or lighter until it reaches 3:1.
 */
function standOut(color: string, behind: string[]): string {
  if (behind.every(bg => colorDistance(color, bg) >= MIN_BUTTON_DISTANCE))
    return color
  return ensureContrast(color, behind, MIN_BUTTON_CONTRAST)
}

/** The theme as CSS variables, applied to the `.crephore-site` wrapper (never `:root`). */
export function siteThemeVars(theme: SiteTheme): Record<string, string> {
  const primary = normalizeHex(theme.primaryColor, DEFAULT_PRIMARY)
  const secondary = secondaryFor(theme)
  const accent = theme.accentColor ? normalizeHex(theme.accentColor, secondary) : null
  const fonts = getFontPairing(theme.fontPairingKey)

  // Hex values for contrast checks (the light tints mirror the color-mix() values below;
  // the dark 900 shades are computed here and used as-is).
  const text = mixOklch(primary, DARK_TEXT, TEXT_TINT / 100)
  const bg = lightBackground(theme)
  const tint50 = mixOklch(primary, LIGHT_TEXT, TINTS[50] / 100)
  // Light backgrounds text is checked against: the page background and the soft primary tint
  const lightBgs = [bg, tint50]
  // A soft secondary surface (e.g. initials on a white card in a secondary section), mirrored by `--site-secondary-100`
  const secondaryTint = mixOklch(secondary, LIGHT_TEXT, TINTS[100] / 100)
  const soft = darker(bg, tint50) // darkest light background
  const primary900 = tonalShade(primary, DARK_LIGHTNESS, DARK_MIN_CHROMA)
  const onPrimary = readableTextOn(primary)
  const onSecondary = readableTextOn(secondary)
  const overlayStrength = photoOverlayStrength(primary900)
  // Brightest a photo can get under the overlay (a white pixel), i.e. the worst case for light text.
  const photoWorst = mixSrgb(primary900, LIGHT_TEXT, overlayStrength / 100)
  // Headings and names on a photo are light, like all text there: the secondary as picked when it reads on the
  // overlay (3:1 against its dark) and stands apart from the brightest spot of the photo under it (3:1, or clearly a
  // different colour, as buttons: a vivid pink on a grey-olive), else lightened until it does. Never darkened: dark
  // text vanishes in the photo's dark parts.
  const secondaryOnPhoto = lightenUntil(secondary, color => contrastRatio(color, primary900) >= MIN_CONTRAST
    && (contrastRatio(color, photoWorst) >= MIN_CONTRAST || colorDistance(color, photoWorst) >= MIN_BUTTON_DISTANCE))

  const vars: Record<string, string> = {
    '--site-primary': primary,
    '--site-secondary': secondary,
    // The accent itself, or the secondary without one (e.g. the pinned note's highlighter)
    '--site-accent': accent ?? secondary,
    // The accent, or the primary without one: a third colour that never matches the secondary (an intro's balloon on
    // a secondary background)
    '--site-accent-else-primary': accent ?? primary,
    '--site-primary-500': 'var(--site-primary)',
    '--site-on-primary': onPrimary,
    '--site-on-primary-muted': fadeTowards(onPrimary, primary, ON_PRIMARY_MUTED),
    '--site-on-secondary': onSecondary,
    '--site-on-secondary-muted': fadeTowards(onSecondary, secondary, ON_PRIMARY_MUTED),
    // Photo background: dark main colour behind the photo (and when there is none), light text on it
    '--site-primary-900': primary900,
    '--site-on-dark': LIGHT_TEXT,
    // Brand colours used as text: kept as chosen when readable, otherwise nudged until they pass AA.
    // Any colour a host picks then still works (e.g. a pale main colour, a navy secondary).
    '--site-primary-text': ensureContrast(primary, lightBgs),
    '--site-secondary-on-photo': secondaryOnPhoto,
    // The solid colour a photo fades into at the text's edge (the Full hero, text off-centre): the primary itself when
    // the light text and headings there read on it, else the overlay's dark shade (a pale primary would wash them out)
    '--site-photo-edge': contrastRatio(LIGHT_TEXT, primary) >= MIN_CONTRAST && contrastRatio(secondaryOnPhoto, primary) >= MIN_CONTRAST
      ? primary
      : primary900,
    // The other brand colour as text on each background (labels and headings; see
    // section.background.ts `eyebrow` / `brandText`)
    '--site-secondary-text': ensureContrast(secondary, [...lightBgs, secondaryTint]),
    // The accent (the secondary without one) as small text on a light surface, e.g. an intro's label on paper
    '--site-accent-text': ensureContrast(accent ?? secondary, lightBgs),
    '--site-secondary-100': `color-mix(in oklch, var(--site-secondary) ${pct(TINTS[100])}, white)`,
    '--site-secondary-on-primary': ensureContrast(secondary, [primary]),
    '--site-primary-on-secondary': ensureContrast(primary, [secondary]),
    '--site-on-photo-muted': `color-mix(in srgb, ${LIGHT_TEXT} ${pct(ON_PHOTO_MUTED * 100)}, transparent)`,
    '--site-photo-overlay': `color-mix(in srgb, var(--site-primary-900) ${pct(Math.min(overlayStrength + PHOTO_OVERLAY_BOOST, 95))}, transparent)`,
    '--site-photo-overlay-edge': `color-mix(in srgb, var(--site-primary-900) ${pct(overlayStrength)}, transparent)`,
    '--site-bg': bg,
    '--site-text': `color-mix(in oklch, var(--site-primary) ${pct(TEXT_TINT)}, ${DARK_TEXT})`,
    '--site-muted': fadeTowards(text, soft, MUTED),
    '--site-border': `color-mix(in oklch, var(--site-primary) ${pct(BORDER_TINT)}, var(--site-bg))`,
    '--site-font-heading': fontStack(fonts.heading),
    // The weight headings are set in (the pairing's, e.g. Trench Slab Medium); a base rule applies it to heading-font text
    '--site-font-heading-weight': String(fonts.heading.weight ?? 400),
    '--site-font-body': fontStack(fonts.body),
    // Use for italic heading text (`[font-style:var(--site-font-heading-italic)]`), never `italic`: scripts stay upright
    '--site-font-heading-italic': fonts.heading.script ? 'normal' : 'italic',
    // Use for heading text in capitals (`[text-transform:var(--site-font-heading-case)]`), never `uppercase`: a script
    // in capitals can't be read, so it keeps its own case
    '--site-font-heading-case': fonts.heading.script ? 'none' : 'uppercase',
    '--site-radius': RADIUS[theme.cornerStyle] ?? RADIUS.soft,
    // Heading sizes, as scales of each heading's own sizes (applied by a base rule in tailwind.css)
    '--site-hero-heading-scale': String(HEADING_SCALE[theme.heroHeadingSize ?? 'medium'] ?? 1),
    '--site-heading-scale': String(HEADING_SCALE[theme.headingSize ?? 'medium'] ?? 1),
  }
  for (const [step, share] of Object.entries(TINTS))
    vars[`--site-primary-${step}`] = `color-mix(in oklch, var(--site-primary) ${pct(share)}, white)`
  for (const [step, share] of Object.entries(SHADES))
    vars[`--site-primary-${step}`] = `color-mix(in oklch, var(--site-primary) ${pct(share)}, black)`

  // Per section background (`name`: light, primary, …; `behind`: its colours as hex, `other`: the other brand colour
  // there). Buttons are the accent on every background, or without one the other brand colour: primary on light and
  // secondary backgrounds, secondary on primary and photo ones. Neither colour is assumed to be the dark one: it's kept
  // as picked when it stands out from the background (`standOut`), else its lightness is adjusted, keeping its hue. The
  // button's text is always checked against the button.
  // `--site-accent-<name>`: the accent for small things (icons, ornaments, dots), kept or adjusted the same way, or
  // without one the other brand colour as it already reads there (`otherAsText`, a checked variable).
  const background = (name: string, behind: string[], other: string, otherAsText: string) => {
    const fill = standOut(accent ?? other, behind)
    vars[`--site-button-${name}`] = fill
    vars[`--site-on-button-${name}`] = readableTextOn(fill)
    vars[`--site-accent-${name}`] = accent ? standOut(accent, behind) : `var(${otherAsText})`
  }
  background('light', lightBgs, primary, '--site-secondary-text')
  background('primary', [primary], secondary, '--site-secondary-on-primary')
  background('secondary', [secondary], primary, '--site-primary-on-secondary')
  background('photo', [photoWorst, primary900], secondary, '--site-secondary-on-photo')

  return vars
}

export function useSiteTheme(theme: MaybeRefOrGetter<SiteTheme>) {
  return computed(() => siteThemeVars(toValue(theme)))
}

// Below these, two colours are too alike to tell apart at a glance.
const MIN_COLOR_DISTANCE = 0.12
const MIN_BACKGROUND_CONTRAST = 1.5
// Pale secondary colours (cream, blush) are meant to be soft against the page, so only near-identical ones warn
const MIN_SECONDARY_BACKGROUND_DISTANCE = 0.05

/**
 * Design hints for a theme. Text and buttons always stay readable (see siteThemeVars); these catch
 * colour choices that work but look flat: sections that blend into the page, or a one-colour theme.
 */
export function siteThemeWarnings(theme: SiteTheme): string[] {
  const primary = normalizeHex(theme.primaryColor, DEFAULT_PRIMARY)
  const secondary = secondaryFor(theme)
  const bg = lightBackground(theme)
  const warnings: string[] = []

  // Only colours the host picked: a secondary made from the primary is apart from it by design
  if (theme.secondaryColor && colorDistance(primary, secondary) < MIN_COLOR_DISTANCE)
    warnings.push('The secondary colour is very close to the primary, so the site will look like a single colour and buttons will be a shade of the section colour.')
  if (contrastRatio(primary, bg) < MIN_BACKGROUND_CONTRAST)
    warnings.push('The primary colour is very light, so primary sections will barely stand out from the page.')
  if (theme.secondaryColor && colorDistance(secondary, bg) < MIN_SECONDARY_BACKGROUND_DISTANCE)
    warnings.push('The secondary colour is very close to the background, so secondary sections will barely stand out from the page.')
  if (theme.accentColor && colorDistance(normalizeHex(theme.accentColor, primary), primary) < MIN_COLOR_DISTANCE)
    warnings.push('The accent is very close to the primary colour, so buttons on primary sections will be a shade of the section colour.')

  return warnings
}
