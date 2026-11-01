import type { SectionCta } from '../section.cta.type'

// Every hero layout uses the same fields; only the arrangement changes.
export interface HeroContent {
  // Small label, e.g. "Together with their families"
  eyebrow?: string
  // The names, e.g. "Bea & Carlo" (the page's h1)
  heading: string
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
