import type { Section, SectionBackground, SectionContentMap, SectionType } from '~/features/sections/section.type'
import type { SiteTheme } from '~/site-theme/useSiteTheme'

// An event's website: its theme and its sections in page order (crephore-backend EventWebsite / WebsiteSection).

// When guests see a section: always, only before the event starts, or only after it. Every section is Always for
// now (no editor control yet, and the guest page doesn't apply it yet). Stored by name; never rename one.
export const sectionVisibilities = ['Always', 'BeforeEvent', 'AfterEvent'] as const
export type SectionVisibility = (typeof sectionVisibilities)[number]

export interface WebsiteSection<T extends SectionType = SectionType> extends Section<T> {
  // Identifies the section in the editor (list, drag, selection); never sent to the API
  key: string
  // The saved section's id; missing until the section is first saved
  id?: number
  // Hidden sections stay in the editor but are not shown to guests
  isVisible: boolean
  // Kept as loaded, so saving doesn't reset it
  visibility: SectionVisibility
}

// The website as the editor holds it, saved or not
export interface EventWebsiteDraft {
  theme: SiteTheme
  // In page order
  sections: WebsiteSection[]
}

/* API (crephore-backend EventWebsiteDto) */
// The theme as the API sends it: no background colour is null
export type WebsiteTheme = Omit<SiteTheme, 'backgroundColor'> & { backgroundColor: string | null }

export interface WebsiteSectionResponse {
  id: number
  type: SectionType
  layout: string
  background: SectionBackground
  options: Record<string, string>
  content: SectionContentMap[SectionType]
  contentVersion: number
  isVisible: boolean
  visibility: SectionVisibility
}

export interface EventWebsite {
  id: number
  eventId: number
  theme: WebsiteTheme
  // In page order
  sections: WebsiteSectionResponse[]
  // When it was last published; null while guests can't see it
  publishedAt: string | null
  // Published, but guests see an older version than the saved one
  hasUnpublishedChanges: boolean
  createdAt: string
  updatedAt: string
}

// Saving replaces the whole website: sections with an id are updated, new ones (id null) added, saved ones left out deleted
export interface UpdateEventWebsiteRequest {
  theme: WebsiteTheme
  sections: (Omit<WebsiteSectionResponse, 'id'> & { id: number | null })[]
}
