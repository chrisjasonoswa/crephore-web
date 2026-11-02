import type { SectionBackground } from './section.type'

export interface BackgroundStyles {
  // Background and default text colour
  root: string
  // Secondary text (subtitles, details)
  muted: string
  // Small labels: the eyebrow above a heading, a person's role, a chapter's label, the message's signature. The accent
  // on light, a softer shade of the background's colour on the colour backgrounds, soft light on photos.
  eyebrow: string
  // Primary call to action
  button: string
  // Headings and names (a section's heading, a chapter's, a person's name and bio): the primary on light and accent
  // backgrounds, the accent on primary and photo ones. Long running text stays `root` / `muted`.
  brandText: string
  // A filled shape standing in for a missing photo (a person's initials): a soft tint of the section's colour with that
  // colour's text, the accent's on accent sections and the primary's otherwise (both contrast-checked pairs)
  avatar: string
}

/*
 * Classes per background, built only from site-theme variables (`--site-*`, see site-theme/useSiteTheme.ts).
 * Never use the Crephore app theme (`bg-primary`, `text-foreground`, …) in sections:
 * those are Crephore's own colours, not the host's.
 * Text uses the contrast-checked variables, so every background stays readable with any colours a host picks.
 * Buttons always use the other brand colour (primary on light/accent backgrounds, accent on primary/photo
 * backgrounds), adjusted per background in siteThemeVars so they always stand out.
 */
export const backgroundStyles: Record<SectionBackground, BackgroundStyles> = {
  'light': {
    root: 'bg-(--site-bg) text-(--site-text)',
    muted: 'text-(--site-muted)',
    // The accent, darkened as needed: accents are often pastel
    eyebrow: 'text-(--site-accent-text)',
    button: 'bg-(--site-button-light) text-(--site-on-button-light)',
    brandText: 'text-(--site-primary-text)',
    avatar: 'bg-(--site-primary-50) text-(--site-primary-text)',
  },
  'photo': {
    // The layout draws the photo and `--site-photo-overlay` on top; this dark backdrop shows while it loads.
    // Without a photo the section uses the primary background instead (see resolveBackground).
    root: 'bg-(--site-primary-900) text-(--site-on-dark)',
    muted: 'text-(--site-on-photo-muted)',
    eyebrow: 'text-(--site-on-photo-muted)',
    button: 'bg-(--site-button-photo) text-(--site-on-button-photo)',
    // Like primary: the accent, and soft light labels
    brandText: 'text-(--site-accent-on-photo)',
    avatar: 'bg-(--site-primary-50) text-(--site-primary-text)',
  },
  'primary': {
    root: 'bg-(--site-primary) text-(--site-on-primary)',
    muted: 'text-(--site-on-primary-muted)',
    eyebrow: 'text-(--site-on-primary-muted)',
    button: 'bg-(--site-button-primary) text-(--site-on-button-primary)',
    brandText: 'text-(--site-accent-on-primary)',
    avatar: 'bg-(--site-primary-50) text-(--site-primary-text)',
  },
  'accent': {
    root: 'bg-(--site-accent) text-(--site-on-accent)',
    muted: 'text-(--site-on-accent-muted)',
    eyebrow: 'text-(--site-on-accent-muted)',
    button: 'bg-(--site-button-accent) text-(--site-on-button-accent)',
    brandText: 'text-(--site-primary-on-accent)',
    avatar: 'bg-(--site-accent-100) text-(--site-accent-text)',
  },
}

/**
 * The background a section actually renders with. A photo background without a photo looks exactly like
 * the primary background (colour, text and button), so layouts should style with this, not `background`.
 */
export function resolveBackground(background: SectionBackground, imageUrl?: string): SectionBackground {
  return background === 'photo' && !imageUrl ? 'primary' : background
}
