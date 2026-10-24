import { describe, expect, it } from 'vitest'
import { colorDistance, contrastRatio, ensureContrast, MIN_CONTRAST, relativeLuminance, tonalShade } from '~/site-theme/color'

describe('ensureContrast', () => {
  it('keeps a colour that is already readable', () => {
    expect(ensureContrast('#1F2F5C', ['#FFFFFF'])).toBe('#1F2F5C')
  })

  it('darkens a light colour until it is readable on a light background', () => {
    const result = ensureContrast('#F6D6DB', ['#FFFFFF'])

    expect(result).not.toBe('#F6D6DB')
    expect(contrastRatio(result, '#FFFFFF')).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })

  it('lightens a dark colour until it is readable on a dark background', () => {
    const result = ensureContrast('#0B1F4D', ['#111827'])

    expect(contrastRatio(result, '#111827')).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })

  it('passes on every background it is given', () => {
    const backgrounds = ['#1A1F2B', '#3A4152']
    const result = ensureContrast('#334155', backgrounds)

    for (const background of backgrounds)
      expect(contrastRatio(result, background)).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })

  it('keeps the hue when adjusting, so the brand colour stays recognisable', () => {
    const result = ensureContrast('#F4B6C2', ['#FFFFFF'])

    // Still pink: more red than green or blue
    const [r, g, b] = [1, 3, 5].map(i => Number.parseInt(result.slice(i, i + 2), 16)) as [number, number, number]
    expect(r).toBeGreaterThan(g)
    expect(r).toBeGreaterThan(b)
  })
})

describe('colorDistance', () => {
  it('is 0 for the same colour', () => {
    expect(colorDistance('#1E2A44', '#1E2A44')).toBe(0)
  })

  it('is small for near-identical colours and large for different ones', () => {
    expect(colorDistance('#1E2A44', '#212D48')).toBeLessThan(0.05)
    expect(colorDistance('#1E2A44', '#E8A598')).toBeGreaterThan(0.3)
  })
})

describe('tonalShade', () => {
  const lightness = 0.27
  const minChroma = 0.06
  const channels = (hex: string) => [1, 3, 5].map(i => Number.parseInt(hex.slice(i, i + 2), 16)) as [number, number, number]

  it('makes every colour equally dark', () => {
    const shades = ['#F6D6DB', '#1F6E6C', '#FFE600', '#B4596A', '#7CC4BE', '#E9DFC8']
      .map(color => relativeLuminance(tonalShade(color, lightness, minChroma)))

    // Same oklch lightness: luminance stays within a narrow band whatever the starting colour
    expect(Math.max(...shades) - Math.min(...shades)).toBeLessThan(0.02)
  })

  it('keeps pale colours\' hue instead of turning them grey-brown', () => {
    const [r, g, b] = channels(tonalShade('#F6D6DB', lightness, minChroma))

    // A deep wine: clearly more red than green or blue
    expect(r).toBeGreaterThan(g + 20)
    expect(r).toBeGreaterThan(b + 20)
  })

  it('keeps greys grey', () => {
    for (const grey of ['#808080', '#F7F7F7', '#050505', '#FFFFFF']) {
      const [r, g, b] = channels(tonalShade(grey, lightness, minChroma))
      expect(Math.max(r, g, b) - Math.min(r, g, b), grey).toBeLessThanOrEqual(2)
    }
  })

  it('is dark enough for white text on any colour', () => {
    for (const color of ['#FFE600', '#00FF85', '#FF00E5', '#F7F7F7', '#3A86FF'])
      expect(contrastRatio('#FFFFFF', tonalShade(color, lightness, minChroma)), color).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })
})
