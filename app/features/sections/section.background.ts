import type { SectionBackground } from './section.type'

export interface BackgroundStyles {
  // Background and default text colour
  root: string
  // Secondary text (subtitles, details)
  muted: string
  // Small labels: the eyebrow above a heading, a person's role, a chapter's label, the message's signature. The secondary
  // on light, a softer shade of the background's colour on the colour backgrounds, soft light on photos.
  eyebrow: string
  // Primary call to action: the accent, or without one the other brand colour
  button: string
  // Headings and names (a section's heading, a chapter's, a person's name and bio): the primary on light and secondary
  // backgrounds, the secondary on primary and photo ones. Long running text stays `root` / `muted`.
  brandText: string
  // A filled shape standing in for a missing photo (a person's initials): a soft tint of the section's colour with that
  // colour's text, the secondary's on secondary sections and the primary's otherwise (both contrast-checked pairs)
  avatar: string
  // The other brand colour as it reads on `avatar`'s tint, for a mark on it (the venue placeholder's pin badge): the
  // secondary on the primary tint, the primary on the secondary's
  avatarAccent: string
  // Small highlights, as a text colour (use `bg-current` / `currentColor` for shapes): icons, ornaments, timeline dots,
  // the countdown's rings, the scroll hint. The theme's accent (kept at 3:1 against the background), or without one
  // the other brand colour as it reads there. Never for text: labels and headings stay `eyebrow` / `brandText`.
  accent: string
}

/*
 * Classes per background, built only from site-theme variables (`--site-*`, see site-theme/useSiteTheme.ts).
 * Never use the Crephore app theme (`bg-primary`, `text-foreground`, …) in sections:
 * those are Crephore's own colours, not the host's.
 * Text uses the contrast-checked variables, so every background stays readable with any colours a host picks.
 * Buttons use the accent, or without one the other brand colour (primary on light/secondary backgrounds, secondary on
 * primary/photo backgrounds), adjusted per background in siteThemeVars so they always stand out.
 */
export const backgroundStyles: Record<SectionBackground, BackgroundStyles> = {
  'light': {
    root: 'bg-(--site-bg) text-(--site-text)',
    muted: 'text-(--site-muted)',
    // The secondary, darkened as needed: secondary colours are often pastel
    eyebrow: 'text-(--site-secondary-text)',
    button: 'bg-(--site-button-light) text-(--site-on-button-light)',
    brandText: 'text-(--site-primary-text)',
    avatar: 'bg-(--site-primary-50) text-(--site-primary-text)',
    avatarAccent: 'text-(--site-secondary-text)',
    accent: 'text-(--site-accent-light)',
  },
  'photo': {
    // The layout draws the photo and `--site-photo-overlay` on top; this dark backdrop shows while it loads.
    // Without a photo the section uses the primary background instead (see resolveBackground).
    root: 'bg-(--site-primary-900) text-(--site-on-dark)',
    muted: 'text-(--site-on-photo-muted)',
    eyebrow: 'text-(--site-on-photo-muted)',
    button: 'bg-(--site-button-photo) text-(--site-on-button-photo)',
    // Like primary: the secondary, and soft light labels
    brandText: 'text-(--site-secondary-on-photo)',
    avatar: 'bg-(--site-primary-50) text-(--site-primary-text)',
    avatarAccent: 'text-(--site-secondary-text)',
    accent: 'text-(--site-accent-photo)',
  },
  'primary': {
    root: 'bg-(--site-primary) text-(--site-on-primary)',
    muted: 'text-(--site-on-primary-muted)',
    eyebrow: 'text-(--site-on-primary-muted)',
    button: 'bg-(--site-button-primary) text-(--site-on-button-primary)',
    brandText: 'text-(--site-secondary-on-primary)',
    avatar: 'bg-(--site-primary-50) text-(--site-primary-text)',
    avatarAccent: 'text-(--site-secondary-text)',
    accent: 'text-(--site-accent-primary)',
  },
  'secondary': {
    root: 'bg-(--site-secondary) text-(--site-on-secondary)',
    muted: 'text-(--site-on-secondary-muted)',
    eyebrow: 'text-(--site-on-secondary-muted)',
    button: 'bg-(--site-button-secondary) text-(--site-on-button-secondary)',
    brandText: 'text-(--site-primary-on-secondary)',
    avatar: 'bg-(--site-secondary-100) text-(--site-secondary-text)',
    avatarAccent: 'text-(--site-primary-text)',
    accent: 'text-(--site-accent-secondary)',
  },
}

/**
 * Each background's own colour and its headings' colour as CSS values (`root`'s background and `brandText` above), for
 * what can't use the classes: the intros match the hero with them (`--hero-bg`, `--hero-heading`).
 */
export const backgroundColours: Record<SectionBackground, { background: string, heading: string }> = {
  light: { background: 'var(--site-bg)', heading: 'var(--site-primary-text)' },
  photo: { background: 'var(--site-primary-900)', heading: 'var(--site-secondary-on-photo)' },
  primary: { background: 'var(--site-primary)', heading: 'var(--site-secondary-on-primary)' },
  secondary: { background: 'var(--site-secondary)', heading: 'var(--site-primary-on-secondary)' },
}

/**
 * The background a section actually renders with. A photo background without a photo looks exactly like
 * the primary background (colour, text and button), so layouts should style with this, not `background`.
 */
export function resolveBackground(background: SectionBackground, imageUrl?: string): SectionBackground {
  return background === 'photo' && !imageUrl ? 'primary' : background
}
