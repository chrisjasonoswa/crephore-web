import type { EventProgram, EventProgramDraft, UpdateEventProgramRequest } from './event-program.type'
import type { EventVenue } from '~/features/event-venues/event-venue.type'
import type { ProgramVenue, SectionProgram } from '~/features/sections/program/program.type'
import { hasVenueDetails } from '~/features/sections/program/program.helpers'

// The event's program between the API, the Program tab and the sections.

/** A program with no items (a new event's). */
export const emptyEventProgram = (): EventProgram => ({ items: [] })

/** The saved program as the Program tab edits it: each item keyed by its saved id, empty fields left out. */
export function programFromApi(program: EventProgram): EventProgramDraft {
  return {
    items: program.items.map(item => ({
      id: `item-${item.id}`,
      savedId: item.id,
      date: item.date,
      title: item.title,
      ...(item.startTime && { startTime: item.startTime }),
      ...(item.endTime && { endTime: item.endTime }),
      ...(item.description && { description: item.description }),
      ...(item.venueId != null && { venueId: item.venueId }),
      ...(item.speakers && { speakers: item.speakers }),
    })),
  }
}

// Optional text: trimmed, null when blank
const optional = (value?: string) => value?.trim() || null

/** The save request: every item in order (saved ones by id), text trimmed, blank fields as null. */
export function mapProgramToRequest(program: EventProgramDraft): UpdateEventProgramRequest {
  return {
    items: program.items.map(item => ({
      id: item.savedId ?? null,
      date: item.date,
      startTime: item.startTime || null,
      endTime: item.endTime || null,
      title: item.title.trim(),
      description: optional(item.description),
      venueId: item.venueId ?? null,
      speakers: optional(item.speakers),
    })),
  }
}

/** Whether saving `a` would store the same program as `b` (editor keys don't count). */
export function isSameProgram(a: EventProgramDraft, b: EventProgramDraft): boolean {
  return JSON.stringify(mapProgramToRequest(a)) === JSON.stringify(mapProgramToRequest(b))
}

/**
 * The saved program as sections show it, with its venues' names: when every item is at the same venue, that venue is
 * the program's (shown under the heading) and the items show none; otherwise each item shows its own. Plus the venues'
 * details for the bottom of the layouts: the venues its items are at, in the order first used, with more than a name.
 */
export function sectionProgram(program: EventProgram, venues: EventVenue[]): SectionProgram {
  const nameOf = (venueId: number | null) => venues.find(venue => venue.id === venueId)?.name
  const [first] = program.items
  const shared = first && program.items.every(item => item.venueId === first.venueId) ? nameOf(first.venueId) : undefined
  const usedIds = [...new Set(program.items.map(item => item.venueId).filter(id => id != null))]
  const details = usedIds
    .map(id => venues.find(venue => venue.id === id))
    .filter(venue => venue !== undefined)
    .map((venue): ProgramVenue => ({
      id: `venue-${venue.id}`,
      name: venue.name,
      ...(venue.address && { address: venue.address }),
      ...(venue.notes && { notes: venue.notes }),
      ...(venue.photoUrl && { photo: venue.photoUrl }),
      ...(venue.latitude != null && venue.longitude != null && { latitude: venue.latitude, longitude: venue.longitude }),
      ...(venue.googleMapsUrl && { googleMapsUrl: venue.googleMapsUrl }),
      ...(venue.appleMapsUrl && { appleMapsUrl: venue.appleMapsUrl }),
    }))
    .filter(hasVenueDetails)
  return {
    ...(shared && { venue: shared }),
    items: programFromApi(program).items.map(({ savedId: _savedId, venueId, ...item }) => {
      const venue = shared ? undefined : nameOf(venueId ?? null)
      return venue ? { ...item, venue } : item
    }),
    venues: details,
  }
}

// The API's limits (EventProgramsService)
export const programItemLimits = { title: 150, description: 500, speakers: 300 }

/**
 * Why each item can't be saved, keyed like the API's errors ("items[2].title"): the same rules and messages, so the
 * Program tab shows them beside the fields before sending. Empty when the program can be saved.
 */
export function programErrors(program: EventProgramDraft): Record<string, string> {
  const errors: Record<string, string> = {}
  program.items.forEach((item, index) => {
    const key = `items[${index}]`
    if (!item.date)
      errors[`${key}.date`] = 'Date is required.'
    if (item.endTime && !item.startTime)
      errors[`${key}.endTime`] = 'Add a start time first.'
    if (!item.title.trim())
      errors[`${key}.title`] = 'Title is required.'
    else if (item.title.trim().length > programItemLimits.title)
      errors[`${key}.title`] = `Title must be ${programItemLimits.title} characters or fewer.`
    if ((item.description?.trim().length ?? 0) > programItemLimits.description)
      errors[`${key}.description`] = `Note must be ${programItemLimits.description} characters or fewer.`
    if ((item.speakers?.trim().length ?? 0) > programItemLimits.speakers)
      errors[`${key}.speakers`] = `Speakers must be ${programItemLimits.speakers} characters or fewer.`
  })
  return errors
}
