import type { SiteTheme } from '~/site-theme/useSiteTheme'
import { describe, expect, it } from 'vitest'
import { colorDistance, contrastRatio, LIGHT_TEXT, MIN_CONTRAST, mixOklch, mixSrgb, relativeLuminance, textContrastFloor } from '~/site-theme/color'
import { fontPairingGroups, fontPairings, siteFontFamilies } from '~/site-theme/fontPairings'
import { eventKinds } from '~/site-theme/eventKinds'
import { backgroundPresets, colorPresets, defaultColorPreset } from '~/site-theme/presets'
import { lightBackground, secondaryFor, siteThemeVars, siteThemeWarnings } from '~/site-theme/useSiteTheme'

const themeWith = (primaryColor: string, secondaryColor?: string, accentColor?: string): SiteTheme => ({
  primaryColor,
  ...(secondaryColor && { secondaryColor }),
  ...(accentColor && { accentColor }),
  fontPairingKey: 'serif_classic',
  cornerStyle: 'soft',
  motion: { intro: 'shutter', intensity: 'normal' },
})

// A button or highlight stands out from its background: 3:1, or clearly a different colour (see siteThemeVars)
const standsOut = (color: string, background: string) => contrastRatio(color, background) >= 3 || colorDistance(color, background) >= 0.2

// Colours a host might pick that break naive themes.
const extremeThemes: [string, SiteTheme][] = [
  ['yellow primary, white secondary', themeWith('#FFE600', '#FFFFFF')],
  ['pale pink primary, navy secondary', themeWith('#F6D6DB', '#0B1F4D')],
  ['near-white primary and secondary', themeWith('#F7F7F7', '#FAFAFA')],
  ['near-black primary and secondary', themeWith('#050505', '#0A0A0A')],
  ['mid grey primary, mid grey secondary', themeWith('#808080', '#777777')],
  ['same primary and secondary', themeWith('#B4596A', '#B4596A')],
  ['lemon primary, vivid pink secondary', themeWith('#FFF07A', '#F0428C', '#14B8A6')],
  ['yellow primary only', themeWith('#FFE600')],
  ['near-white primary only', themeWith('#F7F7F7')],
  ['near-black primary only', themeWith('#050505')],
  ['white accent', themeWith('#1E2A44', '#E8A598', '#FFFFFF')],
  ['near-black accent', themeWith('#1E2A44', '#E8A598', '#0A0A0A')],
  ['accent the same as the primary', themeWith('#B4596A', '#F6D6DB', '#B4596A')],
  ...colorPresets.map(preset => [preset.name, themeWith(preset.primaryColor, preset.secondaryColor, preset.accentColor)] as [string, SiteTheme]),
]

describe('siteThemeVars contrast', () => {
  it.each(extremeThemes)('keeps every hex text colour readable on its background (%s)', (_, theme) => {
    const vars = siteThemeVars(theme)
    const primary = vars['--site-primary']!
    const secondary = vars['--site-secondary']!
    // Hex equivalents of the backgrounds, mirroring siteThemeVars
    const soft = mixOklch(primary, LIGHT_TEXT, 0.07)
    const primary900 = vars['--site-primary-900']!

    // Text on a colour is white once white reaches PREFER_WHITE_FROM (its muted shade fades only as far as that allows),
    // so its floor follows the text colour chosen
    const onPrimaryFloor = textContrastFloor(vars['--site-on-primary']!)
    const onSecondaryFloor = textContrastFloor(vars['--site-on-secondary']!)
    const floors: Record<string, number> = {
      'on-primary on primary': onPrimaryFloor,
      'on-primary-muted on primary': onPrimaryFloor,
      'on-secondary on secondary': onSecondaryFloor,
      'on-secondary-muted on secondary': onSecondaryFloor,
    }
    const pairs: [string, string, string][] = [
      ['on-primary on primary', vars['--site-on-primary']!, primary],
      ['on-primary-muted on primary', vars['--site-on-primary-muted']!, primary],
      ['on-secondary on secondary', vars['--site-on-secondary']!, secondary],
      ['on-secondary-muted on secondary', vars['--site-on-secondary-muted']!, secondary],
      ['on-dark on primary-900 (photo fallback)', vars['--site-on-dark']!, primary900],
      ['primary-text on light background', vars['--site-primary-text']!, soft],
      ['secondary-on-photo on primary-900', vars['--site-secondary-on-photo']!, primary900],
      ['muted on light background', vars['--site-muted']!, soft],
      ['secondary-text on light background', vars['--site-secondary-text']!, soft],
      ['accent-text on light background', vars['--site-accent-text']!, soft],
      ['secondary-text on the soft secondary tint', vars['--site-secondary-text']!, mixOklch(secondary, LIGHT_TEXT, 0.14)],
      ['secondary-on-primary on primary', vars['--site-secondary-on-primary']!, primary],
      ['primary-on-secondary on secondary', vars['--site-primary-on-secondary']!, secondary],
    ]

    for (const [name, text, background] of pairs)
      expect(contrastRatio(text, background), name).toBeGreaterThanOrEqual(floors[name] ?? MIN_CONTRAST)
  })

  it.each(extremeThemes)('keeps the secondary on a photo light and apart from its brightest spot under the overlay (%s)', (_, theme) => {
    const vars = siteThemeVars(theme)
    const primary900 = vars['--site-primary-900']!
    const strength = Number(/(\d+)%/.exec(vars['--site-photo-overlay']!)![1])
    const brightestPhoto = mixSrgb(primary900, LIGHT_TEXT, strength / 100)
    const onPhoto = vars['--site-secondary-on-photo']!

    expect(standsOut(onPhoto, brightestPhoto)).toBe(true)
    // Never darker than picked: dark text would vanish in the photo's dark parts
    expect(relativeLuminance(onPhoto)).toBeGreaterThanOrEqual(relativeLuminance(vars['--site-secondary']!) - 0.001)
  })

  it('keeps a vivid secondary as picked on a photo when it reads on the overlay', () => {
    // Flamingo pink on a lemon theme's overlay: 4.2:1 on its dark, a clearly different colour from its brightest spot
    expect(siteThemeVars(themeWith('#FFF07A', '#F0428C', '#14B8A6'))['--site-secondary-on-photo']).toBe('#F0428C')
    // A navy secondary on a navy theme's photo is lightened, not turned black
    const navy = siteThemeVars(themeWith('#1E2A44', '#1E2A44'))['--site-secondary-on-photo']!
    expect(relativeLuminance(navy)).toBeGreaterThan(relativeLuminance('#1E2A44'))
  })

  it('keeps brand colours as picked from 3:1, and adjusts them below it', () => {
    expect(MIN_CONTRAST).toBe(3)
    // Lemon on flamingo pink is about 3.1:1
    expect(siteThemeVars(themeWith('#F0428C', '#FFF07A', '#14B8A6'))['--site-secondary-on-primary']).toBe('#FFF07A')
    // Sunshine on tangerine is about 2.1:1
    expect(siteThemeVars(themeWith('#F26B1D', '#FFD23F'))['--site-secondary-on-primary']).not.toBe('#FFD23F')
  })

  it('uses the chosen colours unchanged when they are already readable', () => {
    const vars = siteThemeVars(themeWith('#1F2F5C', '#C9A54C'))

    expect(vars['--site-primary-text']).toBe('#1F2F5C')
  })
})

describe('siteThemeVars secondary', () => {
  it('uses the host\'s secondary as given', () => {
    expect(siteThemeVars(themeWith('#1E2A44', '#E8A598'))['--site-secondary']).toBe('#E8A598')
  })

  it('without one, makes a soft tint of a dark primary and a deep shade of a light one', () => {
    const tint = secondaryFor({ primaryColor: '#1E2A44' })
    const shade = secondaryFor({ primaryColor: '#F6D6DB' })

    expect(siteThemeVars(themeWith('#1E2A44'))['--site-secondary']).toBe(tint)
    expect(contrastRatio(tint, '#1E2A44')).toBeGreaterThan(4)
    expect(contrastRatio(tint, LIGHT_TEXT)).toBeLessThan(2)
    expect(contrastRatio(shade, '#F6D6DB')).toBeGreaterThan(4)
  })
})

describe('siteThemeVars buttons', () => {
  // Without an accent, which brand colour each background's button uses: always the other one.
  const buttonColour = {
    light: 'primary',
    photo: 'secondary',
    primary: 'secondary',
    secondary: 'primary',
  } as const

  const backgroundHexes = (vars: Record<string, string>): Record<keyof typeof buttonColour, string[]> => {
    const primary900 = vars['--site-primary-900']!
    const strength = Number(/(\d+)%/.exec(vars['--site-photo-overlay']!)![1])
    return {
      light: [mixOklch(vars['--site-primary']!, LIGHT_TEXT, 0.07)],
      photo: [primary900, mixSrgb(primary900, LIGHT_TEXT, strength / 100)],
      primary: [vars['--site-primary']!],
      secondary: [vars['--site-secondary']!],
    }
  }

  it.each(extremeThemes)('makes every button and accent stand out from its background, with readable text (%s)', (_, theme) => {
    const vars = siteThemeVars(theme)
    const backgrounds = backgroundHexes(vars)

    for (const name of Object.keys(buttonColour) as (keyof typeof buttonColour)[]) {
      const button = vars[`--site-button-${name}`]!
      const accent = vars[`--site-accent-${name}`]!
      // 3:1, or clearly a different colour
      for (const hex of backgrounds[name]) {
        expect(standsOut(button, hex), `${name} button vs background`).toBe(true)
        if (theme.accentColor)
          expect(standsOut(accent, hex), `${name} accent vs background`).toBe(true)
      }
      const text = vars[`--site-on-button-${name}`]!
      expect(contrastRatio(text, button), `${name} button text`).toBeGreaterThanOrEqual(textContrastFloor(text))
    }
  })

  it('makes every button the accent when there is one', () => {
    const vars = siteThemeVars(themeWith('#1E2A44', '#F3EBDD', '#E8775B'))

    for (const name of ['light', 'primary', 'secondary']) {
      expect(vars[`--site-button-${name}`], name).toBe('#E8775B')
      expect(vars[`--site-accent-${name}`], name).toBe('#E8775B')
    }
    // Over the brightest part of a photo under the overlay it blends in, so it's adjusted
    expect(vars['--site-button-photo']).not.toBe('#E8775B')
  })

  it('keeps a button colour that differs in hue though not in lightness, and adjusts a near-identical one', () => {
    // Teal on a flamingo pink is only 1.44:1, but clearly a different colour
    const flamingo = siteThemeVars(themeWith('#F0428C', '#FFF07A', '#14B8A6'))
    expect(flamingo['--site-button-primary']).toBe('#14B8A6')
    expect(flamingo['--site-accent-primary']).toBe('#14B8A6')
    // The button's text is still checked against it
    const text = flamingo['--site-on-button-primary']!
    expect(contrastRatio(text, '#14B8A6')).toBeGreaterThanOrEqual(textContrastFloor(text))

    // A slightly lighter pink on the pink is adjusted to 3:1
    const nearPink = siteThemeVars(themeWith('#F0428C', '#FFF07A', '#F25A98'))
    expect(nearPink['--site-button-primary']).not.toBe('#F25A98')
    expect(contrastRatio(nearPink['--site-button-primary']!, '#F0428C')).toBeGreaterThanOrEqual(3)
  })

  it('without an accent, uses the other brand colour, as it reads there, for the small highlights', () => {
    const vars = siteThemeVars(themeWith('#1E2A44', '#E8A598'))

    expect(vars['--site-accent']).toBe('#E8A598')
    // The intros' third colour falls back to the primary instead, so it never matches the secondary
    expect(vars['--site-accent-else-primary']).toBe('#1E2A44')
    expect(siteThemeVars(themeWith('#1E2A44', '#E8A598', '#C9A54C'))['--site-accent-else-primary']).toBe('#C9A54C')
    expect(vars['--site-accent-light']).toBe('var(--site-secondary-text)')
    expect(vars['--site-accent-primary']).toBe('var(--site-secondary-on-primary)')
    expect(vars['--site-accent-secondary']).toBe('var(--site-primary-on-secondary)')
    expect(vars['--site-accent-photo']).toBe('var(--site-secondary-on-photo)')
  })

  it('uses the other brand colour unchanged when it already stands out', () => {
    // Pale primary, dark secondary: the opposite of most presets
    const vars = siteThemeVars(themeWith('#F6D6DB', '#1F2F5C'))

    expect(vars['--site-button-primary']).toBe('#1F2F5C')
    expect(vars['--site-button-secondary']).toBe('#F6D6DB')
  })

  it('adjusts the other brand colour, keeping its hue, when it would blend in', () => {
    // Same primary and secondary: the primary button on the secondary background would be invisible
    const vars = siteThemeVars(themeWith('#1F6E6C', '#1F6E6C'))
    const button = vars['--site-button-secondary']!
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
      expect(siteThemeWarnings(themeWith(preset.primaryColor, preset.secondaryColor, preset.accentColor)), preset.name).toEqual([])
  })

  it('warns when the secondary is very close to the primary, but not about one made from the primary', () => {
    expect(siteThemeWarnings(themeWith('#B4596A', '#B85C6D')).join(' ')).toContain('secondary colour is very close to the primary')
    expect(siteThemeWarnings(themeWith('#B4596A'))).toEqual([])
  })

  it('warns when the accent is very close to the primary', () => {
    expect(siteThemeWarnings(themeWith('#1E2A44', '#E8A598', '#1F2B46')).join(' ')).toContain('accent is very close to the primary')
  })

  it('warns when the primary is very light', () => {
    expect(siteThemeWarnings(themeWith('#F7F7F7', '#1F2F5C')).join(' ')).toContain('primary colour is very light')
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
      expect(standsOut(vars['--site-button-light']!, bg), `${name}: light button`).toBe(true)
      const buttonText = vars['--site-on-button-light']!
      expect(contrastRatio(buttonText, vars['--site-button-light']!), `${name}: light button text`).toBeGreaterThanOrEqual(textContrastFloor(buttonText))
    }
  })

  it('mixes borders with the chosen background', () => {
    expect(siteThemeVars({ ...themeWith('#1E2A44', '#E8A598'), backgroundColor: '#F7F1E7' })['--site-border']).toContain('var(--site-bg)')
  })

  it('warns when the secondary is very close to the background', () => {
    expect(siteThemeWarnings({ ...themeWith('#1E2A44', '#F5EFE5'), backgroundColor: '#F7F1E7' }))
      .toContain('The secondary colour is very close to the background, so secondary sections will barely stand out from the page.')
  })
})

describe('colour presets', () => {
  it('has six per kind of event: two with the primary only, two with a secondary, two with all three', () => {
    for (const kind of eventKinds) {
      const presets = colorPresets.filter(preset => preset.kind === kind)
      const colours = presets.map(preset => [preset.primaryColor, preset.secondaryColor, preset.accentColor].filter(Boolean).length)
      expect(colours, kind).toEqual([1, 1, 2, 2, 3, 3])
    }
    expect(new Set(colorPresets.map(preset => preset.name)).size).toBe(colorPresets.length)
  })

  it('starts each kind of event with its first two-colour preset', () => {
    expect(defaultColorPreset('any').name).toBe('Midnight & Rose')
    for (const kind of eventKinds) {
      const preset = defaultColorPreset(kind)
      expect([preset.kind, !!preset.secondaryColor, !!preset.accentColor], kind).toEqual([kind, true, false])
    }
  })
})

describe('siteThemeVars fonts', () => {
  it('uses the pairing\'s heading and body fonts', () => {
    const vars = siteThemeVars({ ...themeWith('#1E2A44', '#E8A598'), fontPairingKey: 'script' })

    expect(vars['--site-font-heading']).toBe('"Great Vibes", cursive')
    expect(vars['--site-font-body']).toBe('"Raleway", system-ui, sans-serif')
  })

  it('keeps italic heading text upright for a script, and slanted for the others', () => {
    for (const key of ['script', 'luxurious_script'])
      expect(siteThemeVars({ ...themeWith('#1E2A44', '#E8A598'), fontPairingKey: key })['--site-font-heading-italic'], key).toBe('normal')
    for (const pairing of fontPairings.filter(pairing => !pairing.heading.script))
      expect(siteThemeVars({ ...themeWith('#1E2A44', '#E8A598'), fontPairingKey: pairing.key })['--site-font-heading-italic'], pairing.key).toBe('italic')
  })

  it('fades a photo into the primary itself when light text reads on it, else into its dark shade', () => {
    const dark = siteThemeVars(themeWith('#1F3A2E', '#E8D9B5'))
    expect(dark['--site-photo-edge']).toBe(dark['--site-primary'])

    // Blush: light text wouldn't read on it
    const pale = siteThemeVars(themeWith('#F4C7D0', '#7A4E5A'))
    expect(pale['--site-photo-edge']).toBe(pale['--site-primary-900'])
  })

  it('keeps a script heading in its own case, and lets the others be set in capitals', () => {
    for (const pairing of fontPairings)
      expect(siteThemeVars({ ...themeWith('#1E2A44', '#E8A598'), fontPairingKey: pairing.key })['--site-font-heading-case'], pairing.key).toBe(pairing.heading.script ? 'none' : 'uppercase')
  })

  it('registers the Fontshare families with their provider, the rest from Google Fonts', () => {
    const byName = Object.fromEntries(siteFontFamilies.map(font => [font.name, font]))

    expect(byName.Boska).toMatchObject({ provider: 'fontshare', weights: [300], styles: ['normal', 'italic'] })
    expect(byName.Switzer).toMatchObject({ provider: 'fontshare', weights: [400, 500, 600] })
    expect(byName.Inter).not.toHaveProperty('provider')
  })

  it('registers every pairing\'s fonts so they load on event websites', () => {
    const names = siteFontFamilies.map(font => font.name)

    expect(names).toEqual(expect.arrayContaining(['Great Vibes', 'Raleway', 'Luxurious Script', 'Jost']))
    expect(new Set(fontPairings.map(pairing => pairing.key)).size).toBe(fontPairings.length)
  })
})

describe('font pairings', () => {
  it('offers about fifty pairings, each in a group, with unique keys', () => {
    expect(fontPairings.length).toBeGreaterThanOrEqual(45)
    expect(new Set(fontPairings.map(pairing => pairing.key)).size).toBe(fontPairings.length)
    for (const group of fontPairingGroups)
      expect(fontPairings.filter(pairing => pairing.group === group.key).length, group.key).toBeGreaterThanOrEqual(4)
    expect(fontPairings.every(pairing => fontPairingGroups.some(group => group.key === pairing.group))).toBe(true)
  })

  it('keeps the first pairing, the default for new websites', () => {
    expect(fontPairings[0]!.key).toBe('serif_classic')
  })

  it('registers each family once, with every weight and style its pairings use', () => {
    const names = siteFontFamilies.map(font => font.name)
    expect(new Set(names).size).toBe(names.length)

    // Montserrat is a heading (500–700) in one pairing and the body (400–600) in others
    expect(siteFontFamilies.find(font => font.name === 'Montserrat')).toMatchObject({ weights: [400, 500, 600, 700], styles: ['normal'] })
    // Lora is an italic heading in one pairing and the body in another
    expect(siteFontFamilies.find(font => font.name === 'Lora')!.styles).toEqual(['normal', 'italic'])
  })

  it('keeps headings to the weights sections use (400), with a body that has semibold or bold', () => {
    for (const pairing of fontPairings) {
      expect(pairing.heading.weights, pairing.key).toContain(pairing.heading.weights.includes(400) ? 400 : pairing.heading.weights[0])
      expect(pairing.body.weights, pairing.key).toContain(400)
      expect(pairing.body.weights.some(weight => weight >= 600), pairing.key).toBe(true)
    }
  })
})
