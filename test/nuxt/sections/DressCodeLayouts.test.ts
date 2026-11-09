import type { DressCodeContent } from '~/features/sections/dress-code/dress-code.type'
import type { SectionBackground } from '~/features/sections/section.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import SectionRenderer from '~/components/sections/SectionRenderer.vue'
import { attireOf, avoidSentence, joinColourNames, sampleDressCode } from '~/features/sections/dress-code/dress-code.helpers'
import { backgroundStyles } from '~/features/sections/section.background'
import { currentLayoutKey, getSectionLayout, getSectionType } from '~/features/sections/section.registry'

const layouts = getSectionType('dress-code').layouts
const compact = ['strip', 'pill', 'note']
const backgroundPhoto = 'https://example.com/garden.jpg'
const photos = Array.from({ length: 6 }, (_, index) => `https://example.com/look-${index + 1}.jpg`)
const content: DressCodeContent = {
  eyebrow: 'What to wear',
  heading: 'Dress code',
  ...structuredClone(sampleDressCode),
  attire: 'Garden formal',
  backgroundPhoto,
  layoutPhotos: photos,
}

// Through the registry, as pages render sections
const mountLayout = (layout: string, props: { content?: DressCodeContent, background?: SectionBackground, options?: Record<string, string> } = {}) =>
  mountSuspended(SectionRenderer, {
    props: {
      section: {
        type: 'dress-code' as const,
        layout,
        background: props.background ?? getSectionLayout('dress-code', layout)!.backgrounds[0]!,
        options: props.options ?? {},
        content: props.content ?? content,
      },
    },
  })
type Wrapper = Awaited<ReturnType<typeof mountLayout>>
const colourNames = (wrapper: Wrapper) => wrapper.findAll('[data-dress-colour]').map(colour => colour.attributes('data-colour-name'))

describe('dress code helpers', () => {
  it('reads the attire motif as the host wrote it, trimmed, or nothing', () => {
    expect(attireOf({ attire: '  Sunday best ' })).toBe('Sunday best')
    expect(attireOf({ attire: ' ' })).toBe('')
    expect(attireOf({})).toBe('')
  })

  it('names colours for a sentence', () => {
    const [sage, linen, ochre, taupe] = sampleDressCode.colours
    expect(joinColourNames([sage!], 'or')).toBe('sage')
    expect(joinColourNames([sage!, linen!], 'or')).toBe('sage or linen')
    expect(joinColourNames([sage!, linen!, ochre!, taupe!], 'or')).toBe('sage, linen, ochre or taupe')
    expect(avoidSentence(sampleDressCode.avoidColours)).toBe('Kindly avoid white and ivory.')
    expect(avoidSentence([])).toBe('')
  })
})

describe('every dress code layout', () => {
  it('registers the three compact layouts first, then nineteen full ones; the removed formality scale reads as the palette', () => {
    expect(layouts).toHaveLength(22)
    expect(layouts.slice(0, 3).map(layout => layout.key)).toEqual(compact)
    expect(layouts.some(layout => layout.key === 'formality')).toBe(false)
    expect(currentLayoutKey('dress-code', 'formality')).toBe('palette')
  })

  it('requires nothing, not even the attire motif, and starts a new section without one', () => {
    for (const layout of layouts)
      expect(layout.required ?? [], layout.key).toEqual([])
    expect(getSectionType('dress-code').defaultContent.attire).toBeUndefined()
  })

  it.each(layouts.filter(layout => !compact.includes(layout.key)).map(layout => layout.key))('%s leaves out a missing or blank attire motif', async (key) => {
    for (const attire of [undefined, '  ']) {
      const wrapper = await mountLayout(key, { content: { ...content, attire } })
      expect(wrapper.find('[data-dress-attire]').exists()).toBe(false)
      expect(wrapper.find('h2').text()).toContain('Dress code')
    }
  })

  it('compact layouts read well without an attire motif', async () => {
    const without = { ...content, attire: undefined }

    expect((await mountLayout('strip', { content: without })).find('[data-dress-attire]').text()).toBe('Dress code')
    const pill = await mountLayout('pill', { content: without })
    expect(pill.find('[data-dress-attire]').exists()).toBe(false)
    expect(pill.find('[data-dress-swatches]').classes()).not.toContain('@2xl:border-s')
    const note = await mountLayout('note', { content: without })
    expect(note.find('[data-dress-attire]').exists()).toBe(false)
    expect(note.find('[data-dress-note]').text().replace(/\s+/g, ' ')).toContain('Wear sage, linen, ochre or taupe')
  })

  it.each(layouts.map(layout => layout.key))('%s shows five colours', async (key) => {
    const rose = { id: 'rose', name: 'Rose', hex: '#C9A0A0' }
    const wrapper = await mountLayout(key, { content: { ...content, colours: [...content.colours, rose] } })

    expect(colourNames(wrapper)).toEqual(['Sage', 'Linen', 'Ochre', 'Taupe', 'Rose'])
  })

  it.each(layouts.map(layout => layout.key))('%s shows the attire and its colours, by name', async (key) => {
    const wrapper = await mountLayout(key)

    expect(wrapper.find('[data-dress-attire]').text()).toContain('Garden formal')
    expect(colourNames(wrapper)).toEqual(['Sage', 'Linen', 'Ochre', 'Taupe'])
  })

  it.each(layouts.filter(layout => !compact.includes(layout.key)).map(layout => layout.key))('%s shows the description and what to avoid', async (key) => {
    const wrapper = await mountLayout(key)

    expect(wrapper.text()).toContain('Light suits or barong for gentlemen')
    expect(wrapper.find('[data-dress-avoid]').exists()).toBe(true)
    expect(wrapper.text().toLowerCase()).toContain('ivory')
  })

  it.each(layouts.map(layout => layout.key))('%s renders without colours, description or photos', async (key) => {
    const wrapper = await mountLayout(key, { content: { heading: 'Dress code', attire: 'Cocktail', colours: [], avoidColours: [], layoutPhotos: [] } })

    expect(wrapper.find('[data-dress-attire]').text()).toContain('Cocktail')
    expect(wrapper.find('[data-dress-colour]').exists()).toBe(false)
    expect(wrapper.find('[data-dress-avoid]').exists()).toBe(false)
  })

  it.each(layouts.flatMap(layout => layout.backgrounds.filter(bg => bg !== 'photo').map(bg => [layout.key, bg] as const)))('%s applies the %s background', async (key, background) => {
    const wrapper = await mountLayout(key, { background })

    expect(wrapper.find('section').classes()).toEqual(expect.arrayContaining(backgroundStyles[background].root.split(' ')))
  })

  it.each(layouts.map(layout => [layout.key, layout.layoutPhotoCount] as const))('%s shows inspiration photos only when it has room for them (%i), and the background photo only on Photo', async (key, count) => {
    const onLight = await mountLayout(key, { background: 'light' })
    const sources = onLight.findAll('img').map(img => img.attributes('src'))
    expect(sources).not.toContain(backgroundPhoto)
    expect(sources.filter(src => photos.includes(src!)).length).toBeLessThanOrEqual(count)
    if (count === 0)
      expect(onLight.find('[data-dress-photo]').exists()).toBe(false)

    const onPhoto = await mountLayout(key, { background: 'photo' })
    expect(onPhoto.findAll('img').map(img => img.attributes('src'))).toContain(backgroundPhoto)
  })

  it.each(layouts.filter(layout => !compact.includes(layout.key) && layout.key !== 'split-colour').map(layout => layout.key))('%s offers Title and text first, left, centred or right, which aligns both', async (key) => {
    const layout = getSectionLayout('dress-code', key)!
    const [align] = layout.options
    expect([align!.key, align!.label]).toEqual(['textAlign', 'Title and text'])
    expect(align!.choices.map(choice => choice.value)).toEqual(['start', 'center', 'end'])
    expect(layout.options.some(option => option.key === 'titleAlign')).toBe(false)

    const right = await mountLayout(key, { options: { textAlign: 'end' } })
    const alignedRight = (element: Element) => !!element.closest('.text-end')
    expect(right.findAll('[data-dress-attire]').some(attire => alignedRight(attire.element)), 'titles').toBe(true)
    expect(alignedRight(right.find('[data-dress-description]').element), 'description').toBe(true)
  })

  it('split colour: aligns its title (on the colour half) and its text separately', async () => {
    const options = getSectionLayout('dress-code', 'split-colour')!.options
    expect(options.slice(0, 2).map(option => [option.key, option.label])).toEqual([['titleAlign', 'Title'], ['textAlign', 'Text']])
    for (const option of options.slice(0, 2))
      expect(option.choices.map(choice => choice.value)).toEqual(['start', 'center', 'end'])

    const wrapper = await mountLayout('split-colour', { options: { titleAlign: 'end', textAlign: 'center' } })
    expect(wrapper.find('[data-dress-colour-half]').classes()).toContain('text-end')
    expect(wrapper.find('[data-dress-description]').classes()).toContain('text-center')
  })

  it('ribbons: flat colour, no sheen', async () => {
    const ribbon = (await mountLayout('ribbons')).find('[data-dress-colour]')
    expect(ribbon.classes().some(name => name.startsWith('bg-linear') || name.startsWith('via-') || name.startsWith('from-'))).toBe(false)
  })

  it.each(layouts.map(layout => layout.key))('%s uses only the fields it declares', async (key) => {
    const fields = getSectionLayout('dress-code', key)!.fields
    const wrapper = await mountLayout(key, { content: { ...content, eyebrow: 'EYEBROW-TEXT' } })

    expect(wrapper.text().includes('EYEBROW-TEXT')).toBe(fields.includes('eyebrow'))
    expect(wrapper.text().includes('Light suits or barong')).toBe(fields.includes('description'))
  })
})

describe('compact layouts and the palette', () => {
  it('strip: one line with the heading and attire as a label, always centred', async () => {
    const centred = await mountLayout('strip')
    expect(centred.find('[data-dress-attire]').text()).toBe('Dress code · Garden formal')
    expect(centred.find('[data-dress-strip]').classes()).toContain('justify-center')
    // Straight on the section, no outlined box
    expect(centred.find('[data-dress-strip]').classes().some(name => name.startsWith('border') || name.startsWith('rounded'))).toBe(false)
    expect(getSectionLayout('dress-code', 'strip')!.options).toEqual([])
  })

  it('pill: the attire, tiny swatches and "No white or ivory", gone without colours to avoid', async () => {
    const pill = await mountLayout('pill')
    expect(pill.find('[data-dress-avoid]').text()).toBe('No white or ivory')
    expect((await mountLayout('pill', { content: { ...content, avoidColours: [] } })).find('[data-dress-avoid]').exists()).toBe(false)
  })

  it('note: the colours named inline, then what to avoid', async () => {
    const note = await mountLayout('note')
    expect(note.text()).toContain('in')
    expect(note.text()).toContain('sage')
    expect(note.text()).toContain('or')
    expect(note.find('[data-dress-avoid]').text()).toBe('Kindly avoid white and ivory.')
    expect((await mountLayout('note', { content: { ...content, avoidColours: [] } })).find('[data-dress-avoid]').exists()).toBe(false)
  })

  it('palette: swatches in circles or squares, named when they have a name', async () => {
    const circles = await mountLayout('palette')
    expect(circles.find('[data-dress-colour] span').classes()).toContain('rounded-full')
    expect(circles.find('[data-dress-colour]').text()).toBe('Sage')

    const squares = await mountLayout('palette', { options: { swatchShape: 'square' } })
    expect(squares.find('[data-dress-colour] span').classes()).toContain('rounded-(--site-radius)')

    const unnamed = await mountLayout('palette', { content: { ...content, colours: content.colours.map(colour => ({ ...colour, name: '' })) } })
    expect(unnamed.findAll('[data-dress-colour]').map(colour => colour.text())).toEqual(['', '', '', ''])
  })

  it('no layout offers a colour names option: a colour without a name shows none', () => {
    for (const layout of layouts)
      expect(layout.options.some(option => option.key === 'showNames'), layout.key).toBe(false)
  })
})
