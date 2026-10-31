import type { EventWebsite, EventWebsiteDraft, UpdateEventWebsiteRequest, WebsiteSection } from './event-website.type'
import type { Event } from '~/features/events/event.type'
import type { SectionContentMap, SectionOccasion, SectionType } from '~/features/sections/section.type'
import type { SiteTheme } from '~/site-theme/useSiteTheme'
import { toRaw } from 'vue'
import { formatOccasionDate } from '~/features/sections/countdown'
import { createDefaultSection, getSectionType } from '~/features/sections/section.registry'
import { fontPairings } from '~/site-theme/fontPairings'
import { colorPresets } from '~/site-theme/presets'

/** The event as sections see it: its start and timezone (the countdown's target, dates in the hero). */
export function eventOccasion(event: Pick<Event, 'startsAt' | 'timezone'>): SectionOccasion {
  return { startsAt: event.startsAt, timezone: event.timezone }
}

/** The theme a new website starts with: the first colour preset and font pairing, soft corners. */
export function defaultWebsiteTheme(): SiteTheme {
  return {
    primaryColor: colorPresets[0]!.primaryColor,
    accentColor: colorPresets[0]!.accentColor,
    fontPairingKey: fontPairings[0]!.key,
    cornerStyle: 'soft',
  }
}

/** A website started from scratch: the default theme and no sections. */
export function createBlankWebsite(): EventWebsiteDraft {
  return { theme: defaultWebsiteTheme(), sections: [] }
}

// The event's own details a new section starts with, instead of the sample text
const eventDetails: { [T in SectionType]: (event: Event) => Partial<SectionContentMap[T]> } = {
  hero: event => ({
    title: event.name,
    date: formatOccasionDate(eventOccasion(event)),
    venue: event.venueName || undefined,
  }),
  countdown: event => ({ title: event.name }),
}

/** A new section for the event's page: the type's first layout and default content, with the event's details filled in. */
export function createWebsiteSection<T extends SectionType>(type: T, event: Event): WebsiteSection<T> {
  const section = createDefaultSection(type)
  return {
    ...section,
    key: crypto.randomUUID(),
    isVisible: true,
    visibility: 'Always',
    content: { ...section.content, ...eventDetails[type](event) },
  }
}

/** A copy of the section (its own key, not saved yet), e.g. to try another layout next to it. */
export function duplicateWebsiteSection<T extends SectionType>(section: WebsiteSection<T>): WebsiteSection<T> {
  const { id: _id, ...copy } = structuredClone(toRaw(section))
  return { ...copy, key: crypto.randomUUID() }
}

/** The list with the item at `from` moved to `to`. */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = [...items]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item!)
  return next
}

/* Saving */
/** A saved website as the editor holds it; each section gets an editor key. */
export function websiteFromApi(website: EventWebsite): EventWebsiteDraft {
  const { backgroundColor, ...theme } = website.theme
  return {
    theme: backgroundColor ? { ...theme, backgroundColor } : theme,
    sections: website.sections.map(section => ({
      key: `section-${section.id}`,
      id: section.id,
      type: section.type,
      layout: section.layout,
      background: section.background,
      options: section.options,
      content: section.content,
      isVisible: section.isVisible,
      visibility: section.visibility,
    })),
  }
}

/** The save request: the whole website, sections in page order (saved ones by id). */
export function mapWebsiteToRequest(website: EventWebsiteDraft): UpdateEventWebsiteRequest {
  const { theme } = website
  return {
    theme: {
      primaryColor: theme.primaryColor,
      accentColor: theme.accentColor,
      backgroundColor: theme.backgroundColor ?? null,
      fontPairingKey: theme.fontPairingKey,
      cornerStyle: theme.cornerStyle,
    },
    sections: website.sections.map(section => ({
      id: section.id ?? null,
      type: section.type,
      layout: section.layout,
      background: section.background,
      options: section.options ?? {},
      content: section.content,
      contentVersion: getSectionType(section.type).contentVersion,
      isVisible: section.isVisible,
      visibility: section.visibility,
    })),
  }
}

// JSON with object keys sorted, so the same website compares equal whatever order its fields were set in
function stableJson(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) =>
    item && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
      : item)
}

/** Whether saving `a` would store the same website as `b` (editor keys don't count). */
export function isSameWebsite(a: EventWebsiteDraft, b: EventWebsiteDraft): boolean {
  return stableJson(mapWebsiteToRequest(a)) === stableJson(mapWebsiteToRequest(b))
}

/**
 * `website` after `sent` was saved as `saved`: each sent section gets its saved id, matched by editor key, so
 * selection survives and edits made while saving are kept.
 */
export function withSavedIds(website: EventWebsiteDraft, sent: EventWebsiteDraft, saved: EventWebsite): EventWebsiteDraft {
  const ids = new Map(sent.sections.map((section, index) => [section.key, saved.sections[index]?.id]))
  return {
    ...website,
    sections: website.sections.map((section) => {
      const id = ids.get(section.key)
      return id === undefined ? section : { ...section, id }
    }),
  }
}
