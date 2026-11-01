import type { SectionCta } from '../section.cta.type'

// Every countdown layout uses the same fields. The target is the occasion's start (`SectionLayoutProps.occasion`),
// never stored here, so it follows the event when its date changes. No venue: that lives in the hero.
export interface CountdownContent {
  // Small label, e.g. "Counting down to"
  eyebrow?: string
  heading?: string
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
