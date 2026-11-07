import type { SectionCta } from '../section.cta.type'

// Every field a countdown layout can use (the heading and target come from the event)
export const countdownFields = ['eyebrow', 'showSeconds', 'cta'] as const
export type CountdownField = (typeof countdownFields)[number]

// Every countdown layout uses the same fields. The heading and the target are the occasion's name and start
// (`SectionLayoutProps.occasion`), never stored here, so they follow the event when it changes. No venue: that lives in
// the hero.
export interface CountdownContent {
  // Small label, e.g. "Counting down to"
  eyebrow?: string
  // Days, hours and minutes, plus seconds when on (the days-only layout ignores it)
  showSeconds: boolean
  // The photo behind the section on the `photo` background (any layout, under an overlay); without it the section
  // uses the primary colour. Never shown inside a layout.
  backgroundPhoto?: string
  // The photos inside the layout, in order, like the hero's (split shows the first); a missing photo shows a soft
  // placeholder
  layoutPhotos: string[]
  cta?: SectionCta
}
