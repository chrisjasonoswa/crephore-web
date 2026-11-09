import type { SectionCta } from '../section.cta.type'

// Every field a countdown layout can use (the target comes from the event); only the invitation shows `body`
export const countdownFields = ['eyebrow', 'heading', 'body', 'showSeconds', 'cta'] as const
export type CountdownField = (typeof countdownFields)[number]

// The countdown's content. The target is the occasion's start (`SectionLayoutProps.occasion`), never stored here, so it
// follows the event when it changes; the heading is the host's, or the occasion's name without one (`countdownHeading`).
// No venue: that lives in the hero.
export interface CountdownContent {
  // Small label, e.g. "Counting down to"
  eyebrow?: string
  // e.g. "Join us as we begin our life together"; without one (or blank) the event's name, so sections saved before it
  // existed still read as they did
  heading?: string
  // A few words under the heading, e.g. "We are getting married in the hills above Florence…" (the invitation layout)
  body?: string
  // Days, hours and minutes, plus seconds when on (the days-only layout ignores it)
  showSeconds: boolean
  // The photo behind the section on the `photo` background (any layout, under an overlay); without it the section
  // uses the primary colour. Never shown inside a layout.
  backgroundPhoto?: string
  // The photos inside the layout, in order, like the hero's (split shows the first, the invitation two); a missing
  // photo shows a soft placeholder
  layoutPhotos: string[]
  cta?: SectionCta
}
