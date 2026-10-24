import { describe, expect, it } from 'vitest'
import { resolveBackground, backgroundStyles } from '~/features/sections/section.background'
import { sectionBackgrounds } from '~/features/sections/section.type'

describe('backgroundStyles', () => {
  it('defines styles for every background', () => {
    expect(Object.keys(backgroundStyles).sort()).toEqual([...sectionBackgrounds].sort())
  })

  it('only uses site-theme variables, never the Crephore app theme', () => {
    const appThemeClass = /\b(?:bg|text|border)-(?:primary|secondary|accent|muted|foreground|background|card)\b/

    for (const styles of Object.values(backgroundStyles)) {
      for (const classes of Object.values(styles)) {
        expect(classes).not.toMatch(appThemeClass)
        expect(classes).toContain('(--site-')
      }
    }
  })
})

describe('resolveBackground', () => {
  it('uses the primary background for a photo background without a photo', () => {
    expect(resolveBackground('photo')).toBe('primary')
    expect(resolveBackground('photo', '')).toBe('primary')
  })

  it('keeps the photo background when there is a photo', () => {
    expect(resolveBackground('photo', 'https://example.com/couple.jpg')).toBe('photo')
  })

  it('keeps every other background as it is', () => {
    for (const background of sectionBackgrounds.filter(s => s !== 'photo'))
      expect(resolveBackground(background)).toBe(background)
  })
})
