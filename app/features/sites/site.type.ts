import type { EventProgram } from '~/features/event-programs/event-program.type'
import type { EventVenue } from '~/features/event-venues/event-venue.type'
import type { EventType } from '~/features/events/event.type'
import type { SectionVisibility, WebsiteTheme } from '~/features/event-websites/event-website.type'
import type { SectionBackground, SectionContentMap, SectionType } from '~/features/sections/section.type'

// A published event website as guests see it (crephore-backend SiteDto): as it was when last published,
// with the event's live name, venue, start and timezone.
export interface SiteSection {
  type: SectionType
  layout: string
  background: SectionBackground
  options: Record<string, string>
  content: SectionContentMap[SectionType]
  contentVersion: number
  visibility: SectionVisibility
}

export interface Site {
  subdomain: string
  // The event's name and its main venue's name, "" without one (the hero's and countdown's heading, the hero's place)
  eventName: string
  venueName: string
  // The kind of event (what the intros fall back to without the host's own content)
  eventType: EventType
  // A memorial's dates of birth and passing ("1948-02-14"); null for other types
  bornOn: string | null
  diedOn: string | null
  // UTC instant and IANA timezone (the sections' occasion)
  startsAt: string
  timezone: string
  // The event's live program (the program sections' items) and venues, in order (its items' venues)
  program: EventProgram
  venues: EventVenue[]
  publishedAt: string
  theme: WebsiteTheme
  // Visible sections in page order
  sections: SiteSection[]
}
