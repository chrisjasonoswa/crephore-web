import type { SectionLayoutDefinition, SectionTypeDefinition } from './section.registry.type'
import type { Section, SectionType } from './section.type'
import { aboutSection } from './about/about.registry'
import { countdownSection } from './countdown/countdown.registry'
import { heroSection } from './hero/hero.registry'
import { messageSection } from './message/message.registry'
import { peopleSection } from './people/people.registry'
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
}

export function getSectionType<T extends SectionType>(type: T): SectionTypeDefinition<T> {
  return sectionRegistry[type]
}

export function getSectionLayout(type: SectionType, layoutKey: string): SectionLayoutDefinition | undefined {
  return sectionRegistry[type]?.layouts.find(layout => layout.key === layoutKey)
}

/**
 * A section with a different layout: its options reset to that layout's defaults. The background follows the
 * layout while it is still the old layout's default (e.g. Full starts on the photo, Split on light), and is kept
 * when the host picked it and the new layout supports it.
 */
export function changeSectionLayout<S extends Section>(section: S, layoutKey: string): S {
  const next = getSectionLayout(section.type, layoutKey)
  if (!next)
    return section

  const current = getSectionLayout(section.type, section.layout)
  const isDefault = current?.backgrounds[0] === section.background
  const keep = !isDefault && next.backgrounds.includes(section.background)

  return {
    ...section,
    layout: next.key,
    options: resolveLayoutOptions(next.options, undefined),
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
