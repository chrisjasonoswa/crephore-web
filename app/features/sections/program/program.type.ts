// One part of the day, e.g. "3:00 PM · Ceremony · Manila Cathedral".
export interface ProgramItem {
  // Stable key for drag-to-reorder and v-for (generated when added)
  id: string
  // "2027-02-14": the item's calendar date in the event's timezone; empty means the event's day (sample content)
  date: string
  // "15:00"; optional: an untimed item shows a number or nothing
  startTime?: string
  // "16:00"; earlier than the start means it ends after midnight
  endTime?: string
  title: string
  // "Please be seated by 2:45."
  description?: string
  venue?: string
  // Links the item to a venue of the Venue & Map section (for a "Map" link), once that section exists
  venueKey?: string
  // "Ana Lim, Paolo Tan"; the agenda shows the first one's initials
  speakers?: string
}

// Every program layout uses the same fields: the order of events on the day (or days), in the host's order.
// A few layouts show a photo of their own (`layoutPhotos`, e.g. the vertical title's banner).
export interface ProgramContent {
  // Small label, e.g. "The day"
  eyebrow?: string
  heading: string
  // Where the whole program happens, e.g. "Manila Cathedral", shown under the heading; an item's own venue is for one
  // that happens somewhere else (or for programs that move around)
  venue?: string
  items: ProgramItem[]
  // Photos inside the layout, by slot (see the layout's `layoutPhotoCount`); most program layouts have none
  layoutPhotos: string[]
  // The photo behind the section on the `photo` background (any layout, under an overlay); without it the section
  // uses the primary colour. Never shown inside a layout.
  backgroundPhoto?: string
}
