export interface SectionCta {
  label: string
  href: string
}

export interface  HeroContent {
  eyebrow?: string
  title: string
  subtitle?: string
  // Display text, already formatted for the event (e.g. "Saturday, 12 June 2027")
  date?: string
  location?: string
  cta?: SectionCta
  // Fills the section on the `photo` background; without it the section uses the primary background.
  backgroundImageUrl?: string
  // Optional photo inside the layout, on any background, in the space the text doesn't use
  // (e.g. beside the text for `text-left`, below it for `text-top`).
  layoutImageUrl?: string
}

