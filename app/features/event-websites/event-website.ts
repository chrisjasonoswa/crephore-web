import type { EventWebsite, EventWebsiteDraft, UpdateEventWebsiteRequest, WebsiteSection, WebsiteTheme } from './event-website.type'
import type { Event, EventType } from '~/features/events/event.type'
import type { SectionProgram } from '~/features/sections/program/program.type'
import type { SectionContentMap, SectionOccasion, SectionType } from '~/features/sections/section.type'
import type { SiteTheme } from '~/site-theme/useSiteTheme'
import { toRaw } from 'vue'
import { occasionDate, sampleProgramItems, sampleProgramVenues } from '~/features/sections/program/program.helpers'
import { withoutUnusedPhotos } from '~/features/sections/section.photos'
import { fieldNotes } from '~/features/sections/section.fields'
import { createDefaultSection, currentLayoutKey, getSectionLayout, getSectionType, withLayoutOptionsOnly } from '~/features/sections/section.registry'
import { motionForEventType, normalizeSiteMotion } from '~/features/site-motion/site-motion.type'
import { upgradeSectionContent } from '~/features/sections/section.upgrade'
import { fontPairings } from '~/site-theme/fontPairings'
import { eventKindFor } from '~/site-theme/eventKinds'
import { defaultColorPreset } from '~/site-theme/presets'

/**
 * The event as sections see it: its name and main venue (the hero's and countdown's), start and timezone (their dates),
 * and its program with its venues (`sectionProgram`; none when only the date matters, e.g. the hero's fields).
 */
export function eventOccasion(
  event: Pick<Event, 'name' | 'venueName' | 'startsAt' | 'timezone' | 'bornOn' | 'diedOn'>,
  program: SectionProgram = { items: [], venues: [] },
): SectionOccasion {
  return {
    name: event.name,
    venue: event.venueName,
    startsAt: event.startsAt,
    timezone: event.timezone,
    program,
    bornOn: event.bornOn ?? undefined,
    diedOn: event.diedOn ?? undefined,
  }
}

/**
 * The occasion for thumbnails (layout pickers, the add dialog): with the sample program (and its venues) on the event's
 * day while the event has none, so program layouts show their shape.
 */
export function withSampleProgram(occasion: SectionOccasion): SectionOccasion {
  if (occasion.program.items.length)
    return occasion
  return { ...occasion, program: { venue: occasion.venue || undefined, items: sampleProgramItems(occasionDate(occasion)), venues: sampleProgramVenues() } }
}

// The colours of the event kind's default preset (an unset one left out)
function presetColors(eventType?: EventType): Pick<SiteTheme, 'primaryColor' | 'secondaryColor' | 'accentColor'> {
  const { primaryColor, secondaryColor, accentColor } = defaultColorPreset(eventKindFor(eventType))
  return { primaryColor, ...(secondaryColor && { secondaryColor }), ...(accentColor && { accentColor }) }
}

/**
 * The theme a new website starts with: the colours and motion that suit the kind of event (`defaultColorPreset`,
 * `motionForEventType`), the first font pairing and soft corners.
 */
export function defaultWebsiteTheme(eventType?: EventType): SiteTheme {
  return {
    ...presetColors(eventType),
    fontPairingKey: fontPairings[0]!.key,
    cornerStyle: 'soft',
    motion: motionForEventType(eventType),
  }
}

/** A website started from scratch: the default theme (for the kind of event) and no sections. */
export function createBlankWebsite(eventType?: EventType): EventWebsiteDraft {
  return { theme: defaultWebsiteTheme(eventType), sections: [] }
}

// The event's own details a new section starts with, instead of the sample text. The hero's, countdown's and program's
// come from the event as they render (`eventOccasion`), so they start with none.
const eventDetails: { [T in SectionType]: (event: Event) => Partial<SectionContentMap[T]> } = {
  // A memorial's hero starts with the years under the name (once the event has its dates)
  hero: event => (event.type === 'Memorial' ? { lifeDates: 'years' } : {}),
  countdown: () => ({}),
  // Generic text that suits any event; hosts sign it themselves
  message: () => ({}),
  about: () => ({}),
  people: () => ({}),
  program: () => ({}),
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
/**
 * Why the website can't be saved, or null. Every website has exactly one hero section (its opening), shown or hidden.
 * The API checks the same with the same messages.
 */
export function websiteProblem(website: EventWebsiteDraft): string | null {
  const heroes = website.sections.filter(section => section.type === 'hero').length
  if (heroes === 0)
    return 'Add a hero section: every website needs one.'
  if (heroes > 1)
    return 'A website can only have one hero section.'
  return null
}

/**
 * Sections guests would see without content their layout needs ("About (Timeline): This layout needs at least one
 * chapter."). Warnings only: publishing goes ahead, since layouts show placeholders for what's missing.
 */
export function websiteWarnings(website: EventWebsiteDraft): string[] {
  return website.sections.filter(section => section.isVisible).flatMap((section) => {
    const layout = getSectionLayout(section.type, section.layout)
    if (!layout)
      return []
    const definition = getSectionType(section.type)
    const { missing } = fieldNotes(definition, layout, section.content)
    return missing.length ? [`${definition.name} (${layout.name}): ${missing.join(' ')}`] : []
  })
}

/**
 * A theme as the API sends it, for the editor and the published site: unset colours (null) are left out, and a motion
 * that's missing or unknown (saved before it existed) gets the defaults.
 */
export function themeFromApi(theme: WebsiteTheme): SiteTheme {
  const { secondaryColor, accentColor, backgroundColor, ...rest } = theme
  return {
    ...rest,
    ...(secondaryColor && { secondaryColor }),
    ...(accentColor && { accentColor }),
    ...(backgroundColor && { backgroundColor }),
    motion: normalizeSiteMotion(rest.motion),
  }
}

/**
 * A saved website as the editor holds it; each section gets an editor key, older content is upgraded, and a motion
 * that's missing or unknown (saved before it existed) gets the defaults.
 */
export function websiteFromApi(website: EventWebsite): EventWebsiteDraft {
  return {
    theme: themeFromApi(website.theme),
    sections: website.sections.map(section => ({
      key: `section-${section.id}`,
      id: section.id,
      type: section.type,
      // A removed layout opens as its replacement
      layout: currentLayoutKey(section.type, section.layout),
      background: section.background,
      options: section.options,
      content: upgradeSectionContent(section.type, section.content, section.contentVersion),
      isVisible: section.isVisible,
      visibility: section.visibility,
    })),
  }
}

/**
 * The save request: the whole website, sections in page order (saved ones by id), without the photos a section
 * doesn't show (`withoutUnusedPhotos`), nor options its layout doesn't have (`withLayoutOptionsOnly`): the editor keeps
 * them while editing, the saved website doesn't.
 */
export function mapWebsiteToRequest(website: EventWebsiteDraft): UpdateEventWebsiteRequest {
  const { theme } = website
  return {
    theme: {
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor ?? null,
      accentColor: theme.accentColor ?? null,
      backgroundColor: theme.backgroundColor ?? null,
      fontPairingKey: theme.fontPairingKey,
      cornerStyle: theme.cornerStyle,
      motion: theme.motion,
    },
    sections: website.sections.map(withoutUnusedPhotos).map(withLayoutOptionsOnly).map(section => ({
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
