import { describe, expect, it } from 'vitest'
import { changeSectionLayout, createDefaultSection, getSectionLayout, getSectionType, sectionRegistry } from '~/features/sections/section.registry'
import { inPickerOrder, sectionBackgrounds } from '~/features/sections/section.type'

describe('section registry', () => {
  it('registers the eleven hero layouts in picker order', () => {
    expect(getSectionType('hero').layouts.map(layout => layout.key)).toEqual([
      'fullscreen',
      'split',
      'arch',
      'editorial',
      'overlay-card',
      'collage',
      'banner',
      'filmstrip',
      'polaroid',
      'framed',
      'offset-frame',
    ])
  })

  it('registers the ten countdown layouts in picker order', () => {
    expect(getSectionType('countdown').layouts.map(layout => layout.key)).toEqual([
      'boxes',
      'minimal',
      'photo',
      'split',
      'rings',
      'flip',
      'sentence',
      'days-only',
      'calendar',
      'strip',
    ])
  })

  it('registers the eleven message layouts in picker order, each with one photo', () => {
    const layouts = getSectionType('message').layouts
    expect(layouts.map(layout => layout.key)).toEqual([
      'stacked',
      'split',
      'side-photo',
      'polaroid',
      'portrait',
      'card',
      'overlap',
      'postcard',
      'editorial',
      'inline',
      'photo-middle',
    ])
    expect(layouts.every(layout => layout.layoutPhotoCount === 1)).toBe(true)
  })

  it('starts the message\'s paper layouts on the accent, and the others on light', () => {
    for (const key of ['polaroid', 'card', 'postcard'])
      expect(getSectionLayout('message', key)!.backgrounds, key).toEqual(['accent', 'light', 'primary', 'photo'])
    expect(getSectionLayout('message', 'stacked')!.backgrounds).toEqual(['light', 'primary', 'accent', 'photo'])
  })

  it('shows the backgrounds in one order in pickers, whatever the layout starts on', () => {
    expect(inPickerOrder(getSectionLayout('message', 'card')!.backgrounds)).toEqual(['light', 'primary', 'accent', 'photo'])
    expect(inPickerOrder(getSectionLayout('countdown', 'strip')!.backgrounds)).toEqual(['light', 'primary', 'accent', 'photo'])
    expect(inPickerOrder(getSectionLayout('hero', 'fullscreen')!.backgrounds)).toEqual(['light', 'primary', 'accent', 'photo'])
    expect(inPickerOrder(getSectionLayout('hero', 'overlay-card')!.backgrounds)).toEqual(['light', 'primary', 'accent', 'photo'])
  })

  it('puts the countdown over a photo on the photo background only, and the strip on a colour band by default', () => {
    expect(getSectionLayout('countdown', 'photo')!.backgrounds).toEqual(['photo', 'light', 'primary', 'accent'])
    expect(getSectionLayout('countdown', 'strip')!.backgrounds).toEqual(['primary', 'accent', 'light', 'photo'])
    expect(getSectionLayout('countdown', 'boxes')!.backgrounds).toEqual(['light', 'primary', 'accent', 'photo'])
  })

  it('creates a countdown with its first layout and seconds on, without a target date', () => {
    const section = createDefaultSection('countdown')

    expect(section).toMatchObject({ type: 'countdown', layout: 'boxes', background: 'light', options: { textAlign: 'center' } })
    expect(section.content.showSeconds).toBe(true)
    // The date always comes from the event
    expect(Object.keys(section.content)).not.toContain('startsAt')
  })

  it('finds a layout by section type and key', () => {
    const layout = getSectionLayout('hero', 'overlay-card')

    expect(layout?.name).toBe('Floating card')
    expect(layout?.component).toBeTruthy()
  })

  it('returns undefined for an unknown layout', () => {
    expect(getSectionLayout('hero', 'does-not-exist')).toBeUndefined()
  })

  it('gives every layout its own component, a unique key and a description', () => {
    for (const definition of Object.values(sectionRegistry)) {
      const keys = definition.layouts.map(layout => layout.key)
      const components = definition.layouts.map(layout => layout.component)
      expect(new Set(keys).size).toBe(keys.length)
      expect(new Set(components).size).toBe(components.length)
      for (const layout of definition.layouts)
        expect(layout.description).toBeTruthy()
    }
  })

  it('gives every layout valid backgrounds and options whose defaults are among their choices', () => {
    for (const layout of Object.values(sectionRegistry).flatMap(definition => definition.layouts)) {
      expect(layout.backgrounds.length, layout.key).toBeGreaterThan(0)
      for (const background of layout.backgrounds)
        expect(sectionBackgrounds).toContain(background)

      expect(layout.options.length, layout.key).toBeGreaterThan(0)
      for (const option of layout.options)
        expect(option.choices.map(choice => choice.value), `${layout.key}.${option.key}`).toContain(option.default)
    }
  })

  it('starts only Full and Floating card on the photo; layouts with their own photos never do', () => {
    for (const definition of Object.values(sectionRegistry)) {
      for (const layout of definition.layouts) {
        if (layout.layoutPhotoCount > 0)
          expect(layout.backgrounds[0], `${definition.type}/${layout.key}`).not.toBe('photo')
      }
    }
    expect(getSectionType('hero').layouts.filter(layout => layout.backgrounds[0] === 'photo').map(layout => layout.key))
      .toEqual(['fullscreen', 'overlay-card'])
  })

  it('offers all four backgrounds on every layout', () => {
    for (const type of Object.values(sectionRegistry)) {
      for (const layout of type.layouts)
        expect([...layout.backgrounds].sort(), `${type.type}/${layout.key}`).toEqual(['accent', 'light', 'photo', 'primary'])
    }
  })

  it('starts Full and Floating card on the photo, and the rest on a colour first', () => {
    expect(getSectionLayout('hero', 'fullscreen')!.backgrounds).toEqual(['photo', 'light', 'primary', 'accent'])
    expect(getSectionLayout('hero', 'overlay-card')!.backgrounds).toEqual(['photo', 'light', 'primary', 'accent'])
    expect(getSectionLayout('hero', 'collage')!.backgrounds).toEqual(['light', 'primary', 'accent', 'photo'])
  })

  it('declares one layout photo for the countdown split and none for the other countdown layouts', () => {
    expect(getSectionType('countdown').layouts.filter(layout => layout.layoutPhotoCount > 0).map(layout => [layout.key, layout.layoutPhotoCount]))
      .toEqual([['split', 1]])
  })

  it('offers the (optional) background photo on every layout', () => {
    for (const type of Object.values(sectionRegistry)) {
      for (const layout of type.layouts)
        expect(layout.backgrounds, `${type.type}/${layout.key}`).toContain('photo')
    }
  })
})

describe('createDefaultSection', () => {
  it('uses the first layout with its default background and options, and the default content', () => {
    const hero = getSectionType('hero')

    expect(createDefaultSection('hero')).toEqual({
      type: 'hero',
      layout: 'fullscreen',
      options: { textPosition: 'center' },
      background: 'photo',
      content: hero.defaultContent,
    })
  })

  it('copies the default content so editing a section never changes the registry', () => {
    const section = createDefaultSection('hero')

    section.content.heading = 'Changed'
    section.content.layoutPhotos.push('https://example.com/photo.jpg')

    expect(getSectionType('hero').defaultContent.heading).not.toBe('Changed')
    expect(getSectionType('hero').defaultContent.layoutPhotos).toEqual([])
  })
})

describe('changeSectionLayout', () => {
  it('resets the options to the new layout\'s defaults', () => {
    const section = changeSectionLayout(createDefaultSection('hero'), 'split')

    expect(section.layout).toBe('split')
    expect(section.options).toEqual({ photoSide: 'right', textPosition: 'left' })
  })

  it('moves a default background to the new layout\'s default', () => {
    // A new hero starts on Full, on the photo: layouts with their own photos start on light instead
    const full = createDefaultSection('hero')

    expect(changeSectionLayout(full, 'arch').background).toBe('light')
    expect(changeSectionLayout(full, 'split').background).toBe('light')
    expect(changeSectionLayout(full, 'overlay-card').background).toBe('photo')
    expect(changeSectionLayout({ ...full, layout: 'split', background: 'light' }, 'fullscreen').background).toBe('photo')
    // The message's paper layouts start on the accent, the others on light
    expect(changeSectionLayout({ ...createDefaultSection('message'), layout: 'card', background: 'accent' }, 'stacked').background).toBe('light')
  })

  it('keeps a background the host picked', () => {
    const full = createDefaultSection('hero')

    expect(changeSectionLayout({ ...full, layout: 'arch', background: 'accent' }, 'collage').background).toBe('accent')
    expect(changeSectionLayout({ ...full, layout: 'split', background: 'photo' }, 'banner').background).toBe('photo')
    // Every layout offers every background, so a picked one always carries over
    expect(changeSectionLayout({ ...full, background: 'light' }, 'overlay-card').background).toBe('light')
  })

  it('leaves the section alone for an unknown layout', () => {
    const section = createDefaultSection('hero')

    expect(changeSectionLayout(section, 'does-not-exist')).toBe(section)
  })
})
