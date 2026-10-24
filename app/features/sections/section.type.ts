// Building blocks of the event websites hosts build (Hero, RSVP, FAQ, …).
// A section type has one or more layouts (visual variations); each layout is one component
// in `components/sections/<type>/` and is registered in `section.registry.ts`.

import { type HeroContent } from "./section.content.type"

/**
 * The background a section sits on. Each background maps to site-theme variables
 * (see `section.background.ts`), so every layout works with every event's colours.
 * These keys are stored on saved sections: never rename one.
 */
export type SectionBackground = 'light' | 'photo' | 'primary' | 'accent'

// Order used in pickers (two per row: Light / Photo, Primary / Accent)
export const sectionBackgrounds: SectionBackground[] = ['light', 'photo', 'primary', 'accent']

/** Display names for the backgrounds (shown in the playground and editor). */
export const sectionBackgroundLabels: Record<SectionBackground, string> = {
  light: 'Light',
  photo: 'Photo',
  primary: 'Primary',
  accent: 'Accent',
}

/** Content shape per section type. Add new section types here. */
export interface SectionContentMap {
  hero: HeroContent
}

export type SectionType = keyof SectionContentMap

/** A section placed on a page. */
export interface Section<T extends SectionType = SectionType> {
  type: T
  layout: string

  // background and content
  background: SectionBackground
  content: SectionContentMap[T]
}

/** Props every layout component of a section type receives. */
export interface SectionLayoutProps<T extends SectionType> {
  content: SectionContentMap[T]
  background: SectionBackground
}
