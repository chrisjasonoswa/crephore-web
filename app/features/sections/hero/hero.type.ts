import type { SectionCta } from '../section.cta.type'

// Every field a hero layout can use (the heading, date and venue come from the event)
export const heroFields = ['eyebrow', 'cta', 'lifeDates'] as const
export type HeroField = (typeof heroFields)[number]

// Every hero layout uses the same fields; only the arrangement changes. The heading (the page's h1), date and place
// are the event's name, start date and venue (`SectionLayoutProps.occasion`), never stored here, so they follow the
// event when it changes.
export interface HeroContent {
  // Small label, e.g. "Together with their families"
  eyebrow?: string
  // The photo behind the section on the `photo` background (any layout, under an overlay); without it the section
  // uses the primary colour. Never shown inside a layout.
  backgroundPhoto?: string
  // The photos inside the layout, in order. Each layout shows as many as it has room for (its registry
  // `layoutPhotoCount`: split 1, polaroid 2, collage 3, filmstrip 5); a missing photo shows a soft placeholder so the
  // layout keeps its shape. While editing, extra photos are kept, so switching back to a layout with more room shows
  // them again; saving drops them (`withoutUnusedPhotos`).
  layoutPhotos: string[]
  // The RSVP button
  cta?: SectionCta
  // A memorial's dates of birth and passing under the name (`occasion.bornOn` / `diedOn`, never stored here), as full
  // dates or years only; left out without both dates. Unset: none. Offered in the editor only for memorials.
  lifeDates?: HeroLifeDates
}

export type HeroLifeDates = 'full' | 'years'
