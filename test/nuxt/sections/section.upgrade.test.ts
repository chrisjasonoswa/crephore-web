import type { CountdownContent } from '~/features/sections/countdown/countdown.type'
import type { HeroContent } from '~/features/sections/hero/hero.type'
import type { UpgradeSteps } from '~/features/sections/section.upgrade'
import { describe, expect, it, vi } from 'vitest'
import { getSectionType } from '~/features/sections/section.registry'
import { upgradeSectionContent } from '~/features/sections/section.upgrade'

describe('upgradeSectionContent', () => {
  it('runs each step from the saved version up to the current one, in order', () => {
    vi.spyOn(getSectionType('countdown'), 'contentVersion', 'get').mockReturnValue(3)
    const steps: UpgradeSteps = {
      countdown: {
        1: ({ title, ...content }) => ({ ...content, heading: title }),
        2: content => ({ ...content, eyebrow: 'Added in 3' }),
      },
    }
    const old = { title: 'Soon', showSeconds: true, layoutPhotos: [] } as unknown as CountdownContent

    expect(upgradeSectionContent('countdown', old, 1, steps)).toEqual({ heading: 'Soon', eyebrow: 'Added in 3', showSeconds: true, layoutPhotos: [] })
    expect(upgradeSectionContent('countdown', old, 2, steps)).toEqual({ ...old, eyebrow: 'Added in 3' })
    vi.restoreAllMocks()
  })

  it('gives program content saved at version 1 its layout photos, drops the venue and items at version 2, and gives the venues a heading at version 3', () => {
    const atVersion1 = { heading: 'Program', venue: 'Manila Cathedral', items: [{ id: 'a', date: '', title: 'Ceremony' }] } as never
    const atVersion2 = { eyebrow: 'The day', heading: 'Program', venue: 'Manila Cathedral', items: [], layoutPhotos: ['https://example.com/a.jpg'] } as never

    expect(upgradeSectionContent('program', atVersion1, 1)).toEqual({ heading: 'Program', layoutPhotos: [], venuesHeading: 'Getting there' })
    expect(upgradeSectionContent('program', atVersion2, 2)).toEqual({ eyebrow: 'The day', heading: 'Program', layoutPhotos: ['https://example.com/a.jpg'], venuesHeading: 'Getting there' })
    expect(upgradeSectionContent('program', { heading: 'Program', layoutPhotos: [] } as never, 3)).toEqual({ heading: 'Program', layoutPhotos: [], venuesHeading: 'Getting there' })
  })

  it('drops the heading, date and venue a hero saved at version 1, which now come from the event', () => {
    const saved = { eyebrow: 'Together', heading: 'Bea & Carlo', date: 'Sunday, 14 February 2027', venue: 'Manila Cathedral', layoutPhotos: [] } as never

    expect(upgradeSectionContent('hero', saved, 1)).toEqual({ eyebrow: 'Together', layoutPhotos: [] })
  })

  it('drops the heading a countdown saved at version 1, which now comes from the event', () => {
    const saved = { eyebrow: 'Counting down to', heading: 'Bea & Carlo\'s wedding', showSeconds: true, layoutPhotos: [] } as never

    expect(upgradeSectionContent('countdown', saved, 1)).toEqual({ eyebrow: 'Counting down to', showSeconds: true, layoutPhotos: [] })
  })

  it('leaves content at the current version as it is', () => {
    const hero: HeroContent = { eyebrow: 'Together', layoutPhotos: [] }

    expect(upgradeSectionContent('hero', hero, getSectionType('hero').contentVersion)).toBe(hero)
  })

  it('has eyebrow and layout photos in every default content, and a heading where it isn\'t the event\'s name', () => {
    for (const type of ['message', 'about'] as const) {
      const definition = getSectionType(type)
      expect(definition.contentVersion, type).toBe(1)
      expect(definition.defaultContent, type).toMatchObject({ eyebrow: expect.any(String), heading: expect.any(String), layoutPhotos: [] })
      expect(definition.defaultContent, type).not.toHaveProperty('title')
    }
    for (const type of ['hero', 'countdown'] as const) {
      const definition = getSectionType(type)
      expect(definition.contentVersion, type).toBe(2)
      expect(definition.defaultContent, type).toMatchObject({ eyebrow: expect.any(String), layoutPhotos: [] })
      expect(definition.defaultContent, type).not.toHaveProperty('heading')
    }
    expect(getSectionType('hero').defaultContent).not.toHaveProperty('date')
    expect(getSectionType('hero').defaultContent).not.toHaveProperty('venue')
    expect(getSectionType('message').defaultContent.body).toBeTruthy()
  })
})
