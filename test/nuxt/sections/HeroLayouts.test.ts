import type { Component } from 'vue'
import type { HeroContent } from '~/features/sections/section.content.type'
import type { SectionBackground } from '~/features/sections/section.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import HeroArch from '~/components/sections/hero/HeroArch.vue'
import HeroBanner from '~/components/sections/hero/HeroBanner.vue'
import HeroCollage from '~/components/sections/hero/HeroCollage.vue'
import HeroEditorial from '~/components/sections/hero/HeroEditorial.vue'
import HeroFilmstrip from '~/components/sections/hero/HeroFilmstrip.vue'
import HeroFramed from '~/components/sections/hero/HeroFramed.vue'
import HeroFullscreen from '~/components/sections/hero/HeroFullscreen.vue'
import HeroOffsetFrame from '~/components/sections/hero/HeroOffsetFrame.vue'
import HeroOverlayCard from '~/components/sections/hero/HeroOverlayCard.vue'
import HeroPolaroid from '~/components/sections/hero/HeroPolaroid.vue'
import HeroSplit from '~/components/sections/hero/HeroSplit.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import { resolveLayoutOptions } from '~/features/sections/section.options'
import { getSectionLayout } from '~/features/sections/section.registry'
import { sampleOccasion } from '~/features/sections/section.type'

const backgroundPhoto = 'https://example.com/background.jpg'
const layoutPhotos = ['https://example.com/1.jpg', 'https://example.com/2.jpg', 'https://example.com/3.jpg', 'https://example.com/4.jpg', 'https://example.com/5.jpg']

const content: HeroContent = {
  eyebrow: 'Together with their families',
  title: 'Bea & Carlo',
  date: 'Saturday, 14 February 2027',
  venue: 'Manila Cathedral',
  backgroundPhoto,
  layoutPhotos,
  cta: { label: 'RSVP', href: '#rsvp' },
}

// Each layout with the number of layout photos it shows (the photo-backed ones show only the background photo),
// and how many placeholders it shows without photos when that differs (a slideshow keeps one spot)
const layouts: { key: string, component: Component, photoCount: number, placeholderCount?: number }[] = [
  { key: 'fullscreen', component: HeroFullscreen, photoCount: 0 },
  { key: 'split', component: HeroSplit, photoCount: 1 },
  { key: 'arch', component: HeroArch, photoCount: 1 },
  { key: 'editorial', component: HeroEditorial, photoCount: 1 },
  { key: 'overlay-card', component: HeroOverlayCard, photoCount: 0 },
  { key: 'collage', component: HeroCollage, photoCount: 3 },
  { key: 'banner', component: HeroBanner, photoCount: 1 },
  { key: 'filmstrip', component: HeroFilmstrip, photoCount: 5 },
  { key: 'polaroid', component: HeroPolaroid, photoCount: 2 },
  { key: 'framed', component: HeroFramed, photoCount: 1 },
  { key: 'offset-frame', component: HeroOffsetFrame, photoCount: 5, placeholderCount: 1 },
]

const definitionOf = (key: string) => getSectionLayout('hero', key)!

// Mounts a layout like SectionRenderer does: its options with defaults filled in
const mountLayout = (key: string, props: { content?: HeroContent, background?: SectionBackground, options?: Record<string, string> } = {}) => {
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

const sources = (wrapper: Awaited<ReturnType<typeof mountLayout>>) => wrapper.findAll('img').map(img => img.attributes('src'))
// Position of one element before another in the rendered HTML
const comesBefore = (wrapper: Awaited<ReturnType<typeof mountLayout>>, first: string, second: string) => {
  const html = wrapper.html()
  return html.indexOf(first) < html.indexOf(second)
}

describe.each(layouts)('hero layout $key', ({ key, photoCount, placeholderCount = photoCount }) => {
  it('renders the title, details and RSVP button', async () => {
    const wrapper = await mountLayout(key)

    expect(wrapper.find('h1').text()).toBe('Bea & Carlo')
    expect(wrapper.text()).toContain('Together with their families')
    expect(wrapper.text()).toContain('Saturday, 14 February 2027')
    expect(wrapper.text()).toContain('Manila Cathedral')
    expect(wrapper.find('a[href="#rsvp"]').text()).toBe('RSVP')
  })

  it('renders an unsafe saved button link without a link', async () => {
    const wrapper = await mountLayout(key, { content: { ...content, cta: { label: 'RSVP', href: 'javascript:alert(1)' } } })

    expect(wrapper.findAll('a').find(a => a.text() === 'RSVP')!.attributes('href')).toBeUndefined()
  })

  it('declares how many layout photos it shows', () => {
    expect(definitionOf(key).layoutPhotoCount).toBe(photoCount)
  })

  it(`shows its first ${photoCount} layout photo(s), and the background photo only on the photo background`, async () => {
    const wrapper = await mountLayout(key)
    // Mounted on its first background; the frame's background photo comes first in the markup
    const onPhoto = definitionOf(key).backgrounds[0] === 'photo'

    expect(sources(wrapper)).toEqual([...(onPhoto ? [backgroundPhoto] : []), ...layoutPhotos.slice(0, photoCount)])
  })

  it('never shows the background photo on a colour background', async () => {
    for (const background of definitionOf(key).backgrounds.filter(b => b !== 'photo'))
      expect(sources(await mountLayout(key, { background }))).not.toContain(backgroundPhoto)
  })

  it('keeps its shape with placeholders when there are no photos', async () => {
    const wrapper = await mountLayout(key, { content: { ...content, backgroundPhoto: undefined, layoutPhotos: [] } })

    expect(wrapper.find('img').exists()).toBe(false)
    // The photo-backed layouts (no layout photos) fall back to the primary colour instead
    expect(wrapper.findAll('[data-photo-placeholder]')).toHaveLength(placeholderCount)
  })

  it('on the photo background, shows the background photo under an overlay, with the photo text colours', async () => {
    const wrapper = await mountLayout(key, { background: 'photo' })
    const section = wrapper.find('section')

    expect(section.find(':scope > img').attributes('src')).toBe(backgroundPhoto)
    // The overlay card has its own solid card instead of an overlay
    expect(section.find(':scope > img + [class~="-z-10"]').exists()).toBe(key !== 'overlay-card')
    for (const className of backgroundStyles.photo.root.split(' '))
      expect(section.classes()).toContain(className)
    // Layout photos still show inside the layout
    expect(sources(wrapper).slice(1)).toEqual(layoutPhotos.slice(0, photoCount))
  })

  it('applies each background it supports', async () => {
    for (const background of definitionOf(key).backgrounds) {
      const wrapper = await mountLayout(key, { background })
      for (const className of backgroundStyles[background].root.split(' '))
        expect(wrapper.find('section').classes()).toContain(className)
    }
  })

  it('renders only the title when the optional content is missing', async () => {
    const wrapper = await mountLayout(key, { content: { title: 'Bea & Carlo', layoutPhotos: [] } })

    expect(wrapper.find('h1').text()).toBe('Bea & Carlo')
    expect(wrapper.find('a').exists()).toBe(false)
  })
})

describe('placement options', () => {
  it('fullscreen: shows the background photo on the photo background, and just the colour on the others', async () => {
    expect(sources(await mountLayout('fullscreen', { background: 'photo' }))).toEqual([backgroundPhoto])
    expect(sources(await mountLayout('fullscreen', { background: 'light' }))).toEqual([])
  })

  it('fullscreen: puts the text at textPosition, with the overlay where it sits', async () => {
    const wrapper = await mountLayout('fullscreen', { options: { textPosition: 'top-right' } })
    const container = wrapper.find('section > div:last-child')

    expect(container.classes()).toEqual(expect.arrayContaining(['justify-start', 'items-end']))
    expect(wrapper.find('img + div').classes()).toContain('bg-linear-to-b')
  })

  it('split: puts the photo on photoSide and the text in the other half', async () => {
    const wrapper = await mountLayout('split', { options: { photoSide: 'left', textPosition: 'bottom' } })

    expect(wrapper.find('img').classes()).toContain('@3xl:col-start-1')
    expect(wrapper.find('[data-hero-text]').classes()).toEqual(expect.arrayContaining(['@3xl:col-start-2', 'justify-end', 'items-center']))
  })

  it('arch: puts the names above the arch by default', async () => {
    const wrapper = await mountLayout('arch')

    expect(comesBefore(wrapper, '<h1', 'data-arch')).toBe(true)
  })

  it('arch: puts the names below the arch', async () => {
    const wrapper = await mountLayout('arch', { options: { namesPlacement: 'below' } })

    expect(comesBefore(wrapper, 'data-arch', '<h1')).toBe(true)
  })

  it('editorial: puts the photo above or below the headline', async () => {
    expect((await mountLayout('editorial', { options: { photoPosition: 'above' } })).find('section > div').classes()).toContain('flex-col-reverse')
    expect((await mountLayout('editorial', { options: { photoPosition: 'below' } })).find('section > div').classes()).not.toContain('flex-col-reverse')
  })

  it('overlay-card: puts the card at cardPosition, with no overlay on the photo', async () => {
    const wrapper = await mountLayout('overlay-card', { options: { cardPosition: 'top-right' } })

    expect(wrapper.find('[data-hero-card]').element.parentElement!.className).toContain('justify-start')
    expect(wrapper.find('[data-hero-card]').element.parentElement!.className).toContain('items-end')
    // SectionFrame's overlay layer sits behind the content (-z-10)
    expect(wrapper.find('section > .-z-10').exists()).toBe(false)
  })

  it('collage: puts the text between, left of or right of the photos', async () => {
    expect((await mountLayout('collage', { options: { textPosition: 'center' } })).find('[data-hero-text]').classes()).toContain('@3xl:order-2')
    expect((await mountLayout('collage', { options: { textPosition: 'left' } })).find('[data-hero-text]').classes()).toContain('@3xl:order-1')
    expect((await mountLayout('collage', { options: { textPosition: 'right' } })).find('[data-hero-text]').classes()).toContain('@3xl:order-3')
  })

  it('banner: puts the photo strip above or below the names', async () => {
    expect((await mountLayout('banner', { options: { photoPosition: 'below' } })).find('section').classes()).toContain('flex-col-reverse')
    expect((await mountLayout('banner', { options: { photoPosition: 'above' } })).find('section').classes()).not.toContain('flex-col-reverse')
  })

  it('filmstrip: always shows five frames, below or above the names', async () => {
    const below = await mountLayout('filmstrip', { content: { ...content, layoutPhotos: layoutPhotos.slice(0, 2) } })
    expect(below.findAll('[data-filmstrip] > *')).toHaveLength(5)
    expect(comesBefore(below, '<h1', 'data-filmstrip')).toBe(true)

    const above = await mountLayout('filmstrip', { options: { photoPosition: 'above' } })
    expect(comesBefore(above, 'data-filmstrip', '<h1')).toBe(true)
  })

  it('polaroid: puts the photos on photoSide', async () => {
    const wrapper = await mountLayout('polaroid', { options: { photoSide: 'left' } })

    expect(wrapper.find('[data-polaroids]').classes()).toContain('@3xl:col-start-1')
    expect(wrapper.find('[data-hero-text]').classes()).toContain('@3xl:col-start-2')
  })

  it('framed: puts the photo on photoSide and the eyebrow under the names', async () => {
    const wrapper = await mountLayout('framed', { options: { photoSide: 'right' } })

    expect(wrapper.find('[data-hero-photo]').classes()).toContain('@3xl:col-start-2')
    expect(comesBefore(wrapper, '<h1', 'Together with their families')).toBe(true)
  })

  it('offset-frame: puts the block and photo on photoSide, the text in the other column', async () => {
    const right = await mountLayout('offset-frame')
    expect(right.find('[data-hero-photo]').classes()).toContain('@3xl:col-start-2')
    expect(right.find('[data-hero-text]').classes()).toContain('@3xl:col-start-1')

    const left = await mountLayout('offset-frame', { options: { photoSide: 'left' } })
    expect(left.find('[data-hero-photo]').classes()).toContain('@3xl:col-start-1')
    expect(left.find('[data-hero-text]').classes()).toContain('@3xl:col-start-2')
  })

  it('offset-frame: plays several photos as a slideshow, and one photo on its own', async () => {
    const several = await mountLayout('offset-frame', { content: { ...content, layoutPhotos: layoutPhotos.slice(0, 3) } })
    expect(several.find('[data-photo-carousel]').exists()).toBe(true)
    expect(several.findAll('[data-carousel-dot]')).toHaveLength(3)

    const one = await mountLayout('offset-frame', { content: { ...content, layoutPhotos: layoutPhotos.slice(0, 1) } })
    expect(one.find('[data-photo-carousel]').exists()).toBe(false)
    expect(sources(one)).toEqual(layoutPhotos.slice(0, 1))
  })

  it('offset-frame: fills the photo spot with one photo, a slideshow or the placeholder', async () => {
    // The spot is a div (absolute insets stretch a div, not an <img>); what's inside fills it
    for (const photos of [[], layoutPhotos.slice(0, 1), layoutPhotos.slice(0, 3)]) {
      const wrapper = await mountLayout('offset-frame', { content: { ...content, layoutPhotos: photos } })
      const spot = wrapper.find('[data-offset-photo]')

      expect(spot.element.tagName).toBe('DIV')
      expect(spot.classes()).toEqual(expect.arrayContaining(['@3xl:absolute', '@3xl:top-[24%]', '@3xl:bottom-0']))
      expect((spot.element.firstElementChild as HTMLElement).classList).toContain('size-full')
    }
  })

  it('offset-frame: labels the date and venue under the button', async () => {
    const wrapper = await mountLayout('offset-frame')
    const details = wrapper.find('[data-hero-details]')

    expect(details.findAll('dt').map(dt => dt.text())).toEqual(['Date', 'Location'])
    expect(details.findAll('dd').map(dd => dd.text())).toEqual(['Saturday, 14 February 2027', 'Manila Cathedral'])
    expect(comesBefore(wrapper, 'href="#rsvp"', 'data-hero-details')).toBe(true)
  })

  it('offset-frame: draws the block in the background\'s button colour', async () => {
    expect((await mountLayout('offset-frame', { background: 'light' })).find('[data-offset-block]').classes()).toContain('bg-(--site-button-light)')
    expect((await mountLayout('offset-frame', { background: 'primary' })).find('[data-offset-block]').classes()).toContain('bg-(--site-button-primary)')
  })
})
