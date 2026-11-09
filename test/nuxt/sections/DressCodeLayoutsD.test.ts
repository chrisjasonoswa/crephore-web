import type { Component } from 'vue'
import type { DressCodeContent } from '~/features/sections/dress-code/dress-code.type'
import type { SectionBackground } from '~/features/sections/section.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import DressCodeOverlap from '~/components/sections/dress-code/DressCodeOverlap.vue'
import DressCodePoster from '~/components/sections/dress-code/DressCodePoster.vue'
import DressCodeRibbons from '~/components/sections/dress-code/DressCodeRibbons.vue'
import DressCodeSplitColour from '~/components/sections/dress-code/DressCodeSplitColour.vue'
import { textOnColour } from '~/features/sections/dress-code/dress-code.helpers'
import { backgroundStyles } from '~/features/sections/section.background'
import { resolveLayoutOptions } from '~/features/sections/section.options'
import { getSectionLayout } from '~/features/sections/section.registry'

const backgroundPhoto = 'https://example.com/background.jpg'
const occasion = { name: 'Bea & Carlo', venue: 'Manila Cathedral', startsAt: '2027-02-14T06:00:00Z', timezone: 'Asia/Manila' }

const content: DressCodeContent = {
  eyebrow: 'What to wear',
  heading: 'Dress code',
  attire: 'Garden formal',
  description: 'Light suits or barong for gentlemen.',
  colours: [
    { id: 'sage', name: 'Sage', hex: '#33493A' },
    { id: 'linen', name: 'Linen', hex: '#E9DCCB' },
    { id: 'ochre', name: 'Ochre', hex: '#B8914A' },
  ],
  avoidColours: [
    { id: 'white', name: 'White', hex: '#FFFFFF' },
    { id: 'ivory', name: 'Ivory', hex: '#FFFDF0' },
  ],
  backgroundPhoto,
  layoutPhotos: [],
}
const colourNames = content.colours.map(colour => colour.name)

const layouts: { key: string, component: Component }[] = [
  { key: 'poster', component: DressCodePoster },
  { key: 'ribbons', component: DressCodeRibbons },
  { key: 'overlap', component: DressCodeOverlap },
  { key: 'split-colour', component: DressCodeSplitColour },
]

const definitionOf = (key: string) => getSectionLayout('dress-code', key)!

const mountLayout = (key: string, props: { content?: Partial<DressCodeContent>, background?: SectionBackground, options?: Record<string, string> } = {}) => {
  const definition = definitionOf(key)
  return mountSuspended(layouts.find(layout => layout.key === key)!.component, {
    props: {
      content: { ...content, ...props.content },
      background: props.background ?? definition.backgrounds[0]!,
      options: resolveLayoutOptions(definition.options, props.options),
      occasion,
    },
  })
}

describe.each(layouts)('dress-code layout $key', ({ key }) => {
  it('renders the attire, description and the colours by name', async () => {
    const wrapper = await mountLayout(key)

    expect(wrapper.find('[data-dress-attire]').text()).toBe('Garden formal')
    expect(wrapper.find('[data-dress-description]').text()).toBe('Light suits or barong for gentlemen.')
    expect(wrapper.findAll('[data-dress-colour]').map(el => el.attributes('data-colour-name'))).toEqual(colourNames)
    for (const name of colourNames)
      expect(wrapper.text()).toContain(name)
    expect(wrapper.text()).toContain('Dress code')
  })

  it('shows the colours to avoid when set, and nothing without them', async () => {
    const withAvoid = await mountLayout(key)
    expect(withAvoid.find('[data-dress-avoid]').text()).toContain('White')
    expect(withAvoid.find('[data-dress-avoid]').text()).toContain('Ivory')

    const without = await mountLayout(key, { content: { avoidColours: [] } })
    expect(without.find('[data-dress-avoid]').exists()).toBe(false)
  })

  it('still renders the attire and description without colours', async () => {
    const wrapper = await mountLayout(key, { content: { colours: [], avoidColours: [] } })

    expect(wrapper.find('[data-dress-attire]').text()).toBe('Garden formal')
    expect(wrapper.find('[data-dress-description]').exists()).toBe(true)
    expect(wrapper.find('[data-dress-colour]').exists()).toBe(false)
  })

  it('leaves out the description and a custom attire without words', async () => {
    const wrapper = await mountLayout(key, { content: { description: '', attire: ' ' } })

    expect(wrapper.find('[data-dress-description]').exists()).toBe(false)
    expect(wrapper.find('[data-dress-attire]').exists()).toBe(false)
  })

  it('applies each background it supports', async () => {
    for (const background of definitionOf(key).backgrounds) {
      const wrapper = await mountLayout(key, { background })
      for (const className of backgroundStyles[background].root.split(' '))
        expect(wrapper.find('section').classes(), background).toContain(className)
    }
    // The background photo only on the photo background
    expect((await mountLayout(key, { background: 'photo' })).find('section > img').attributes('src')).toBe(backgroundPhoto)
    expect((await mountLayout(key, { background: 'light' })).find('section > img').exists()).toBe(false)
  })
})

describe('poster', () => {
  it('starts on primary', () => {
    expect(definitionOf('poster').backgrounds[0]).toBe('primary')
  })

  it('sets the attire in bold capitals of the body font', async () => {
    const attire = (await mountLayout('poster')).find('[data-dress-attire]')

    expect(attire.classes()).toEqual(expect.arrayContaining(['font-bold', 'uppercase']))
    expect(attire.attributes('class')).not.toContain('site-font-heading')
  })

  it('fills each block with its colour and writes its name in the text that reads on it', async () => {
    const blocks = (await mountLayout('poster')).findAll('[data-dress-colour]')

    for (const [index, colour] of content.colours.entries()) {
      expect(blocks[index]!.attributes('style')).toContain(`background-color: ${colour.hex}`)
      expect(blocks[index]!.attributes('style')).toContain(`color: ${textOnColour(colour.hex)}`)
    }
  })

  it('sets the blocks in 4 columns by default, or 2', async () => {
    const four = (await mountLayout('poster')).find('[data-dress-swatches]')
    expect(four.classes()).toContain('@3xl:grid-cols-4')

    const two = (await mountLayout('poster', { options: { columns: '2' } })).find('[data-dress-swatches]')
    expect(two.classes()).toContain('@3xl:grid-cols-2')
    expect(two.classes()).not.toContain('@3xl:grid-cols-4')
  })
})

describe('ribbons', () => {
  it('hangs a notched ribbon of each colour, at different lengths, named on it', async () => {
    const ribbons = (await mountLayout('ribbons')).findAll('[data-dress-colour]')

    expect(ribbons.map(ribbon => ribbon.text())).toEqual(colourNames)
    expect(new Set(ribbons.map(ribbon => ribbon.classes().find(c => c.startsWith('h-')))).size).toBe(ribbons.length)
    for (const [index, colour] of content.colours.entries()) {
      expect(ribbons[index]!.attributes('style')).toContain(`background-color: ${colour.hex}`)
      expect(ribbons[index]!.attributes('style')).toContain('clip-path')
    }
  })

  it('hangs the ribbons on the left by default, or the right', async () => {
    const left = (await mountLayout('ribbons')).find('[data-dress-ribbon-row]')
    expect(left.classes()).not.toContain('@3xl:order-last')

    const right = (await mountLayout('ribbons', { options: { colourSide: 'right' } })).find('[data-dress-ribbon-row]')
    expect(right.classes()).toContain('@3xl:order-last')
    expect(right.classes()).toContain('justify-end')
  })
})

describe('overlap', () => {
  it('draws one decorative circle per colour, overlapping', async () => {
    const wrapper = await mountLayout('overlap')
    const circles = wrapper.findAll('[data-dress-circle]')

    expect(wrapper.find('[data-dress-circles]').attributes('aria-hidden')).toBe('true')
    expect(circles).toHaveLength(3)
    expect(circles[0]!.classes()).toContain('mix-blend-multiply')
    expect(circles.map(circle => circle.attributes('style'))).toEqual(content.colours.map(colour => expect.stringContaining(colour.hex)))
  })

  it('leaves out the circles without colours', async () => {
    expect((await mountLayout('overlap', { content: { colours: [] } })).find('[data-dress-circles]').exists()).toBe(false)
  })

  it('puts the circles on the left by default, or the right', async () => {
    expect((await mountLayout('overlap')).find('[data-dress-circles]').classes()).not.toContain('@3xl:order-last')
    expect((await mountLayout('overlap', { options: { colourSide: 'right' } })).find('[data-dress-circles]').classes()).toContain('@3xl:order-last')
  })
})

describe('split-colour', () => {
  it('fills the colour half with the first colour, its text in the colour that reads on it', async () => {
    const half = (await mountLayout('split-colour')).find('[data-dress-colour-half]')

    expect(half.attributes('style')).toContain('background-color: #33493A')
    expect(half.attributes('style')).toContain(`color: ${textOnColour('#33493A')}`)
    expect(half.text()).toContain('Dress code')
    expect(half.find('[data-dress-attire]').exists()).toBe(true)
  })

  it('uses the primary without colours', async () => {
    const half = (await mountLayout('split-colour', { content: { colours: [] } })).find('[data-dress-colour-half]')

    expect(half.classes()).toEqual(expect.arrayContaining(['bg-(--site-primary)', 'text-(--site-on-primary)']))
    expect(half.attributes('style')).toBeUndefined()
  })

  it('puts the colour half on the left by default, or the right, with the overlay over the details', async () => {
    const left = await mountLayout('split-colour', { background: 'photo' })
    expect(left.find('[data-dress-colour-half]').classes()).not.toContain('@3xl:order-last')
    expect(left.find('[data-photo-overlay]').classes()).toContain('@3xl:bg-linear-to-l')

    const right = await mountLayout('split-colour', { background: 'photo', options: { colourSide: 'right' } })
    expect(right.find('[data-dress-colour-half]').classes()).toContain('@3xl:order-last')
    expect(right.find('[data-photo-overlay]').classes()).toContain('@3xl:bg-linear-to-r')
  })
})
