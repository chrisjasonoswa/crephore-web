// Building blocks of the event websites hosts build (Hero, RSVP, FAQ, …).
// A section type has one or more layouts (visual variations); each layout is one component
// in `components/sections/<type>/` and is registered in `section.registry.ts`.

import type { CountdownContent, HeroContent } from './section.content.type'

/**
 * The background a section sits on. Each background maps to site-theme variables
 * (see `section.background.ts`), so layouts work with every event's colours.
 * Each layout lists the backgrounds it supports (registry `backgrounds`).
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
  countdown: CountdownContent
}

export type SectionType = keyof SectionContentMap

/** A section placed on a page. */
export interface Section<T extends SectionType = SectionType> {
  type: T
  layout: string
  // The layout's placement options (see the layout's `options` in the registry); missing ones use defaults
  options?: Record<string, string>

  // background and content
  background: SectionBackground
  content: SectionContentMap[T]
}

/**
 * The event the page belongs to, for sections that show its details (e.g. the countdown's target).
 * Comes from the event, never from the section content, so it follows the event when it changes.
 */
export interface SectionOccasion {
  // UTC instant (ISO), e.g. the event's startsAt
  startsAt: string
  // IANA timezone its date is shown in, e.g. "Asia/Manila"
  timezone: string
}

/** Previews without an event (playground, thumbnails): an occasion 112 days, 6 hours and 45 minutes away. */
export function sampleOccasion(now = Date.now()): SectionOccasion {
  const away = ((112 * 24 + 6) * 60 + 45) * 60_000 + 20_000
  return { startsAt: new Date(now + away).toISOString(), timezone: 'Asia/Manila' }
}

/** Props every layout component of a section type receives. */
export interface SectionLayoutProps<T extends SectionType> {
  content: SectionContentMap[T]
  background: SectionBackground
  // Every option the layout declares, defaults filled in (SectionRenderer resolves them)
  options: Record<string, string>
  // The page's event (a sample one in previews)
  occasion: SectionOccasion
}
