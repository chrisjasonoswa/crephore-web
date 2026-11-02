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

  it('gives program content saved at version 1 its layout photos', () => {
    const saved = { heading: 'Program', items: [] } as never

    expect(upgradeSectionContent('program', saved, 1)).toEqual({ heading: 'Program', items: [], layoutPhotos: [] })
  })

  it('leaves content at the current version as it is', () => {
    const hero: HeroContent = { heading: 'Bea & Carlo', layoutPhotos: [] }

    expect(upgradeSectionContent('hero', hero, getSectionType('hero').contentVersion)).toBe(hero)
  })

  it('starts every type at content version 1, with eyebrow, heading and layout photos in its default content', () => {
    for (const type of ['hero', 'countdown', 'message', 'about'] as const) {
      const definition = getSectionType(type)
      expect(definition.contentVersion, type).toBe(1)
      expect(definition.defaultContent, type).toMatchObject({ eyebrow: expect.any(String), heading: expect.any(String), layoutPhotos: [] })
      expect(definition.defaultContent, type).not.toHaveProperty('title')
    }
    expect(getSectionType('message').defaultContent.body).toBeTruthy()
  })
})
