import type { SectionLayoutDefinition, SectionTypeDefinition } from './section.registry.type'
import type { Section, SectionType } from './section.type'
import { aboutSection } from './about/about.registry'
import { countdownSection } from './countdown/countdown.registry'
import { dressCodeSection } from './dress-code/dress-code.registry'
import { heroSection } from './hero/hero.registry'
import { messageSection } from './message/message.registry'
import { peopleSection } from './people/people.registry'
import { programSection } from './program/program.registry'
import { resolveLayoutOptions } from './section.options'

// Every section type the builder offers, in the order the add dialog lists them. Each type and its layouts live in
// its folder (`<type>/<type>.registry.ts`); register a new type here.
type SectionRegistry = { [T in SectionType]: SectionTypeDefinition<T> }

export const sectionRegistry: SectionRegistry = {
  hero: heroSection,
  countdown: countdownSection,
  message: messageSection,
  about: aboutSection,
  people: peopleSection,
  program: programSection,
  'dress-code': dressCodeSection,
}

export function getSectionType<T extends SectionType>(type: T): SectionTypeDefinition<T> {
  return sectionRegistry[type]
}

// Layouts that were removed, and the layout their saved sections show instead (the API moves saved ones too; published
// copies keep the old key, so it's mapped where saved websites are read)
const replacedLayouts: Partial<Record<SectionType, Record<string, string>>> = {
  'program': { 'tab-cards': 'cards' },
  // Without the attire presets the formality scale had nothing to place; without the scale it was the palette
  'dress-code': { formality: 'palette' },
}

/**
 * The section's options its layout has, as they are (no defaults filled in): options of a removed option or of an
 * earlier layout aren't saved. Unknown layouts keep theirs.
 */
export function withLayoutOptionsOnly<S extends Section>(section: S): S {
  const layout = getSectionLayout(section.type, section.layout)
  if (!layout || !section.options)
    return section
  const keys = new Set(layout.options.map(option => option.key))
  return { ...section, options: Object.fromEntries(Object.entries(section.options).filter(([key]) => keys.has(key))) }
}

/** A saved section's layout as it is now: a removed layout's replacement, else the layout itself. */
export function currentLayoutKey(type: SectionType, layoutKey: string): string {
  return replacedLayouts[type]?.[layoutKey] ?? layoutKey
}

export function getSectionLayout(type: SectionType, layoutKey: string): SectionLayoutDefinition | undefined {
  return sectionRegistry[type]?.layouts.find(layout => layout.key === layoutKey)
}

/**
 * A section with a different layout. Like the background, an option the host changed from the old layout's default
 * carries over when the new layout has it and offers that value (e.g. Titles: Left from Simple list to Cards); options
 * still on the old layout's default take the new layout's (Full's centred text doesn't make Split centred), and options
 * the new layout doesn't have are dropped. The background follows the layout while it is still the old layout's default
 * (e.g. Full starts on the photo, Split on light), and is kept when the host picked it and the new layout supports it.
 */
export function changeSectionLayout<S extends Section>(section: S, layoutKey: string): S {
  const next = getSectionLayout(section.type, layoutKey)
  if (!next)
    return section

  const current = getSectionLayout(section.type, section.layout)
  const isDefault = current?.backgrounds[0] === section.background
  const keep = !isDefault && next.backgrounds.includes(section.background)
  // Only what the host picked (values that aren't the old layout's default)
  const picked = Object.fromEntries(Object.entries(section.options ?? {})
    .filter(([key, value]) => current?.options.find(option => option.key === key)?.default !== value))

  return {
    ...section,
    layout: next.key,
    options: resolveLayoutOptions(next.options, picked),
    background: keep ? section.background : next.backgrounds[0]!,
  }
}

/** A new section of the given type: its first layout with that layout's defaults, and the default content. */
export function createDefaultSection<T extends SectionType>(type: T): Section<T> {
  const definition = getSectionType(type)
  const first = definition.layouts[0]!

  return {
    type,
    layout: first.key,
    options: resolveLayoutOptions(first.options, undefined),
    background: first.backgrounds[0]!,
    content: structuredClone(definition.defaultContent),
  }
}
