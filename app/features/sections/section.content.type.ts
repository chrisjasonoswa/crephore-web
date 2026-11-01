// Text in every section type uses the same names: `eyebrow` (the small label above), `heading` (the section's main
// line, its h1/h2) and `body` (running text, when the type has any). `title` is kept for page titles.

export interface SectionCta {
  label: string
  href: string
}

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

// Every message layout uses the same fields: a short note from the hosts (a welcome, a thank you, …), read top to
// bottom as eyebrow, heading, body and signature, plus a photo.
export interface MessageContent {
  // Small label, e.g. "A note from us"
  eyebrow?: string
  heading?: string
  // The note itself; line breaks are kept
  body: string
  // Closes the note, e.g. "With love, Bea & Carlo"
  signature?: string
  // The photo behind the section on the `photo` background (any layout, under an overlay); without it the section
  // uses the primary colour. Never shown inside a layout.
  backgroundPhoto?: string
  // The photos inside the layout, in order, like the hero's (every layout shows the first); a missing photo shows a
  // soft placeholder (the centred letter leaves it out)
  layoutPhotos: string[]
}

// One chapter of the about section's timeline, e.g. "2019 · How we met" / "Spilled coffee".
export interface AboutTimelineItem {
  // Small label, e.g. "2019 · How we met"
  eyebrow?: string
  heading: string
  body?: string
  // The chapter's own photo (most timeline layouts; Compact leaves it out); a missing photo shows a soft placeholder
  photo?: string
}

// Every about layout uses the same fields. Story layouts show the eyebrow, heading, body and photos; timeline layouts
// show the eyebrow, heading, body (as a short intro, when there is one) and the timeline. Both are kept when switching.
export interface AboutContent {
  // Small label, e.g. "Our story"
  eyebrow?: string
  heading?: string
  // The story; line breaks are kept (a blank line starts a new paragraph)
  body?: string
  // Chapters in order (timeline layouts)
  timeline: AboutTimelineItem[]
  // The photo behind the section on the `photo` background (any layout, under an overlay); without it the section
  // uses the primary colour. Never shown inside a layout.
  backgroundPhoto?: string
  // The photos inside the story layouts, in order (up to 3); a missing photo shows a soft placeholder
  layoutPhotos: string[]
}
