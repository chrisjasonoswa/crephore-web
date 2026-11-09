import type { SectionType } from '~/features/sections/section.type'
import { describe, expect, it } from 'vitest'
import { aboutSectionLayoutOptions } from '~/features/sections/about/about.options'
import { countdownSectionLayoutOptions } from '~/features/sections/countdown/countdown.options'
import { dressCodeSectionLayoutOptions } from '~/features/sections/dress-code/dress-code.options'
import { heroSectionLayoutOptions } from '~/features/sections/hero/hero.options'
import { messageSectionLayoutOptions } from '~/features/sections/message/message.options'
import { peopleSectionLayoutOptions } from '~/features/sections/people/people.options'
import { programSectionLayoutOptions } from '~/features/sections/program/program.options'
import { allSectionLayoutOptions } from '~/features/sections/section.layout-options'
import { pickLayoutOptions } from '~/features/sections/section.options'
import { sectionRegistry } from '~/features/sections/section.registry'

// Each type's own catalogue
const typeCatalogues: Record<SectionType, Record<string, unknown>> = {
  hero: heroSectionLayoutOptions,
  countdown: countdownSectionLayoutOptions,
  message: messageSectionLayoutOptions,
  about: aboutSectionLayoutOptions,
  people: peopleSectionLayoutOptions,
  program: programSectionLayoutOptions,
  'dress-code': dressCodeSectionLayoutOptions,
}
const types = Object.keys(sectionRegistry) as SectionType[]

describe('layout option catalogues', () => {
  it('picks a layout\'s options by key, in order, with its overrides', () => {
    const catalogue = {
      textAlign: { label: 'Text', choices: [{ value: 'start', label: 'Left' }, { value: 'center', label: 'Center' }], default: 'center' },
      photoSide: { label: 'Photo side', choices: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }], default: 'left' },
    }

    expect(pickLayoutOptions(catalogue, [['photoSide', { label: 'Photos side', default: 'right' }], 'textAlign'])).toEqual([
      { key: 'photoSide', label: 'Photos side', choices: catalogue.photoSide.choices, default: 'right' },
      { key: 'textAlign', ...catalogue.textAlign },
    ])
  })

  it.each(types)('keeps the %s options apart from the shared ones: a key is in only one catalogue', (type) => {
    const shared = Object.keys(allSectionLayoutOptions)

    expect(Object.keys(typeCatalogues[type]).filter(key => shared.includes(key))).toEqual([])
  })

  it.each(types)('gives every %s layout options from its catalogues, each default one of its choices', (type) => {
    const known = [...Object.keys(allSectionLayoutOptions), ...Object.keys(typeCatalogues[type])]
    for (const layout of sectionRegistry[type].layouts) {
      for (const option of layout.options) {
        expect(known, `${layout.key}.${option.key}`).toContain(option.key)
        expect(option.choices.map(choice => choice.value), `${layout.key}.${option.key}`).toContain(option.default)
      }
      // No option twice in a layout
      expect(new Set(layout.options.map(option => option.key)).size, layout.key).toBe(layout.options.length)
    }
  })
})
