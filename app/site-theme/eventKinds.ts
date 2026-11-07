import type { EventType } from '~/features/events/event.type'

// The kinds of event the site's look is grouped by: colour presets, decorative dividers and the intro a new website
// starts with. `any` suits every event.
export const eventKinds = ['any', 'wedding', 'party', 'business', 'memorial'] as const
export type EventKind = (typeof eventKinds)[number]

// Each kind's name, everywhere it's shown (picker tabs, group headings)
export const eventKindLabels: Record<EventKind, string> = {
  any: 'Any',
  wedding: 'Weddings & engagements',
  party: 'Birthdays & parties',
  business: 'Business & conferences',
  memorial: 'Memorials & tributes',
}

/** The kind an event type belongs to (`any` for Other or none). */
export function eventKindFor(type: EventType | undefined): EventKind {
  switch (type) {
    case 'Wedding':
    case 'Engagement':
      return 'wedding'
    case 'Birthday':
    case 'Parties':
      return 'party'
    case 'Conference':
    case 'Business':
    case 'CompanyEvents':
      return 'business'
    case 'Memorial':
      return 'memorial'
    default:
      return 'any'
  }
}
