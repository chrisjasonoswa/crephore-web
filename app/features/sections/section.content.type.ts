export interface SectionCta {
  label: string
  href: string
}

// Every hero layout uses the same fields; only the arrangement changes.
export interface HeroContent {
  // Small label, e.g. "Together with their families"
  eyebrow?: string
  title: string
  // Display text, already formatted for the event (e.g. "Saturday, 14 February 2027")
  date?: string
  venue?: string
  // The photo behind the section on the `photo` background (any layout, under an overlay); without it the section
  // uses the primary colour. Never shown inside a layout.
  backgroundPhoto?: string
  // The photos inside the layout, in order. Each layout shows as many as it has room for (its registry
  // `layoutPhotoCount`: split 1, polaroid 2, collage 3, filmstrip 5); a missing photo shows a soft placeholder so the
  // layout keeps its shape. Extra photos are kept, so switching back to a layout with more room shows them again.
  layoutPhotos: string[]
  // The RSVP button
  cta?: SectionCta
}

// Every countdown layout uses the same fields. The target is the occasion's start (`SectionLayoutProps.occasion`),
// never stored here, so it follows the event when its date changes. No venue: that lives in the hero.
export interface CountdownContent {
  // Small label, e.g. "Counting down to"
  eyebrow?: string
  title?: string
  // Days, hours and minutes, plus seconds when on (the days-only layout ignores it)
  showSeconds: boolean
  // The photo behind the section on the `photo` background (any layout, under an overlay); without it the section
  // uses the primary colour. Never shown inside a layout.
  backgroundPhoto?: string
  // The photo inside the layout (split); a missing photo shows a soft placeholder
  layoutPhoto?: string
  cta?: SectionCta
}
