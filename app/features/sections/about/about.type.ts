// One chapter of the about section's timeline, e.g. "2019 · How we met" / "Spilled coffee".
export interface AboutTimelineItem {
  // Small label, e.g. "2019 · How we met"
  eyebrow?: string
  heading: string
  body?: string
  // The chapter's own photo (most timeline layouts; Compact leaves it out); a missing photo shows a soft placeholder
  photo?: string
}

// Every field an about layout can use (`timeline.photo`: a chapter's own photo)
export const aboutFields = ['eyebrow', 'heading', 'body', 'timeline', 'timeline.photo'] as const
export type AboutField = (typeof aboutFields)[number]

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
