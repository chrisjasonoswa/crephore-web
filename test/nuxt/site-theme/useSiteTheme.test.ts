import type { SiteTheme } from '~/site-theme/useSiteTheme'
import { describe, expect, it } from 'vitest'
import { contrastRatio, LIGHT_TEXT, MIN_CONTRAST, mixOklch, mixSrgb } from '~/site-theme/color'
import { backgroundPresets, colorPresets } from '~/site-theme/presets'
import { lightBackground, siteThemeVars, siteThemeWarnings } from '~/site-theme/useSiteTheme'

const themeWith = (primaryColor: string, accentColor: string): SiteTheme => ({
  primaryColor,
  accentColor,
  fontPairingKey: 'serif_classic',
  cornerStyle: 'soft',
})

// Colours a host might pick that break naive themes.
const extremeThemes: [string, SiteTheme][] = [
  ['yellow main, white accent', themeWith('#FFE600', '#FFFFFF')],
  ['pale pink main, navy accent', themeWith('#F6D6DB', '#0B1F4D')],
  ['near-white main and accent', themeWith('#F7F7F7', '#FAFAFA')],
  ['near-black main and accent', themeWith('#050505', '#0A0A0A')],
  ['mid grey main, mid grey accent', themeWith('#808080', '#777777')],
  ['same main and accent', themeWith('#B4596A', '#B4596A')],
  ...colorPresets.map(preset => [preset.name, themeWith(preset.primaryColor, preset.accentColor)] as [string, SiteTheme]),
]

describe('siteThemeVars contrast', () => {
  it.each(extremeThemes)('keeps every hex text colour readable on its background (%s)', (_, theme) => {
    const vars = siteThemeVars(theme)
    const primary = vars['--site-primary']!
    const accent = vars['--site-accent']!
    // Hex equivalents of the backgrounds, mirroring siteThemeVars
    const soft = mixOklch(primary, LIGHT_TEXT, 0.07)
    const primary900 = vars['--site-primary-900']!

    const pairs: [string, string, string][] = [
      ['on-primary on primary', vars['--site-on-primary']!, primary],
      ['on-primary-muted on primary', vars['--site-on-primary-muted']!, primary],
      ['on-accent on accent', vars['--site-on-accent']!, accent],
      ['on-accent-muted on accent', vars['--site-on-accent-muted']!, accent],
      ['on-dark on primary-900 (photo fallback)', vars['--site-on-dark']!, primary900],
      ['primary-text on light background', vars['--site-primary-text']!, soft],
      ['accent-on-photo on primary-900', vars['--site-accent-on-photo']!, primary900],
      ['muted on light background', vars['--site-muted']!, soft],
    ]

    for (const [name, text, background] of pairs)
      expect(contrastRatio(text, background), name).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })

  it.each(extremeThemes)('keeps the accent readable on the brightest photo under the overlay (%s)', (_, theme) => {
    const vars = siteThemeVars(theme)
    const primary900 = vars['--site-primary-900']!
    const strength = Number(/(\d+)%/.exec(vars['--site-photo-overlay']!)![1])
    const brightestPhoto = mixSrgb(primary900, LIGHT_TEXT, strength / 100)

    expect(contrastRatio(vars['--site-accent-on-photo']!, brightestPhoto)).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })

  it('uses the chosen colours unchanged when they are already readable', () => {
    const vars = siteThemeVars(themeWith('#1F2F5C', '#C9A54C'))

    expect(vars['--site-primary-text']).toBe('#1F2F5C')
  })
})

describe('siteThemeVars buttons', () => {
  // Which brand colour each background's button uses: always the other one.
  const buttonColour = {
    light: 'primary',
    photo: 'accent',
    primary: 'accent',
    accent: 'primary',
  } as const

  const backgroundHexes = (vars: Record<string, string>): Record<keyof typeof buttonColour, string[]> => {
    const primary900 = vars['--site-primary-900']!
    const strength = Number(/(\d+)%/.exec(vars['--site-photo-overlay']!)![1])
    return {
      light: [mixOklch(vars['--site-primary']!, LIGHT_TEXT, 0.07)],
      photo: [primary900, mixSrgb(primary900, LIGHT_TEXT, strength / 100)],
      primary: [vars['--site-primary']!],
      accent: [vars['--site-accent']!],
    }
  }

  it.each(extremeThemes)('makes every button stand out from its background, with readable text (%s)', (_, theme) => {
    const vars = siteThemeVars(theme)
    const backgrounds = backgroundHexes(vars)

    for (const name of Object.keys(buttonColour) as (keyof typeof buttonColour)[]) {
      const button = vars[`--site-button-${name}`]!
      for (const hex of backgrounds[name])
        expect(contrastRatio(button, hex), `${name} button vs background`).toBeGreaterThanOrEqual(3)
      expect(contrastRatio(vars[`--site-on-button-${name}`]!, button), `${name} button text`).toBeGreaterThanOrEqual(MIN_CONTRAST)
    }
  })

  it('uses the other brand colour unchanged when it already stands out', () => {
    // Pale main colour, dark accent: the opposite of most presets
    const vars = siteThemeVars(themeWith('#F6D6DB', '#1F2F5C'))

    expect(vars['--site-button-primary']).toBe('#1F2F5C')
    expect(vars['--site-button-accent']).toBe('#F6D6DB')
  })

  it('adjusts the other brand colour, keeping its hue, when it would blend in', () => {
    // Same main and accent colour: the main-colour button on the accent background would be invisible
    const vars = siteThemeVars(themeWith('#1F6E6C', '#1F6E6C'))
    const button = vars['--site-button-accent']!
    const [r, g, b] = [1, 3, 5].map(i => Number.parseInt(button.slice(i, i + 2), 16)) as [number, number, number]

    expect(button).not.toBe('#1F6E6C')
    // Still teal: more green and blue than red
    expect(g).toBeGreaterThan(r)
    expect(b).toBeGreaterThan(r)
  })
})

describe('siteThemeWarnings', () => {
  it('has no warnings for the presets', () => {
    for (const preset of colorPresets)
      expect(siteThemeWarnings(themeWith(preset.primaryColor, preset.accentColor)), preset.name).toEqual([])
  })

  it('warns when the accent is very close to the main colour', () => {
    expect(siteThemeWarnings(themeWith('#B4596A', '#B85C6D')).join(' ')).toContain('very close to the main colour')
  })

  it('warns when the main colour is very light', () => {
    expect(siteThemeWarnings(themeWith('#F7F7F7', '#1F2F5C')).join(' ')).toContain('main colour is very light')
  })

  it('does not warn about dark colours, since buttons adjust themselves', () => {
    expect(siteThemeWarnings(themeWith('#1F2F5C', '#050505'))).toEqual([])
  })
})

describe('siteThemeVars light background', () => {
  it('uses plain white by default', () => {
    expect(siteThemeVars(themeWith('#1E2A44', '#E8A598'))['--site-bg']).toBe('#FFFFFF')
  })

  it.each(backgroundPresets.filter(preset => preset.color))('uses the $name preset exactly as given', ({ color }) => {
    expect(siteThemeVars({ ...themeWith('#1E2A44', '#E8A598'), backgroundColor: color! })['--site-bg']).toBe(color)
  })

  it('lightens a colour that is too dark for a page background, keeping its hue', () => {
    const background = lightBackground({ backgroundColor: '#8B6F4E' })

    expect(contrastRatio('#111827', background)).toBeGreaterThan(12)
    // Still warm (red channel above blue), not grey
    expect(Number.parseInt(background.slice(1, 3), 16)).toBeGreaterThan(Number.parseInt(background.slice(5, 7), 16))
  })

  // Every text colour on the light background, and its button, checked against the chosen background
  it.each([
    ...backgroundPresets.filter(preset => preset.color).map(preset => [preset.name, preset.color!] as const),
    ['a dark brown (lightened)', '#5A3E2B'] as const,
  ])('keeps text and buttons readable on the %s background', (_, backgroundColor) => {
    for (const [name, theme] of extremeThemes) {
      const vars = siteThemeVars({ ...theme, backgroundColor })
      const bg = vars['--site-bg']!

      expect(contrastRatio(vars['--site-primary-text']!, bg), `${name}: primary-text`).toBeGreaterThanOrEqual(MIN_CONTRAST)
      expect(contrastRatio(vars['--site-muted']!, bg), `${name}: muted`).toBeGreaterThanOrEqual(MIN_CONTRAST)
      expect(contrastRatio(vars['--site-button-light']!, bg), `${name}: light button`).toBeGreaterThanOrEqual(3)
      expect(contrastRatio(vars['--site-on-button-light']!, vars['--site-button-light']!), `${name}: light button text`).toBeGreaterThanOrEqual(MIN_CONTRAST)
    }
  })

  it('mixes borders with the chosen background', () => {
    expect(siteThemeVars({ ...themeWith('#1E2A44', '#E8A598'), backgroundColor: '#F7F1E7' })['--site-border']).toContain('var(--site-bg)')
  })

  it('warns when the accent is very close to the background', () => {
    expect(siteThemeWarnings({ ...themeWith('#1E2A44', '#F5EFE5'), backgroundColor: '#F7F1E7' }))
      .toContain('The accent is very close to the background, so accent sections will barely stand out from the page.')
  })
})
