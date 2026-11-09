import type { Component } from 'vue'
import type { DressCodeContent } from '~/features/sections/dress-code/dress-code.type'
import type { SectionBackground } from '~/features/sections/section.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import DressCodeEditorial from '~/components/sections/dress-code/DressCodeEditorial.vue'
import DressCodeHangers from '~/components/sections/dress-code/DressCodeHangers.vue'
import DressCodeMinimal from '~/components/sections/dress-code/DressCodeMinimal.vue'
import DressCodeTag from '~/components/sections/dress-code/DressCodeTag.vue'
import { sampleDressCode } from '~/features/sections/dress-code/dress-code.helpers'
import { backgroundStyles } from '~/features/sections/section.background'
import { mixSrgb } from '~/site-theme/color'
import { resolveLayoutOptions } from '~/features/sections/section.options'
import { getSectionLayout } from '~/features/sections/section.registry'
import { sampleOccasion } from '~/features/sections/section.type'

const backgroundPhoto = 'https://example.com/garden.jpg'
const content: DressCodeContent = {
  eyebrow: 'What to wear',
  heading: 'Dress code',
  ...structuredClone(sampleDressCode),
  attire: 'Garden formal',
  backgroundPhoto,
  layoutPhotos: [],
}
const names = ['Sage', 'Linen', 'Ochre', 'Taupe']

const layouts: { key: string, component: Component }[] = [
  { key: 'editorial', component: DressCodeEditorial },
  { key: 'hangers', component: DressCodeHangers },
  { key: 'tag', component: DressCodeTag },
  { key: 'minimal', component: DressCodeMinimal },
]

const definitionOf = (key: string) => getSectionLayout('dress-code', key)!

const mountLayout = (key: string, props: { content?: Partial<DressCodeContent>, background?: SectionBackground, options?: Record<string, string> } = {}) => {
  const definition = definitionOf(key)
  return mountSuspended(layouts.find(layout => layout.key === key)!.component, {
    props: {
      content: { ...content, ...props.content },
      background: props.background ?? definition.backgrounds[0]!,
      options: resolveLayoutOptions(definition.options, props.options),
      occasion: sampleOccasion(),
    },
  })
}
type Wrapper = Awaited<ReturnType<typeof mountLayout>>
const colourNames = (wrapper: Wrapper) => wrapper.findAll('[data-dress-colour]').map(colour => colour.attributes('data-colour-name'))
const sources = (wrapper: Wrapper) => wrapper.findAll('img').map(img => img.attributes('src'))

describe.each(layouts)('dress code layout $key', ({ key }) => {
  it('renders the eyebrow, heading, attire, description and colour names', async () => {
    const wrapper = await mountLayout(key)

    expect(wrapper.text()).toContain('What to wear')
    expect(wrapper.find('h2').text()).toBe('Dress code')
    expect(wrapper.find('[data-dress-attire]').text()).toBe('Garden formal')
    expect(wrapper.find('[data-dress-description]').text()).toContain('Light suits or barong')
    expect(colourNames(wrapper)).toEqual(names)
    for (const name of names)
      expect(wrapper.text()).toContain(name)
  })

  it('shows the colours to avoid, and nothing about them without any', async () => {
    const shown = await mountLayout(key)
    expect(shown.find('[data-dress-avoid]').exists()).toBe(true)
    expect(shown.find('[data-dress-avoid]').text().toLowerCase()).toContain('white')
    expect(shown.find('[data-dress-avoid]').text().toLowerCase()).toContain('ivory')

    const none = await mountLayout(key, { content: { avoidColours: [] } })
    expect(none.find('[data-dress-avoid]').exists()).toBe(false)
    expect(none.text().toLowerCase()).not.toContain('ivory')
  })

  it('renders without colours or a description', async () => {
    const wrapper = await mountLayout(key, { content: { colours: [], avoidColours: [], description: undefined } })

    expect(wrapper.find('[data-dress-attire]').text()).toBe('Garden formal')
    expect(wrapper.find('[data-dress-colour]').exists()).toBe(false)
    expect(wrapper.find('[data-dress-description]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Sage')
  })

  it('leaves out a missing eyebrow and heading', async () => {
    const wrapper = await mountLayout(key, { content: { eyebrow: undefined, heading: '' } })

    expect(wrapper.find('h2').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('What to wear')
    expect(wrapper.find('[data-dress-attire]').text()).toBe('Garden formal')
  })

  it('shows the host\'s own words for a custom attire', async () => {
    const wrapper = await mountLayout(key, { content: { attire: 'Sunday best' } })
    expect(wrapper.find('[data-dress-attire]').text()).toBe('Sunday best')
  })

  it('applies each background it supports', async () => {
    expect(definitionOf(key).backgrounds).toHaveLength(4)
    for (const background of definitionOf(key).backgrounds) {
      const wrapper = await mountLayout(key, { background })
      for (const className of backgroundStyles[background].root.split(' '))
        expect(wrapper.find('section').classes(), background).toContain(className)
    }
  })

  it('shows the background photo only on the photo background', async () => {
    expect(sources(await mountLayout(key, { background: 'light' }))).toEqual([])
    expect(sources(await mountLayout(key, { background: 'photo' }))).toEqual([backgroundPhoto])
  })

  it('has at least one option', () => {
    expect(definitionOf(key).options.length).toBeGreaterThan(0)
  })
})

describe('editorial', () => {
  it('sets the attire huge in the heading font under a label of the eyebrow and heading', async () => {
    const wrapper = await mountLayout('editorial')
    const attire = wrapper.find('[data-dress-attire]')

    expect(attire.classes()).toEqual(expect.arrayContaining(['font-(family-name:--site-font-heading)', 'text-6xl', '@3xl:text-8xl']))
    expect(attire.classes().some(name => name.startsWith('font-bold') || name === 'font-semibold')).toBe(false)
    expect(wrapper.find('h2').element.parentElement!.textContent!.replace(/\s+/g, ' ').trim()).toBe('What to wear · Dress code')
  })

  it('numbers the colours', async () => {
    const wrapper = await mountLayout('editorial')
    expect(wrapper.findAll('[data-dress-number]').map(number => number.text())).toEqual(['01', '02', '03', '04'])
    expect(wrapper.find('[data-dress-colour] [aria-hidden]').attributes('style')).toContain('background-color')
  })

  it('starts left by default; the title and text option moves the masthead and the description together', async () => {
    const start = await mountLayout('editorial')
    expect(start.find('[data-dress-masthead]').classes()).toContain('items-start')

    const centred = await mountLayout('editorial', { options: { textAlign: 'center' } })
    expect(centred.find('[data-dress-masthead]').classes()).toContain('items-center')
    expect(centred.find('[data-dress-description]').classes()).toContain('text-center')
  })

  it('keeps one column without a description', async () => {
    const wrapper = await mountLayout('editorial', { content: { description: '' } })
    expect(wrapper.find('[data-dress-colours]').element.parentElement!.parentElement!.className).not.toContain('@3xl:grid-cols-2')
  })
})

describe('hangers', () => {
  const silhouettesOf = (wrapper: Wrapper) => wrapper.findAll('[data-silhouette]').map(figure => figure.attributes('data-silhouette'))
  const fillOf = (wrapper: Wrapper, index: number) => wrapper.findAll('[data-dress-figure]')[index]!.attributes('style')

  it('shows a silhouette per colour, in order, each a flat fill through its mask, outlined in the text colour', async () => {
    const rose = { id: 'rose', name: 'Rose', hex: '#C9A0A0' }
    const wrapper = await mountLayout('hangers', { content: { colours: [...content.colours, rose] } })

    expect(silhouettesOf(wrapper)).toEqual(['a-line-gown', 'tuxedo', 'mermaid-gown', 'tuxedo', 'ball-gown'])
    expect(fillOf(wrapper, 0)).toContain('background-color: #33493A')
    expect(fillOf(wrapper, 0)).toMatch(/mask: url\(".*a-line-gown.*"\)/)
    expect(fillOf(wrapper, 4)).toContain('background-color: #C9A0A0')
    expect(wrapper.find('[data-dress-outline]').classes().some(name => name.includes('drop-shadow') && name.includes('var(--outline)'))).toBe(true)
  })

  it('lines the figures up by their tops, so a colour without a name stays level with the others', async () => {
    const unnamed = content.colours.map((colour, index) => (index === 3 ? { ...colour, name: '' } : colour))
    const wrapper = await mountLayout('hangers', { content: { colours: unnamed } })
    expect(wrapper.find('[data-dress-silhouettes] ul').classes()).toContain('items-start')
    expect(wrapper.find('[data-dress-silhouettes] ul').classes()).not.toContain('items-end')
  })

  it('outlines the figures in their own colour, darker, on light; from the background\'s (white when it\'s close to black, else darker) on the others; no shadow', async () => {
    const outline = async (background: SectionBackground) => (await mountLayout('hangers', { background })).find('[data-dress-outline]').attributes('style')
    expect(await outline('secondary')).toContain('--outline: oklch(from var(--site-secondary) calc(clamp(0, (l - 0.35) * 1000, 1) * l * 0.78')
    expect(await outline('light')).toContain(`--outline: ${mixSrgb('#33493A', '#000000', 0.7)}`)
    const wrapper = await mountLayout('hangers')
    expect(wrapper.find('[data-dress-silhouettes] .blur-\\[2px\\]').exists()).toBe(false)
  })

  it('shows only as many silhouettes as colours', async () => {
    const four = await mountLayout('hangers')
    expect(silhouettesOf(four)).toEqual(['a-line-gown', 'tuxedo', 'mermaid-gown', 'tuxedo'])
    expect(colourNames(four)).toEqual(names)

    const one = await mountLayout('hangers', { content: { colours: content.colours.slice(0, 1) } })
    expect(silhouettesOf(one)).toEqual(['a-line-gown'])
  })

  it('names each colour that has a name, never the outfit', async () => {
    const shown = await mountLayout('hangers')
    expect(shown.findAll('[data-dress-colour]')[2]!.text()).toBe('Ochre')

    const unnamed = await mountLayout('hangers', { content: { colours: content.colours.map(colour => ({ ...colour, name: '' })) } })
    expect(unnamed.findAll('[data-dress-colour]').every(colour => colour.text() === '')).toBe(true)
  })

  it('leaves the silhouettes out without colours', async () => {
    const wrapper = await mountLayout('hangers', { content: { colours: [] } })
    expect(wrapper.find('[data-dress-silhouettes]').exists()).toBe(false)
  })
})

describe('tag', () => {
  it('writes the attire, colours and what to avoid on a light tag, whatever the background', async () => {
    const wrapper = await mountLayout('tag', { background: 'primary' })
    const tag = wrapper.find('[data-dress-tag]')

    expect(tag.find('div').classes()).toEqual(expect.arrayContaining(backgroundStyles.light.root.split(' ')))
    expect(tag.text()).toContain('Dress code')
    expect(tag.find('[data-dress-attire]').text()).toBe('Garden formal')
    expect(tag.find('[data-dress-colour-names]').text()).toBe('Sage · Linen · Ochre · Taupe')
    expect(tag.find('[data-dress-avoid]').text()).toBe('No white or ivory')
    // The details beside it carry the attire too
    expect(wrapper.find('[data-dress-heading] [data-dress-attire]').text()).toBe('Garden formal')
  })

  it('puts the tag on the left by default and on the right with the tag side option', async () => {
    const left = await mountLayout('tag')
    expect(left.find('[data-dress-tag]').classes()).not.toContain('@3xl:order-last')
    expect(left.find('[data-dress-tag-layout]').classes()).toContain('@3xl:grid-cols-[auto_1fr]')

    const right = await mountLayout('tag', { options: { colourSide: 'right' } })
    expect(right.find('[data-dress-tag]').classes()).toContain('@3xl:order-last')
    expect(right.find('[data-dress-tag-layout]').classes()).toContain('@3xl:grid-cols-[1fr_auto]')
  })

  it('labels the side option "Tag side"', () => {
    expect(definitionOf('tag').options.find(option => option.key === 'colourSide')!.label).toBe('Tag side')
  })
})

describe('minimal', () => {
  it('writes the colours out, each after a small dot of its colour', async () => {
    const wrapper = await mountLayout('minimal')

    expect(wrapper.find('[data-dress-colours]').text().replace(/\s+/g, ' ')).toBe('Colours Sage, Linen, Ochre, Taupe')
    const dots = wrapper.findAll('[data-dress-colour] [data-dress-dot]')
    expect(dots).toHaveLength(4)
    expect(dots[0]!.attributes('style')).toContain('background-color')
    expect(dots[0]!.attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('[data-dress-avoid]').text()).toBe('Please avoid white and ivory')
    expect(wrapper.find('[data-dress-avoid]').classes()).toContain(backgroundStyles.light.muted)
    expect(wrapper.find('svg').exists()).toBe(false)
  })

  it('centres by default and starts left with the text option', async () => {
    expect((await mountLayout('minimal')).find('[data-dress-minimal]').classes()).toContain('items-center')
    expect((await mountLayout('minimal', { options: { textAlign: 'start' } })).find('[data-dress-minimal]').classes()).toContain('items-start')
  })
})
