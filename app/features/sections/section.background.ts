import type { SectionBackground } from './section.type'

export interface BackgroundStyles {
  // Background and default text colour
  root: string
  // Secondary text (subtitles, details)
  muted: string
  // Small label above the heading
  eyebrow: string
  // Primary call to action
  button: string
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
    // Accents are often pastel, so labels on light backgrounds use the primary colour (checked for contrast).
    eyebrow: 'text-(--site-primary-text)',
    button: 'bg-(--site-button-light) text-(--site-on-button-light)',
  },
  'photo': {
    // The layout draws the photo and `--site-photo-overlay` on top; this dark backdrop shows while it loads.
    // Without a photo the section uses the primary background instead (see resolveBackground).
    root: 'bg-(--site-primary-900) text-(--site-on-dark)',
    muted: 'text-(--site-on-photo-muted)',
    eyebrow: 'text-(--site-accent-on-photo)',
    button: 'bg-(--site-button-photo) text-(--site-on-button-photo)',
  },
  'primary': {
    root: 'bg-(--site-primary) text-(--site-on-primary)',
    muted: 'text-(--site-on-primary-muted)',
    eyebrow: 'text-(--site-on-primary-muted)',
    button: 'bg-(--site-button-primary) text-(--site-on-button-primary)',
  },
  'accent': {
    root: 'bg-(--site-accent) text-(--site-on-accent)',
    muted: 'text-(--site-on-accent-muted)',
    eyebrow: 'text-(--site-on-accent-muted)',
    button: 'bg-(--site-button-accent) text-(--site-on-button-accent)',
  },
}

/**
 * The background a section actually renders with. A photo background without a photo looks exactly like
 * the primary background (colour, text and button), so layouts should style with this, not `background`.
 */
export function resolveBackground(background: SectionBackground, imageUrl?: string): SectionBackground {
  return background === 'photo' && !imageUrl ? 'primary' : background
}
