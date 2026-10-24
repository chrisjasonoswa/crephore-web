import { describe, expect, it } from 'vitest'
import { createDefaultSection, getSectionLayout, getSectionType, sectionRegistry } from '~/features/sections/section.registry'
import { sectionBackgrounds } from '~/features/sections/section.type'

describe('section registry', () => {
  it('registers the hero with the centered layout', () => {
    const hero = getSectionType('hero')

    expect(hero.name).toBe('Hero')
    expect(hero.layouts.map(layout => layout.key)).toContain('centered')
  })

  it('finds a layout by section type and key', () => {
    const layout = getSectionLayout('hero', 'centered')

    expect(layout?.name).toBe('Centered')
    expect(layout?.component).toBeTruthy()
  })

  it('registers the nine hero layouts in picker order', () => {
    expect(getSectionType('hero').layouts.map(layout => layout.key)).toEqual([
      'centered',
      'text-left',
      'text-right',
      'text-bottom',
      'text-bottom-left',
      'text-bottom-right',
      'text-top',
      'text-top-right',
      'text-top-left',
    ])
  })

  it('gives every layout its own component', () => {
    for (const definition of Object.values(sectionRegistry)) {
      const components = definition.layouts.map(layout => layout.component)
      expect(new Set(components).size, definition.type).toBe(components.length)
    }
  })

  it('returns undefined for an unknown layout', () => {
    expect(getSectionLayout('hero', 'does-not-exist')).toBeUndefined()
  })

  it('gives every layout a unique key and a valid default background', () => {
    for (const definition of Object.values(sectionRegistry)) {
      const keys = definition.layouts.map(layout => layout.key)
      expect(new Set(keys).size).toBe(keys.length)

      for (const layout of definition.layouts)
        expect(sectionBackgrounds).toContain(layout.defaultBackground)
    }
  })

  it('gives the hero default content with a title', () => {
    expect(getSectionType('hero').defaultContent.title).toBeTruthy()
  })
})

describe('createDefaultSection', () => {
  it('uses the first layout, its default background and the default content', () => {
    const hero = getSectionType('hero')

    expect(createDefaultSection('hero')).toEqual({
      type: 'hero',
      layout: hero.layouts[0]!.key,
      background: hero.layouts[0]!.defaultBackground,
      content: hero.defaultContent,
    })
  })

  it('copies the default content so editing a section never changes the registry', () => {
    const section = createDefaultSection('hero')

    section.content.title = 'Changed'
    section.content.cta!.label = 'Changed'

    expect(getSectionType('hero').defaultContent.title).not.toBe('Changed')
    expect(getSectionType('hero').defaultContent.cta!.label).not.toBe('Changed')
  })
})
