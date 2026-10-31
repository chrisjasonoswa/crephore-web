import type { SectionVisibility, WebsiteTheme } from '~/features/event-websites/event-website.type'
import type { SectionBackground, SectionContentMap, SectionType } from '~/features/sections/section.type'

// A published event website as guests see it (crephore-backend SiteDto): as it was when last published,
// with the event's live start and timezone.
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
  eventName: string
  // UTC instant and IANA timezone (the sections' occasion)
  startsAt: string
  timezone: string
  publishedAt: string
  theme: WebsiteTheme
  // Visible sections in page order
  sections: SiteSection[]
}
