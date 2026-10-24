import type { Component } from 'vue'
import type { Section, SectionContentMap, SectionBackground, SectionType } from './section.type'
import { defineAsyncComponent } from 'vue'

export interface SectionLayoutDefinition {
  // Stored on the section (`Section.layout`); never rename once used.
  key: string
  name: string
  // One component per layout, named after the key (`text-left` → HeroTextLeft.vue).
  // Loaded on demand so event pages only download the layouts they use.
  component: Component
  // Background for new sections with this layout. Every layout supports every background:
  // the background is independent of the layout (see SectionFrame).
  defaultBackground: SectionBackground
}

export interface SectionTypeDefinition<T extends SectionType> {
  type: T
  name: string
  description: string
  defaultContent: SectionContentMap[T]
  layouts: SectionLayoutDefinition[]
}

// A hero layout entry. New hero sections start on the photo background (primary until a background image is added).
function hero(key: string, name: string, load: () => Promise<{ default: Component }>): SectionLayoutDefinition {
  return { key, name, component: defineAsyncComponent(load), defaultBackground: 'photo' }
}

/** Every section type and layout the builder offers. Register new layouts here. */
type SectionRegistry = { [T in SectionType]: SectionTypeDefinition<T> }

export const sectionRegistry: SectionRegistry = {
  hero: {
    type: 'hero',
    name: 'Hero',
    description: 'The opening of the page: names, date, place and a call to action.',
    defaultContent: {
      eyebrow: 'Together with their families',
      title: 'Ana & Marco',
      subtitle: 'invite you to celebrate their wedding',
      date: 'Saturday, 12 June 2027',
      location: 'Tagaytay, Philippines',
      cta: { label: 'RSVP', href: '#rsvp' },
    },
    // Layouts only decide where the text sits. Every layout supports every background, the background
    // image (on `photo`) and the layout image.
    layouts: [
      hero('centered', 'Centered', () => import('~/components/sections/hero/HeroCentered.vue')),
      hero('text-left', 'Text left', () => import('~/components/sections/hero/HeroTextLeft.vue')),
      hero('text-right', 'Text right', () => import('~/components/sections/hero/HeroTextRight.vue')),
      hero('text-bottom', 'Text bottom', () => import('~/components/sections/hero/HeroTextBottom.vue')),
      hero('text-bottom-left', 'Text bottom left', () => import('~/components/sections/hero/HeroTextBottomLeft.vue')),
      hero('text-bottom-right', 'Text bottom right', () => import('~/components/sections/hero/HeroTextBottomRight.vue')),
      hero('text-top', 'Text top', () => import('~/components/sections/hero/HeroTextTop.vue')),
      hero('text-top-right', 'Text top right', () => import('~/components/sections/hero/HeroTextTopRight.vue')),
      hero('text-top-left', 'Text top left', () => import('~/components/sections/hero/HeroTextTopLeft.vue')),
    ],
  },
}

export function getSectionType<T extends SectionType>(type: T): SectionTypeDefinition<T> {
  return sectionRegistry[type]
}

/** A new section of the given type: its first layout, that layout's default background, and the default content. */
export function createDefaultSection<T extends SectionType>(type: T): Section<T> {
  const definition = getSectionType(type)
  const layout = definition.layouts[0]!

  return {
    type,
    layout: layout.key,
    background: layout.defaultBackground,
    content: structuredClone(definition.defaultContent),
  }
}

export function getSectionLayout(type: SectionType, layoutKey: string): SectionLayoutDefinition | undefined {
  return sectionRegistry[type]?.layouts.find(layout => layout.key === layoutKey)
}
