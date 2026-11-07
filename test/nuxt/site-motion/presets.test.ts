import { describe, expect, it } from 'vitest'
import { introDuration, introPresets, intensityScale, motionVars } from '~/features/site-motion/presets'
import { defaultSiteMotion, motionForEventType, normalizeSiteMotion, pageIntroKeys, pageIntros, sceneKindOf } from '~/features/site-motion/site-motion.type'

describe('site motion', () => {
  it('has no intro and 20 scenes for each kind of event (any first), each with a label and description, in picker order', () => {
    expect(pageIntroKeys).toHaveLength(101)
    expect(new Set(pageIntroKeys).size).toBe(101)
    expect(pageIntroKeys[0]).toBe('none')
    expect(pageIntros.map(choice => choice.key)).toEqual([...pageIntroKeys])
    for (const choice of pageIntros)
      expect(choice.label && choice.description, choice.key).toBeTruthy()
    // Any: no intro, and its 20 scenes
    expect(pageIntros.filter(choice => choice.kind === 'any')).toHaveLength(21)
    expect(sceneKindOf('shutter')).toBe('any')
    expect(sceneKindOf('envelope')).toBe('wedding')
    expect(sceneKindOf('stats')).toBe('business')
    expect(sceneKindOf('none')).toBeUndefined()
  })

  it('defaults to the shutter at bold intensity', () => {
    expect(defaultSiteMotion).toEqual({ intro: 'shutter', intensity: 'bold' })
  })

  it('fills in a missing or unknown motion with the defaults, and reads the intro\'s first name', () => {
    expect(normalizeSiteMotion(undefined)).toEqual(defaultSiteMotion)
    expect(normalizeSiteMotion({ intro: 'wobble', intensity: 'loud' })).toEqual(defaultSiteMotion)
    // The earlier general intros are gone: their websites get the default
    expect(normalizeSiteMotion({ intro: 'curtain', intensity: 'subtle' })).toEqual({ intro: 'shutter', intensity: 'subtle' })
    // A replaced intro loads as its replacement
    expect(normalizeSiteMotion({ intro: 'glow-sticks', intensity: 'bold' })).toEqual({ intro: 'bunting', intensity: 'bold' })
    expect(normalizeSiteMotion({ transition: 'orbit', animation: 'pop', intensity: 'bold' })).toEqual({ intro: 'orbit', intensity: 'bold' })
    // The earlier scroll animations are dropped
    expect(normalizeSiteMotion({ intro: 'stamp', section: 'stack', text: 'letters', media: 'pop', intensity: 'subtle' })).toEqual({ intro: 'stamp', intensity: 'subtle' })
  })

  it('starts each kind of event with an intro that suits it', () => {
    expect(motionForEventType('Wedding')).toEqual({ intro: 'envelope', intensity: 'bold' })
    expect(motionForEventType('Engagement')).toEqual(motionForEventType('Wedding'))
    expect(motionForEventType('Birthday')).toEqual({ intro: 'countdown', intensity: 'bold' })
    expect(motionForEventType('Parties')).toEqual(motionForEventType('Birthday'))
    for (const type of ['Conference', 'Business', 'CompanyEvents'] as const)
      expect(motionForEventType(type), type).toEqual({ intro: 'counter', intensity: 'bold' })
    expect(motionForEventType('Memorial')).toEqual({ intro: 'wreath-seal', intensity: 'bold' })
    expect(motionForEventType('Other')).toEqual(defaultSiteMotion)
  })

  it('has a length for every intro', () => {
    for (const key of pageIntroKeys)
      expect(introPresets[key].duration, key).toBeGreaterThanOrEqual(key === 'none' ? 0 : 1500)
  })

  it('scales the intro\'s length with the intensity, and sets it for the CSS timer', () => {
    expect(intensityScale).toEqual({ subtle: 0.6, normal: 1, bold: 1.3 })
    expect((['subtle', 'normal', 'bold'] as const).map(intensity => introDuration('shutter', intensity))).toEqual([1380, 2300, 2990])
    expect(motionVars({ intro: 'shutter', intensity: 'normal' })).toEqual({ '--motion-intro-duration': '2300ms' })
  })
})
