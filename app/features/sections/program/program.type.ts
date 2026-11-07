// One part of the day, e.g. "3:00 PM · Ceremony · Manila Cathedral". Items belong to the event (its program, saved
// in the event page's Program tab, features/event-programs), never to a section's content.
export interface ProgramItem {
  // Stable key for drag-to-reorder and v-for
  id: string
  // "2027-02-14": the item's calendar date in the event's timezone
  date: string
  // "15:00"; optional: an untimed item shows a number or nothing
  startTime?: string
  // "16:00"; earlier than the start means it ends after midnight
  endTime?: string
  title: string
  // "Please be seated by 2:45."
  description?: string
  // Where it happens when that's not the program's venue (or every item's, when the program moves around)
  venue?: string
  // "Ana Lim, Paolo Tan"; the agenda shows the first one's initials
  speakers?: string
}

/**
 * A venue of the program with what guests need to get there (the event's venue, from its Venues tab), shown at the
 * bottom of every program layout. Only venues with more than a name are listed.
 */
export interface ProgramVenue {
  // Stable key
  id: string
  name: string
  address?: string
  // Directions, parking and the like
  notes?: string
  photo?: string
  // The pin, read from the map links (the map preview without a photo)
  latitude?: number
  longitude?: number
  googleMapsUrl?: string
  appleMapsUrl?: string
}

/**
 * The event's program as sections show it (`SectionOccasion.program`): where it happens, its items in the host's
 * order, and its venues' details. Comes from the event, never from section content, so every program section shows
 * the same schedule.
 */
export interface SectionProgram {
  // The event's venue when the whole program happens there, shown under the heading; absent when it moves around
  // (each item names its own)
  venue?: string
  items: ProgramItem[]
  // The venues its items are at, in the order they're first used, with more than a name (`sectionProgram`)
  venues?: ProgramVenue[]
}

// Every field a program layout can use (the schedule and venues come from the event)
export const programFields = ['eyebrow', 'heading', 'venuesEyebrow', 'venuesHeading'] as const
export type ProgramField = (typeof programFields)[number]

// Every program layout uses the same fields; the venue and items are the event's (`SectionLayoutProps.occasion`).
// A few layouts show a photo of their own (`layoutPhotos`, e.g. the vertical title's banner).
export interface ProgramContent {
  // Small label, e.g. "The day"
  eyebrow?: string
  heading: string
  // The venues block at the bottom (`occasion.program.venues`): its own small label and heading; each left out when
  // empty
  venuesEyebrow?: string
  venuesHeading: string
  // Photos inside the layout, by slot (see the layout's `layoutPhotoCount`); most program layouts have none
  layoutPhotos: string[]
  // The photo behind the section on the `photo` background (any layout, under an overlay); without it the section
  // uses the primary colour. Never shown inside a layout.
  backgroundPhoto?: string
}
