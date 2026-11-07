import type { ProgramItem } from '~/features/sections/program/program.type'

// Mirrors crephore-backend Features/EventPrograms. Dates and times are the event's wall clock: "2027-02-14", "15:00".
export interface EventProgramItem {
  id: number
  date: string
  startTime: string | null
  endTime: string | null
  title: string
  description: string | null
  // One of the event's venues (event-venues), or null for none (e.g. a livestream)
  venueId: number | null
  speakers: string | null
}

// The event's program (its schedule): its items in the host's order
export interface EventProgram {
  items: EventProgramItem[]
}

/* API Request Types */
// The whole program; saving replaces it. Items with an id are updated, new ones (null) added, the rest deleted.
export interface UpdateEventProgramRequest {
  items: (Omit<EventProgramItem, 'id'> & { id: number | null })[]
}

/* Editor */
// An item as the Program tab edits it: a section `ProgramItem` (its `id` is the editor's key) plus its saved id and
// venue (by id; sections get its name through `sectionProgram`)
export interface EventProgramDraftItem extends ProgramItem {
  savedId?: number
  venueId?: number
}

export interface EventProgramDraft {
  items: EventProgramDraftItem[]
}
