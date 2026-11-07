// Building blocks of the event websites hosts build (Hero, RSVP, FAQ, …).
// A section type has one or more layouts (visual variations); each layout is one component
// in `components/sections/<type>/` and is registered in `section.registry.ts`.

import type { AboutContent } from './about/about.type'
import type { CountdownContent } from './countdown/countdown.type'
import type { HeroContent } from './hero/hero.type'
import type { MessageContent } from './message/message.type'
import type { PeopleContent } from './people/people.type'
import type { ProgramContent, SectionProgram } from './program/program.type'
import { occasionDate, sampleProgramItems, sampleProgramVenues } from './program/program.helpers'

/**
 * The background a section sits on. Each background maps to site-theme variables
 * (see `section.background.ts`), so layouts work with every event's colours.
 * Each layout lists the backgrounds it supports (registry `backgrounds`).
 * These keys are stored on saved sections: never rename one.
 */
export type SectionBackground = 'light' | 'photo' | 'primary' | 'secondary'

// Order used in pickers, whatever a layout's default
export const sectionBackgrounds: SectionBackground[] = ['light', 'primary', 'secondary', 'photo']

/** The given backgrounds in picker order (a layout lists its default first, which may not be Light). */
export function inPickerOrder(backgrounds: SectionBackground[]): SectionBackground[] {
  return sectionBackgrounds.filter(background => backgrounds.includes(background))
}

/** Display names for the backgrounds (shown in the playground and editor). */
export const sectionBackgroundLabels: Record<SectionBackground, string> = {
  light: 'Light',
  photo: 'Photo',
  primary: 'Primary',
  secondary: 'Secondary',
}

/**
 * Content shape per section type, each in its folder (`<type>/<type>.type.ts`). Add new section
 * types here. Text uses the same names in every type: `eyebrow` (the small label above), `heading` (the section's main
 * line, its h1/h2) and `body` (running text, when the type has any). `title` is kept for page titles.
 */
export interface SectionContentMap {
  hero: HeroContent
  countdown: CountdownContent
  message: MessageContent
  about: AboutContent
  people: PeopleContent
  program: ProgramContent
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
 * The event the page belongs to, for sections that show its details (the hero's names, date and place, the countdown's
 * heading and target). Comes from the event, never from the section content, so it follows the event when it changes.
 */
export interface SectionOccasion {
  // The event's name, e.g. "Bea & Carlo" (the hero's and the countdown's heading)
  name: string
  // The event's venue name, e.g. "Manila Cathedral"
  venue: string
  // UTC instant (ISO), e.g. the event's startsAt
  startsAt: string
  // IANA timezone its date is shown in, e.g. "Asia/Manila"
  timezone: string
  // The event's program (the program sections' venue and items)
  program: SectionProgram
  // A memorial's dates of birth and passing ("1948-02-14"), when known (the hero's life dates, the intros' years)
  bornOn?: string
  diedOn?: string
}

/** When the occasion is, for the date helpers. */
export type OccasionTime = Pick<SectionOccasion, 'startsAt' | 'timezone'>

/**
 * Previews without an event (playground, thumbnails): an occasion 112 days, 6 hours and 45 minutes away, with the
 * sample program on its day, and life dates for the heroes and intros that show them.
 */
export function sampleOccasion(now = Date.now()): SectionOccasion {
  const away = ((112 * 24 + 6) * 60 + 45) * 60_000 + 20_000
  const time = { startsAt: new Date(now + away).toISOString(), timezone: 'Asia/Manila' }
  return {
    name: 'Bea & Carlo',
    venue: 'Manila Cathedral',
    ...time,
    program: { venue: 'Manila Cathedral', items: sampleProgramItems(occasionDate(time)), venues: sampleProgramVenues() },
    bornOn: '1938-05-01',
    diedOn: '2026-10-03',
  }
}

/** Props every layout component of a section type receives. */
// `O`: the layout's options, typed from the keys it picks (`ProgramLayoutOptions<'titleAlign' | 'showTime'>`, …)
export interface SectionLayoutProps<T extends SectionType, O extends Record<string, string> = Record<string, string>> {
  content: SectionContentMap[T]
  background: SectionBackground
  // Every option the layout declares, defaults filled in (SectionRenderer resolves them)
  options: O
  // The page's event (a sample one in previews)
  occasion: SectionOccasion
}
