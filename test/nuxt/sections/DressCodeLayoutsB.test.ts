import type { Component } from 'vue'
import type { DressCodeContent } from '~/features/sections/dress-code/dress-code.type'
import type { SectionBackground } from '~/features/sections/section.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import DressCodeCard from '~/components/sections/dress-code/DressCodeCard.vue'
import DressCodeColorField from '~/components/sections/dress-code/DressCodeColorField.vue'
import DressCodeDoDont from '~/components/sections/dress-code/DressCodeDoDont.vue'
import DressCodeFabric from '~/components/sections/dress-code/DressCodeFabric.vue'
import DressCodeFan from '~/components/sections/dress-code/DressCodeFan.vue'
import { sampleDressCode, textOnColour } from '~/features/sections/dress-code/dress-code.helpers'
import { backgroundStyles } from '~/features/sections/section.background'
import { resolveLayoutOptions } from '~/features/sections/section.options'
import { getSectionLayout } from '~/features/sections/section.registry'
import { sampleOccasion } from '~/features/sections/section.type'

const backgroundPhoto = 'https://example.com/background.jpg'
const content: DressCodeContent = {
  eyebrow: 'What to wear',
  heading: 'Dress code',
  ...structuredClone(sampleDressCode),
  attire: 'Garden formal',
  backgroundPhoto,
  layoutPhotos: [],
}
const colourNames = sampleDressCode.colours.map(colour => colour.name)

// Each layout and its root hook
const layouts: { key: string, component: Component, root: string }[] = [
  { key: 'card', component: DressCodeCard, root: '[data-dress-card]' },
  { key: 'fabric', component: DressCodeFabric, root: '[data-dress-fabric]' },
  { key: 'do-dont', component: DressCodeDoDont, root: '[data-dress-do-dont]' },
  { key: 'color-field', component: DressCodeColorField, root: '[data-dress-color-field]' },
  { key: 'fan', component: DressCodeFan, root: '[data-dress-fan-layout]' },
]

const definitionOf = (key: string) => getSectionLayout('dress-code', key)!

const mountLayout = (key: string, props: { content?: DressCodeContent, background?: SectionBackground, options?: Record<string, string> } = {}) => {
  const definition = definitionOf(key)
  const component = layouts.find(layout => layout.key === key)!.component
  return mountSuspended(component, {
    props: {
      content: props.content ?? content,
      background: props.background ?? definition.backgrounds[0]!,
      options: resolveLayoutOptions(definition.options, props.options),
      occasion: sampleOccasion(),
    },
  })
}

type Wrapper = Awaited<ReturnType<typeof mountLayout>>
const sources = (wrapper: Wrapper) => wrapper.findAll('img').map(img => img.attributes('src'))
const namesOf = (wrapper: Wrapper) => wrapper.findAll('[data-dress-colour]').map(colour => colour.attributes('data-colour-name'))

it('starts the invitation card on secondary and the others on light', () => {
  expect(definitionOf('card').backgrounds[0]).toBe('secondary')
  for (const key of ['fabric', 'do-dont', 'color-field', 'fan'])
    expect(definitionOf(key).backgrounds[0], key).toBe('light')
})

describe.each(layouts)('dress-code layout $key', ({ key, root }) => {
  it('renders the eyebrow, heading, attire, description and every colour by name', async () => {
    const wrapper = await mountLayout(key)

    expect(wrapper.find(root).exists()).toBe(true)
    expect(wrapper.text()).toContain('What to wear')
    expect(wrapper.find('h2').text()).toBe('Dress code')
    expect(wrapper.find('[data-dress-attire]').text()).toBe('Garden formal')
    expect(wrapper.find('[data-dress-description]').text()).toBe(sampleDressCode.description)
    expect(namesOf(wrapper)).toEqual(colourNames)
    for (const name of colourNames)
      expect(wrapper.text()).toContain(name)
  })

  it('shows the colours to avoid', async () => {
    const avoid = (await mountLayout(key)).find('[data-dress-avoid]')

    expect(avoid.exists()).toBe(true)
    expect(avoid.text().toLowerCase()).toContain('white')
    expect(avoid.text().toLowerCase()).toContain('ivory')
  })

  it('renders without colours, colours to avoid, eyebrow or description', async () => {
    const wrapper = await mountLayout(key, { content: { heading: 'Dress code', attire: 'Cocktail', colours: [], avoidColours: [], layoutPhotos: [] } })

    expect(wrapper.find('[data-dress-attire]').text()).toBe('Cocktail')
    expect(wrapper.find('[data-dress-colour]').exists()).toBe(false)
    expect(wrapper.find('[data-dress-avoid]').exists()).toBe(false)
    expect(wrapper.find('[data-dress-description]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('What to wear')
  })

  it('shows a custom attire in the host\'s own words', async () => {
    const wrapper = await mountLayout(key, { content: { ...content, attire: 'Something blue' } })
    expect(wrapper.find('[data-dress-attire]').text()).toBe('Something blue')
  })

  it('shows the background photo only on the photo background, and no other photos', async () => {
    expect(sources(await mountLayout(key, { background: 'light' }))).toEqual([])
    expect(sources(await mountLayout(key, { background: 'photo' }))).toEqual([backgroundPhoto])
  })

  it('applies each background it supports', async () => {
    expect(definitionOf(key).backgrounds).toHaveLength(4)
    for (const background of definitionOf(key).backgrounds) {
      const wrapper = await mountLayout(key, { background })
      for (const className of backgroundStyles[background].root.split(' '))
        expect(wrapper.find('section').classes(), background).toContain(className)
    }
  })
})

describe('invitation card', () => {
  it('sits on a light card with a double frame and an ornament in the accent colour, with no overlay on the photo', async () => {
    const wrapper = await mountLayout('card', { background: 'photo' })

    expect(wrapper.find('[data-dress-card]').classes()).toEqual(expect.arrayContaining(backgroundStyles.light.root.split(' ')))
    expect(wrapper.find('.border-double').exists()).toBe(true)
    expect(wrapper.find('[data-dress-ornament]').classes()).toContain(backgroundStyles.light.accent)
    expect(wrapper.find('[data-photo-overlay]').exists()).toBe(false)
  })

  it('writes what to avoid as a sentence, gone without colours to avoid', async () => {
    expect((await mountLayout('card')).find('[data-dress-avoid]').text()).toBe('Kindly avoid white and ivory.')
    expect((await mountLayout('card', { content: { ...content, avoidColours: [] } })).find('[data-dress-avoid]').exists()).toBe(false)
  })

  it('shows the colours as small dots in their own colours', async () => {
    const dot = (await mountLayout('card')).find('[data-dress-colour]')
    expect(dot.attributes('style')).toContain('background-color')
    expect(dot.find('.sr-only').text()).toBe('Sage')
  })
})

describe('fabric swatches', () => {
  it('cuts each square with a pinked top edge and weaves a texture over its colour', async () => {
    const squares = (await mountLayout('fabric')).findAll('[data-dress-fabric-square]')

    expect(squares).toHaveLength(4)
    expect(squares[0]!.attributes('style')).toContain('clip-path: polygon(')
    expect(squares[0]!.attributes('style')).toContain('repeating-linear-gradient')
  })

  it('names the colours under them, when they have a name', async () => {
    const shown = await mountLayout('fabric')
    expect(shown.findAll('[data-dress-colour]').map(colour => colour.text())).toEqual(colourNames)

    const unnamed = await mountLayout('fabric', { content: { ...content, colours: content.colours.map(colour => ({ ...colour, name: '' })) } })
    expect(unnamed.findAll('[data-dress-colour]').every(colour => colour.text() === '')).toBe(true)
  })
})

describe('wear & avoid', () => {
  it('shows two cards side by side, the colours to avoid struck through', async () => {
    const wrapper = await mountLayout('do-dont')

    expect(wrapper.find('[data-dress-cards]').classes()).toContain('@3xl:grid-cols-2')
    expect(wrapper.find('[data-dress-wear]').text()).toContain('Please wear')
    expect(wrapper.find('[data-dress-avoid]').text()).toContain('Please avoid')
    expect(wrapper.findAll('[data-dress-avoid-colour]').map(colour => colour.text())).toEqual(['White', 'Ivory'])
    expect(wrapper.findAll('[data-dress-avoid-colour] .-rotate-45')).toHaveLength(2)
  })

  it('centres the wear card alone without colours to avoid', async () => {
    const wrapper = await mountLayout('do-dont', { content: { ...content, avoidColours: [] } })

    expect(wrapper.find('[data-dress-cards]').classes()).not.toContain('@3xl:grid-cols-2')
    expect(wrapper.find('[data-dress-cards]').classes()).toContain('max-w-md')
    expect(wrapper.find('[data-dress-wear]').exists()).toBe(true)
  })

  it('draws circles or squares with the option', async () => {
    const swatch = async (options: Record<string, string>) => (await mountLayout('do-dont', { options })).find('[data-dress-colour] [aria-hidden]').classes()

    expect(await swatch({})).toContain('rounded-full')
    expect(await swatch({ swatchShape: 'square' })).toContain('rounded-(--site-radius)')
    expect(await swatch({ swatchShape: 'square' })).not.toContain('rounded-full')
  })
})

describe('colour field', () => {
  it('fills the section with a stripe per colour, always (no style option)', async () => {
    const stripes = await mountLayout('color-field')
    expect(stripes.findAll('[data-dress-field="stripes"] [data-dress-stripe]')).toHaveLength(4)
    expect(stripes.find('[data-dress-field="blend"]').exists()).toBe(false)
    expect(definitionOf('color-field').options.some(option => option.key === 'style')).toBe(false)
  })

  it('puts the card in the centre by default, or left or right with the card option', async () => {
    const card = async (cardAlign?: string) => (await mountLayout('color-field', cardAlign ? { options: { cardAlign } } : {})).find('[data-dress-color-field]').classes()
    expect(definitionOf('color-field').options.map(option => option.key)).toEqual(['textAlign', 'cardAlign'])
    expect(await card()).toContain('mx-auto')
    expect(await card('start')).toContain('me-auto')
    expect(await card('end')).toContain('ms-auto')
  })

  it('names the colours in a spaced line on the card', async () => {
    expect((await mountLayout('color-field')).find('[data-dress-swatches]').text()).toBe('Sage · Linen · Ochre · Taupe')
  })

  it('puts the card in the section\'s own colours (primary for a photo background without a photo), with no overlay', async () => {
    const onPhoto = await mountLayout('color-field', { background: 'photo' })
    expect(onPhoto.find('[data-dress-color-field]').classes()).toEqual(expect.arrayContaining(backgroundStyles.photo.root.split(' ')))
    expect(onPhoto.find('[data-photo-overlay]').exists()).toBe(false)

    const withoutPhoto = await mountLayout('color-field', { background: 'photo', content: { ...content, backgroundPhoto: undefined } })
    expect(withoutPhoto.find('[data-dress-color-field]').classes()).toEqual(expect.arrayContaining(backgroundStyles.primary.root.split(' ')))
  })

  it('leaves the field out without colours, and fills it with a single colour', async () => {
    expect((await mountLayout('color-field', { content: { ...content, colours: [] } })).find('[data-dress-field]').exists()).toBe(false)

    const one = await mountLayout('color-field', { content: { ...content, colours: [content.colours[0]!] } })
    expect(one.findAll('[data-dress-stripe]')).toHaveLength(1)
  })
})

describe('colour fan', () => {
  it('fans the chips across 60° and names each in its readable colour', async () => {
    const chips = (await mountLayout('fan')).findAll('[data-dress-colour]')

    expect(chips.map(chip => chip.attributes('style')!.match(/rotate\((-?[\d.]+)deg\)/)![1]).map(Number)).toEqual([-30, -10, 10, 30])
    expect(chips.map(chip => chip.text())).toEqual(colourNames)
    expect(chips[0]!.attributes('style')).toContain(`; color: ${textOnColour('#33493A')}`)
    expect(chips[1]!.attributes('style')).toContain(`; color: ${textOnColour('#E9DCCB')}`)
  })

  it('puts the fan on the left or the right with the option, always above the details on phones', async () => {
    const left = await mountLayout('fan')
    expect(left.find('[data-dress-fan]').classes()).not.toContain('@3xl:order-last')

    const right = await mountLayout('fan', { options: { colourSide: 'right' } })
    expect(right.find('[data-dress-fan]').classes()).toContain('@3xl:order-last')
    expect(right.html().indexOf('data-dress-fan=')).toBeLessThan(right.html().indexOf('data-dress-heading'))
  })

  it('shows only the details without colours', async () => {
    const wrapper = await mountLayout('fan', { content: { ...content, colours: [] } })
    expect(wrapper.find('[data-dress-fan]').exists()).toBe(false)
    expect(wrapper.find('[data-dress-fan-layout]').classes()).not.toContain('@3xl:grid-cols-2')
  })
})
