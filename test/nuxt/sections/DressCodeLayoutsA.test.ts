import type { Component } from 'vue'
import type { DressCodeContent } from '~/features/sections/dress-code/dress-code.type'
import type { SectionBackground } from '~/features/sections/section.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import DressCodeBento from '~/components/sections/dress-code/DressCodeBento.vue'
import DressCodeMoodboard from '~/components/sections/dress-code/DressCodeMoodboard.vue'
import DressCodePolaroids from '~/components/sections/dress-code/DressCodePolaroids.vue'
import DressCodeSplitPhoto from '~/components/sections/dress-code/DressCodeSplitPhoto.vue'
import DressCodeSwatchCards from '~/components/sections/dress-code/DressCodeSwatchCards.vue'
import { sampleDressCode, textOnColour } from '~/features/sections/dress-code/dress-code.helpers'
import { backgroundStyles } from '~/features/sections/section.background'
import { resolveLayoutOptions } from '~/features/sections/section.options'
import { getSectionLayout } from '~/features/sections/section.registry'
import { sampleOccasion } from '~/features/sections/section.type'

const backgroundPhoto = 'https://example.com/background.jpg'
const layoutPhotos = Array.from({ length: 6 }, (_, index) => `https://example.com/${index + 1}.jpg`)
const content: DressCodeContent = {
  eyebrow: 'What to wear',
  heading: 'Dress code',
  ...structuredClone(sampleDressCode),
  attire: 'Garden formal',
  backgroundPhoto,
  layoutPhotos,
}
const colourNames = content.colours.map(colour => colour.name)

// Each layout and how many inspiration photos it shows with its default options
// `photos`: the layout photos it declares; `shown`: how many show by default, when fewer
const layouts: { key: string, component: Component, photos: number, shown?: number }[] = [
  { key: 'swatch-cards', component: DressCodeSwatchCards, photos: 0 },
  // Room for four photos, three by default (`photoCount`)
  { key: 'split-photo', component: DressCodeSplitPhoto, photos: 4, shown: 3 },
  { key: 'moodboard', component: DressCodeMoodboard, photos: 6 },
  // Room for five prints, four by default (`photoCount`)
  { key: 'polaroids', component: DressCodePolaroids, photos: 5, shown: 4 },
  { key: 'bento', component: DressCodeBento, photos: 2 },
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
const sources = (wrapper: Wrapper) => wrapper.findAll('img').map(img => img.attributes('src'))
const namesOf = (wrapper: Wrapper) => wrapper.findAll('[data-dress-colour]').map(el => el.attributes('data-colour-name'))

describe.each(layouts)('dress-code layout $key', ({ key, photos, shown = photos }) => {
  it('renders the heading, attire, description and every colour by name', async () => {
    const wrapper = await mountLayout(key)

    expect(wrapper.text()).toContain('What to wear')
    expect(wrapper.find('h2').text()).toBe('Dress code')
    expect(wrapper.find('[data-dress-attire]').text()).toBe('Garden formal')
    expect(wrapper.find('[data-dress-description]').text()).toBe(content.description)
    expect(namesOf(wrapper)).toEqual(colourNames)
    for (const name of colourNames)
      expect(wrapper.text().toLowerCase()).toContain(name.toLowerCase())
  })

  it('reads a custom attire in the host\'s own words', async () => {
    const wrapper = await mountLayout(key, { content: { attire: 'Something blue' } })
    expect(wrapper.find('[data-dress-attire]').text()).toBe('Something blue')
  })

  it('shows the colours to avoid when set, and nothing for them otherwise', async () => {
    const shown = await mountLayout(key)
    expect(shown.find('[data-dress-avoid]').text()).toContain('White')
    expect(shown.find('[data-dress-avoid]').text()).toContain('Ivory')

    const none = await mountLayout(key, { content: { avoidColours: [] } })
    expect(none.find('[data-dress-avoid]').exists()).toBe(false)
  })

  it('renders without colours, a description or an eyebrow', async () => {
    const wrapper = await mountLayout(key, { content: { colours: [], avoidColours: [], description: '', eyebrow: '' } })

    expect(wrapper.find('[data-dress-attire]').text()).toBe('Garden formal')
    expect(wrapper.find('[data-dress-colour]').exists()).toBe(false)
    expect(wrapper.find('[data-dress-description]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('What to wear')
  })

  it('applies each background it supports', async () => {
    for (const background of definitionOf(key).backgrounds) {
      const wrapper = await mountLayout(key, { background })
      for (const className of backgroundStyles[background].root.split(' '))
        expect(wrapper.find('section').classes(), background).toContain(className)
    }
  })

  it(`declares ${photos} inspiration photos and shows ${shown}, and the background photo only through the frame on photo`, async () => {
    expect(definitionOf(key).layoutPhotoCount).toBe(photos)
    expect(sources(await mountLayout(key, { background: 'light' }))).toEqual(layoutPhotos.slice(0, shown))

    const onPhoto = await mountLayout(key, { background: 'photo' })
    expect(sources(onPhoto)).toEqual([backgroundPhoto, ...layoutPhotos.slice(0, shown)])
    // The background photo is the frame's own, never one of the layout's photos
    expect(onPhoto.find('section > img').attributes('src')).toBe(backgroundPhoto)
    expect(onPhoto.findAll('[data-dress-photo]').map(photo => photo.attributes('src'))).toEqual(layoutPhotos.slice(0, shown))
  })

  it('keeps its shape with placeholders when there are no photos', async () => {
    const wrapper = await mountLayout(key, { content: { backgroundPhoto: undefined, layoutPhotos: [] } })
    expect(wrapper.findAll('img')).toHaveLength(0)
    expect(wrapper.findAll('[data-photo-placeholder]')).toHaveLength(shown)
  })
})

describe('paint chips (swatch-cards)', () => {
  it('shows each colour as a chip of that colour on a light card', async () => {
    const wrapper = await mountLayout('swatch-cards', { background: 'primary' })
    const chips = wrapper.findAll('[data-dress-chips] [data-dress-colour]')

    expect(chips).toHaveLength(4)
    expect(chips[0]!.classes()).toContain(backgroundStyles.light.root.split(' ')[0])
    expect(chips[0]!.find('[data-dress-chip]').attributes('style')).toContain('background-color')
    expect(chips[0]!.text()).toBe('Sage')
  })

  it('fits five chips in one row from 768px, four otherwise', async () => {
    const four = (await mountLayout('swatch-cards')).find('[data-dress-colour]')
    expect(four.classes()).toContain('@3xl:w-[calc((100%_-_4.5rem)/4)]')

    const rose = { id: 'rose', name: 'Rose', hex: '#C9A0A0' }
    const five = await mountLayout('swatch-cards', { content: { colours: [...content.colours, rose] } })
    expect(five.findAll('[data-dress-colour]').every(chip => chip.classes().includes('@3xl:w-[calc((100%_-_6rem)/5)]'))).toBe(true)
  })

  it('never shows colour codes, and has no option for them', async () => {
    expect((await mountLayout('swatch-cards')).text()).not.toContain('#33493A')
    expect(definitionOf('swatch-cards').options.some(option => option.key === 'showHex')).toBe(false)
  })
})

describe('split with photos (split-photo)', () => {
  it('puts the photos on photoSide and the details on the other side', async () => {
    const left = await mountLayout('split-photo')
    expect(left.find('[data-dress-photos]').classes()).toContain('@3xl:col-start-1')
    expect(left.find('[data-dress-details]').classes()).toContain('@3xl:col-start-2')

    const right = await mountLayout('split-photo', { options: { photoSide: 'right' } })
    expect(right.find('[data-dress-photos]').classes()).toContain('@3xl:col-start-2')
    expect(right.find('[data-dress-details]').classes()).toContain('@3xl:col-start-1')
  })

  it('shows one to four photos (three by default): one tall, two side by side, one tall beside two, two by two', async () => {
    const photosOf = async (photoCount: string) => {
      const wrapper = await mountLayout('split-photo', { options: { photoCount } })
      return { sources: sources(wrapper), tallFirst: wrapper.find('[data-dress-photo]').classes().includes('@3xl:row-span-2'), grid: wrapper.find('[data-dress-photos]').classes() }
    }
    expect(definitionOf('split-photo').options.find(option => option.key === 'photoCount')!.choices.map(choice => choice.value)).toEqual(['1', '2', '3', '4'])

    const three = await photosOf('3')
    expect(three.sources).toEqual(layoutPhotos.slice(0, 3))
    expect(three.tallFirst).toBe(true)
    expect((await mountLayout('split-photo')).findAll('[data-dress-photo]')).toHaveLength(3)

    const one = await photosOf('1')
    expect(one.sources).toEqual(layoutPhotos.slice(0, 1))
    expect(one.tallFirst).toBe(false)

    const two = await photosOf('2')
    expect(two.sources).toEqual(layoutPhotos.slice(0, 2))
    expect(two.grid).toContain('@3xl:grid-cols-2')
    expect(two.grid).not.toContain('@3xl:grid-rows-2')

    const four = await photosOf('4')
    expect(four.sources).toEqual(layoutPhotos.slice(0, 4))
    expect(four.tallFirst).toBe(false)
    expect(four.grid).toEqual(expect.arrayContaining(['@3xl:grid-cols-2', '@3xl:grid-rows-2']))
  })

  it('keeps the overlay over the text\'s half on the photo background', async () => {
    const left = await mountLayout('split-photo', { background: 'photo' })
    expect(left.find('[data-photo-overlay]').classes()).toContain('@3xl:bg-linear-to-l')

    const right = await mountLayout('split-photo', { background: 'photo', options: { photoSide: 'right' } })
    expect(right.find('[data-photo-overlay]').classes()).toContain('@3xl:bg-linear-to-r')
  })
})

describe('moodboard', () => {
  it('lays the collage out in 3 columns by default, 4 with the columns option, always six photos', async () => {
    const three = await mountLayout('moodboard')
    expect(three.find('[data-dress-collage]').classes()).toContain('@3xl:grid-cols-3')
    expect(three.findAll('[data-dress-photo][data-tall]')).toHaveLength(3)

    const four = await mountLayout('moodboard', { options: { columns: '4' } })
    expect(four.find('[data-dress-collage]').classes()).toContain('@3xl:grid-cols-4')
    expect(four.findAll('[data-dress-photo]')).toHaveLength(6)
    expect(four.findAll('[data-dress-photo][data-tall]')).toHaveLength(2)
  })

  it('fills the missing photos with placeholders', async () => {
    const wrapper = await mountLayout('moodboard', { content: { layoutPhotos: layoutPhotos.slice(0, 2) } })
    expect(sources(wrapper)).toEqual(layoutPhotos.slice(0, 2))
    expect(wrapper.findAll('[data-photo-placeholder]')).toHaveLength(4)
  })

  it('pins the colours on a light pill over the collage, names for screen readers', async () => {
    const wrapper = await mountLayout('moodboard', { background: 'primary' })
    const pill = wrapper.find('[data-dress-moodboard] [data-dress-swatches]')
    expect(pill.classes()).toContain(backgroundStyles.light.root.split(' ')[0])
    expect(pill.findAll('.sr-only').map(el => el.text())).toEqual(colourNames)

    expect((await mountLayout('moodboard', { content: { colours: [] } })).find('[data-dress-swatches]').exists()).toBe(false)
  })
})

describe('polaroids', () => {
  it('shows plain prints with no captions, and all the colours as swatches under them', async () => {
    const wrapper = await mountLayout('polaroids')
    expect(wrapper.find('[data-dress-print] figure').classes()).toContain('bg-white')
    expect(wrapper.find('[data-dress-print] figcaption').exists()).toBe(false)
    expect(wrapper.findAll('[data-dress-print] [data-dress-colour]')).toHaveLength(0)
    expect(wrapper.findAll('[data-dress-swatches] [data-dress-colour]').map(el => el.attributes('data-colour-name'))).toEqual(colourNames)
  })

  it('shows four prints by default, or three or five with photoCount, whatever the number of colours', async () => {
    expect(definitionOf('polaroids').layoutPhotoCount).toBe(5)
    expect((await mountLayout('polaroids')).findAll('[data-dress-print]')).toHaveLength(4)

    const three = await mountLayout('polaroids', { options: { photoCount: '3' } })
    expect(sources(three)).toEqual(layoutPhotos.slice(0, 3))
    // The odd last print sits alone, centred, on phones
    expect(three.findAll('[data-dress-print]')[2]!.classes()).toContain('col-span-2')

    const five = await mountLayout('polaroids', { options: { photoCount: '5' }, content: { colours: content.colours.slice(0, 2) } })
    expect(five.findAll('[data-dress-print]')).toHaveLength(5)
    expect(five.find('[data-dress-polaroids]').classes()).toContain('@3xl:grid-cols-5')
    expect(five.findAll('[data-dress-swatches] [data-dress-colour]')).toHaveLength(2)
  })
})

describe('bento', () => {
  it('fills colour tiles with the colour and writes the name in a colour that reads on it', async () => {
    const wrapper = await mountLayout('bento')
    const tile = wrapper.find('[data-dress-colour][data-colour-name="Linen"]')

    expect(tile.attributes('style')).toContain('background-color')
    const probe = document.createElement('span')
    probe.style.color = textOnColour('#E9DCCB')
    expect(tile.attributes('style')).toContain(`color: ${probe.style.color}`)
    expect(tile.find('span').classes()).not.toContain('sr-only')
  })

  it('names the colour tiles that have a name', async () => {
    expect((await mountLayout('bento')).findAll('[data-dress-colour] span').map(name => name.text())).toEqual(colourNames)

    const unnamed = await mountLayout('bento', { content: { ...content, colours: content.colours.map(colour => ({ ...colour, name: '' })) } })
    expect(unnamed.findAll('[data-dress-colour] span')).toHaveLength(0)
  })

  it('puts the text on the section above the grid, not on a tile, under the photo overlay', async () => {
    const wrapper = await mountLayout('bento', { background: 'photo' })
    expect(wrapper.find('[data-dress-text-tile]').exists()).toBe(false)
    expect(wrapper.find('[data-dress-bento] [data-dress-heading]').exists()).toBe(false)
    expect(wrapper.find('[data-dress-text] [data-dress-heading]').exists()).toBe(true)
    expect(wrapper.find('[data-dress-bento] [data-dress-avoid]').exists()).toBe(false)
    expect(wrapper.find('section > img + [class~="-z-10"]').exists()).toBe(true)
  })

  it('keeps the grid full: four columns for two to five colours, photos then colours growing tall with fewer', async () => {
    const gridOf = async (count: number) => {
      const wrapper = await mountLayout('bento', { content: { colours: content.colours.slice(0, count).concat(count === 5 ? [{ id: 'rose', name: 'Rose', hex: '#C9A0A0' }] : []).slice(0, count) } })
      const grid = wrapper.find('[data-dress-bento]')
      const cells = grid.findAll(':scope > *').reduce((sum, tile) => sum + (tile.classes().includes('@3xl:row-span-2') ? 2 : 1), 0)
      return { cells, columns: grid.classes().find(name => name.startsWith('@3xl:grid-cols-')) }
    }
    expect(await gridOf(5)).toEqual({ cells: 8, columns: '@3xl:grid-cols-4' })
    expect(await gridOf(4)).toEqual({ cells: 8, columns: '@3xl:grid-cols-4' })
    expect(await gridOf(3)).toEqual({ cells: 8, columns: '@3xl:grid-cols-4' })
    expect(await gridOf(2)).toEqual({ cells: 8, columns: '@3xl:grid-cols-4' })
    expect(await gridOf(1)).toEqual({ cells: 6, columns: '@3xl:grid-cols-3' })
    expect(await gridOf(0)).toEqual({ cells: 4, columns: '@3xl:grid-cols-2' })
  })
})
