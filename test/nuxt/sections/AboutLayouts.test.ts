import type { Component } from 'vue'
import type { AboutContent } from '~/features/sections/about/about.type'
import type { SectionBackground } from '~/features/sections/section.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import AboutDivider from '~/components/sections/about/AboutDivider.vue'
import AboutMagazine from '~/components/sections/about/AboutMagazine.vue'
import AboutMosaic from '~/components/sections/about/AboutMosaic.vue'
import AboutPhotoRow from '~/components/sections/about/AboutPhotoRow.vue'
import AboutPortrait from '~/components/sections/about/AboutPortrait.vue'
import AboutScrapbook from '~/components/sections/about/AboutScrapbook.vue'
import AboutSplit from '~/components/sections/about/AboutSplit.vue'
import AboutTimelineCards from '~/components/sections/about/AboutTimelineCards.vue'
import AboutTimelineCompact from '~/components/sections/about/AboutTimelineCompact.vue'
import AboutTimelineList from '~/components/sections/about/AboutTimelineList.vue'
import AboutTimelinePolaroids from '~/components/sections/about/AboutTimelinePolaroids.vue'
import AboutTimelineZigzag from '~/components/sections/about/AboutTimelineZigzag.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import { resolveLayoutOptions } from '~/features/sections/section.options'
import { getSectionLayout, getSectionType } from '~/features/sections/section.registry'
import { sampleOccasion } from '~/features/sections/section.type'

const backgroundPhoto = 'https://example.com/background.jpg'
const layoutPhotos = ['https://example.com/1.jpg', 'https://example.com/2.jpg', 'https://example.com/3.jpg']
const chapterPhotos = ['https://example.com/c1.jpg', 'https://example.com/c2.jpg', 'https://example.com/c3.jpg']

const content: AboutContent = {
  eyebrow: 'Our story',
  heading: 'How we met',
  body: 'We met in 2019 at a friend\'s birthday.\nCarlo spilled coffee.\n\nFive years later, we\'re ready.',
  timeline: [
    { eyebrow: '2019 · How we met', heading: 'Spilled coffee', body: 'Carlo knocked his coffee over.', photo: chapterPhotos[0] },
    { eyebrow: '2021 · Long distance', heading: 'Two cities, one love', body: 'Work took Bea to Cebu.', photo: chapterPhotos[1] },
    { eyebrow: '2025 · The proposal', heading: 'Yes, in Batangas', body: 'On the beach, Carlo asked.', photo: chapterPhotos[2] },
  ],
  backgroundPhoto,
  layoutPhotos,
}

// Story layouts show the story and their layout photos (how many, how many placeholders without photos); timeline
// layouts show the chapters, with their photos unless text only. `onCard`: the text has its own surface, no overlay.
const storyLayouts: { key: string, component: Component, photoCount: number, placeholderCount?: number, onCard?: boolean }[] = [
  { key: 'split', component: AboutSplit, photoCount: 3 },
  { key: 'photo-row', component: AboutPhotoRow, photoCount: 3 },
  { key: 'mosaic', component: AboutMosaic, photoCount: 3 },
  { key: 'divider', component: AboutDivider, photoCount: 2 },
  // The second and third photos only show once added
  { key: 'portrait', component: AboutPortrait, photoCount: 3, placeholderCount: 1 },
  { key: 'scrapbook', component: AboutScrapbook, photoCount: 3, onCard: true },
  { key: 'magazine', component: AboutMagazine, photoCount: 3 },
]
const timelineLayouts: { key: string, component: Component, chapterPhotos: boolean }[] = [
  { key: 'timeline-zigzag', component: AboutTimelineZigzag, chapterPhotos: true },
  { key: 'timeline-list', component: AboutTimelineList, chapterPhotos: true },
  { key: 'timeline-cards', component: AboutTimelineCards, chapterPhotos: true },
  { key: 'timeline-polaroids', component: AboutTimelinePolaroids, chapterPhotos: true },
  { key: 'timeline-compact', component: AboutTimelineCompact, chapterPhotos: false },
]
const allLayouts = [...storyLayouts, ...timelineLayouts]

const definitionOf = (key: string) => getSectionLayout('about', key)!

// Mounts a layout like SectionRenderer does: its options with defaults filled in
const mountLayout = (key: string, props: { content?: AboutContent, background?: SectionBackground, options?: Record<string, string> } = {}) => {
  const definition = definitionOf(key)
  const component = allLayouts.find(layout => layout.key === key)!.component
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
const comesBefore = (wrapper: Wrapper, first: string, second: string) => {
  const html = wrapper.html()
  return html.indexOf(first) < html.indexOf(second)
}
const paragraphs = (wrapper: Wrapper) => wrapper.findAll('[data-about-paragraph]').map(p => p.text())

it('registers the seven story and five timeline layouts in picker order', () => {
  expect(getSectionType('about').layouts.map(layout => layout.key)).toEqual(allLayouts.map(layout => layout.key))
})

describe.each(allLayouts)('about layout $key', ({ key }) => {
  it('renders the eyebrow and heading', async () => {
    const wrapper = await mountLayout(key)

    expect(wrapper.text()).toContain('Our story')
    expect(wrapper.find('h2').text()).toBe('How we met')
  })

  it('never shows the background photo on a colour background', async () => {
    for (const background of definitionOf(key).backgrounds.filter(b => b !== 'photo'))
      expect(sources(await mountLayout(key, { background }))).not.toContain(backgroundPhoto)
  })

  it('applies each background it supports', async () => {
    for (const background of definitionOf(key).backgrounds) {
      const wrapper = await mountLayout(key, { background })
      for (const className of backgroundStyles[background].root.split(' '))
        expect(wrapper.find('section').classes()).toContain(className)
    }
  })

  it('leaves out the eyebrow, heading and story when they are missing', async () => {
    const wrapper = await mountLayout(key, { content: { timeline: [], layoutPhotos: [] } })

    expect(wrapper.find('[data-about-heading]').exists()).toBe(false)
    expect(wrapper.findAll('[data-about-paragraph]')).toHaveLength(0)
  })
})

describe.each(storyLayouts)('about story layout $key', ({ key, photoCount, placeholderCount = photoCount, onCard }) => {
  it('tells the story, one paragraph per blank line, keeping single line breaks', async () => {
    const wrapper = await mountLayout(key)

    expect(paragraphs(wrapper)).toEqual(['We met in 2019 at a friend\'s birthday.\nCarlo spilled coffee.', 'Five years later, we\'re ready.'])
    expect(wrapper.find('[data-about-paragraph]').classes()).toContain('whitespace-pre-line')
  })

  it('leaves the timeline out', async () => {
    const wrapper = await mountLayout(key)

    expect(wrapper.find('[data-about-timeline]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Spilled coffee')
  })

  it(`declares and shows ${photoCount} layout photos, and the background photo only on the photo background`, async () => {
    expect(definitionOf(key).layoutPhotoCount).toBe(photoCount)
    expect(sources(await mountLayout(key, { background: 'light' }))).toEqual(layoutPhotos.slice(0, photoCount))
    expect(sources(await mountLayout(key, { background: 'photo' }))).toEqual([backgroundPhoto, ...layoutPhotos.slice(0, photoCount)])
  })

  it('keeps its shape with placeholders when there are no photos', async () => {
    const wrapper = await mountLayout(key, { content: { ...content, backgroundPhoto: undefined, layoutPhotos: [] } })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.findAll('[data-photo-placeholder]')).toHaveLength(placeholderCount)
  })

  it(`on the photo background, ${onCard ? 'needs no overlay (the story has its own paper)' : 'puts the photo under an overlay'}`, async () => {
    const section = (await mountLayout(key, { background: 'photo' })).find('section')

    expect(section.find(':scope > img + [class~="-z-10"]').exists()).toBe(!onCard)
  })
})

describe.each(timelineLayouts)('about timeline layout $key', ({ key, chapterPhotos: showsPhotos }) => {
  it('shows every chapter in order with its eyebrow, heading and text', async () => {
    const wrapper = await mountLayout(key)
    const chapters = wrapper.findAll('[data-about-chapter]')

    expect(chapters).toHaveLength(3)
    expect(chapters.map(chapter => chapter.find('h3').text())).toEqual(['Spilled coffee', 'Two cities, one love', 'Yes, in Batangas'])
    expect(chapters[0]!.text()).toContain('2019 · How we met')
    expect(chapters[0]!.find('[data-chapter-body]').text()).toBe('Carlo knocked his coffee over.')
  })

  it('shows the story as an intro, when there is one', async () => {
    expect(paragraphs(await mountLayout(key))).toHaveLength(2)
    expect((await mountLayout(key, { content: { ...content, body: undefined } })).find('[data-about-body]').exists()).toBe(false)
  })

  it(showsPhotos ? 'shows each chapter\'s photo (a placeholder when missing), never the layout photos' : 'shows no photos inside the layout', async () => {
    expect(definitionOf(key).layoutPhotoCount).toBe(0)
    expect(sources(await mountLayout(key, { background: 'light' }))).toEqual(showsPhotos ? chapterPhotos : [])

    const withoutPhotos = await mountLayout(key, { content: { ...content, timeline: content.timeline.map(({ photo: _, ...item }) => item) } })
    expect(withoutPhotos.findAll('[data-photo-placeholder]')).toHaveLength(showsPhotos ? 3 : 0)
  })

  it('shows only the heading and intro without chapters', async () => {
    const wrapper = await mountLayout(key, { content: { ...content, timeline: [] } })

    expect(wrapper.find('[data-about-timeline]').exists()).toBe(false)
    expect(wrapper.find('h2').text()).toBe('How we met')
  })

  it('leaves out a chapter\'s eyebrow and text when missing', async () => {
    const wrapper = await mountLayout(key, { content: { ...content, timeline: [{ heading: 'Just a heading' }] } })
    const chapter = wrapper.find('[data-about-chapter]')

    expect(chapter.find('h3').text()).toBe('Just a heading')
    expect(chapter.find('[data-chapter-body]').exists()).toBe(false)
    expect(chapter.findAll('p')).toHaveLength(0)
  })
})

describe('placement options', () => {
  const classesOf = async (key: string, selector: string, options: Record<string, string> = {}) =>
    (await mountLayout(key, { options })).find(selector).classes()

  it('split: puts the photos on photoSide and the story in the other half', async () => {
    expect(await classesOf('split', '[data-about-photos]')).toContain('@3xl:col-start-1')
    expect(await classesOf('split', '[data-about-photos]', { photoSide: 'right' })).toContain('@3xl:col-start-2')
    expect(await classesOf('split', '[data-about-column]', { photoSide: 'right' })).toContain('@3xl:col-start-1')
  })

  it('photo-row: puts the photos below or above, the text stacked or side by side, aligned by textAlign', async () => {
    expect(await classesOf('photo-row', '[data-about-stack]')).toContain('flex-col')
    expect(await classesOf('photo-row', '[data-about-stack]', { photoPosition: 'above' })).toContain('flex-col-reverse')
    expect(await classesOf('photo-row', '[data-about-text]')).toContain('text-center')
    expect(await classesOf('photo-row', '[data-about-text]', { textAlign: 'start' })).toContain('text-start')
    expect(await classesOf('photo-row', '[data-about-text]', { textLayout: 'side' })).toContain('@3xl:grid-cols-2')
  })

  it('mosaic and divider: put the photos on photoSide', async () => {
    expect(await classesOf('mosaic', '[data-about-row]')).toContain('@3xl:flex-row')
    expect(await classesOf('mosaic', '[data-about-row]', { photoSide: 'left' })).toContain('@3xl:flex-row-reverse')
    expect(await classesOf('divider', '[data-about-photo-column]')).toContain('@3xl:col-start-1')
    expect(await classesOf('divider', '[data-about-photo-column]', { photoSide: 'right' })).toContain('@3xl:col-start-2')
  })

  it('divider: sits the second photo, round, on the line between the photo and the story', async () => {
    const wrapper = await mountLayout('divider')

    expect(wrapper.find('[data-about-round] img').attributes('src')).toBe(layoutPhotos[1])
    expect(wrapper.find('[data-about-round]').classes()).toContain('@3xl:translate-x-1/2')
    expect(wrapper.find('[data-about-column]').classes()).toContain('@3xl:border-s')
  })

  it('portrait: frames the portrait by frame, with the other photos as small circles', async () => {
    expect(await classesOf('portrait', '[data-frame]')).toContain('rounded-[50%]')
    expect(await classesOf('portrait', '[data-frame]', { frame: 'arch' })).toContain('rounded-t-full')
    expect(await classesOf('portrait', '[data-frame]', { frame: 'circle' })).toContain('rounded-full')
    expect((await mountLayout('portrait')).findAll('[data-about-extras] img').map(img => img.attributes('src'))).toEqual(layoutPhotos.slice(1))
    expect(await classesOf('portrait', '[data-about-text]', { textAlign: 'start' })).toContain('text-start')
  })

  it('scrapbook: puts the instant photos on photoSide and the story on a light note', async () => {
    const wrapper = await mountLayout('scrapbook')

    expect(wrapper.findAll('[data-about-polaroid]')).toHaveLength(3)
    for (const className of backgroundStyles.light.root.split(' '))
      expect(wrapper.find('[data-about-note]').classes()).toContain(className)
    expect(await classesOf('scrapbook', '[data-about-scrapbook]', { photoSide: 'right' })).toContain('@3xl:flex-row-reverse')
  })

  it('magazine: floats the first photo from the top of the story on photoSide, with a drop cap, the rest below', async () => {
    const wrapper = await mountLayout('magazine')
    const floated = wrapper.find('[data-about-text] img')

    expect(floated.attributes('src')).toBe(layoutPhotos[0])
    expect(floated.classes()).toContain('float-right')
    expect(comesBefore(wrapper, layoutPhotos[0]!, '<h2')).toBe(true)
    expect(wrapper.find('[data-about-paragraph]').classes()).toContain('first-letter:text-6xl')
    expect(wrapper.findAll('[data-about-photos] img').map(img => img.attributes('src'))).toEqual(layoutPhotos.slice(1))
    expect((await mountLayout('magazine', { options: { photoSide: 'left' } })).find('[data-about-text] img').classes()).toContain('float-left')
  })

  it('timeline-zigzag: alternates the photo side, starting from firstPhotoSide', async () => {
    const sides = async (options: Record<string, string>) =>
      (await mountLayout('timeline-zigzag', { options })).findAll('[data-about-chapter]').map(chapter => chapter.attributes('data-photo-side'))

    expect(await sides({})).toEqual(['left', 'right', 'left'])
    expect(await sides({ firstPhotoSide: 'right' })).toEqual(['right', 'left', 'right'])
  })

  it('timeline-zigzag: draws the centre line and dots, or leaves them out when line is hidden', async () => {
    const shown = await mountLayout('timeline-zigzag')
    expect(shown.find('[data-about-line]').exists()).toBe(true)
    expect(shown.findAll('[data-about-dot]')).toHaveLength(3)
    expect(shown.find('[data-about-chapter]').classes()).toContain('ps-8')

    const hidden = await mountLayout('timeline-zigzag', { options: { line: 'hide' } })
    expect(hidden.find('[data-about-line]').exists()).toBe(false)
    expect(hidden.find('[data-about-dot]').exists()).toBe(false)
    // No room kept for the line on phones
    expect(hidden.find('[data-about-chapter]').classes()).not.toContain('ps-8')
  })

  it('timeline-list: puts each photo on photoSide', async () => {
    expect(await classesOf('timeline-list', '[data-about-chapter]')).toContain('@2xl:grid-cols-[1fr_14rem]')
    expect(await classesOf('timeline-list', '[data-about-chapter]', { photoSide: 'left' })).toContain('@2xl:grid-cols-[14rem_1fr]')
  })

  it.each(['timeline-cards', 'timeline-polaroids'])('%s: puts the chapters in one row that scrolls sideways on every screen, centred while they fit', async (key) => {
    const timeline = await classesOf(key, '[data-about-timeline]')

    expect(timeline).toEqual(expect.arrayContaining(['flex', 'overflow-x-auto', 'snap-x']))
    expect(timeline.some(name => name.includes('grid') || name.includes('flex-wrap'))).toBe(false)
    expect(await classesOf(key, '[data-about-chapter]')).toEqual(expect.arrayContaining(['shrink-0', 'first:ms-auto', 'last:me-auto']))
  })

  it.each(['timeline-cards', 'timeline-polaroids'])('%s: scrolls the row by dragging it with the mouse once it overflows, with no arrows', async (key) => {
    const wrapper = await mountLayout(key)
    const timeline = wrapper.find('[data-about-timeline]')
    const row = timeline.element as HTMLOListElement
    expect(wrapper.find('[data-about-arrows]').exists()).toBe(false)
    expect(timeline.classes()).not.toContain('cursor-grab')

    // A row wider than its box (measured when it resizes)
    Object.defineProperties(row, { clientWidth: { value: 600 }, scrollWidth: { value: 1000 }, scrollLeft: { value: 0, writable: true } })
    await timeline.trigger('pointerdown', { pointerType: 'mouse', button: 0, clientX: 500 })
    await timeline.trigger('pointermove', { pointerType: 'mouse', clientX: 300 })
    expect(row.scrollLeft).toBe(200)
    expect(timeline.classes()).toContain('cursor-grabbing')
    // Snapping waits until the drag ends
    expect(timeline.classes()).not.toContain('snap-mandatory')

    await timeline.trigger('pointerup', { pointerType: 'mouse' })
    expect(timeline.classes()).toContain('snap-mandatory')
  })

  it.each(['timeline-cards', 'timeline-polaroids'])('%s: shows a swipe indicator under the row once it overflows, its thumb following the scroll', async (key) => {
    const wrapper = await mountLayout(key)
    expect(wrapper.find('[data-scroll-hint]').exists()).toBe(false)

    const row = wrapper.find('[data-about-timeline]').element as HTMLOListElement
    Object.defineProperties(row, { clientWidth: { value: 600 }, scrollWidth: { value: 1200 }, scrollLeft: { value: 600, writable: true } })
    row.dispatchEvent(new Event('scroll'))
    await nextTick()

    const hint = wrapper.find('[data-scroll-hint]')
    expect(hint.attributes('aria-hidden')).toBe('true')
    // Half the row shows, scrolled to its end
    expect(hint.find('[data-scroll-thumb]').attributes('style')).toBe('width: 50%; left: 50%;')
  })

  it.each(['timeline-cards', 'timeline-polaroids'])('%s: leaves touch and pen to scroll natively', async (key) => {
    const wrapper = await mountLayout(key)
    const timeline = wrapper.find('[data-about-timeline]')
    const row = timeline.element as HTMLOListElement
    Object.defineProperties(row, { clientWidth: { value: 600 }, scrollWidth: { value: 1000 }, scrollLeft: { value: 0, writable: true } })

    await timeline.trigger('pointerdown', { pointerType: 'touch', clientX: 500 })
    await timeline.trigger('pointermove', { pointerType: 'touch', clientX: 300 })
    expect(row.scrollLeft).toBe(0)
  })

  it('timeline-cards: aligns the heading and intro by textAlign', async () => {
    expect(await classesOf('timeline-cards', '[data-about-text]')).toContain('text-center')
    expect(await classesOf('timeline-cards', '[data-about-text]', { textAlign: 'start' })).toContain('text-start')
  })

  it('timeline-polaroids: captions each print with its eyebrow, heading and text', async () => {
    const shown = await mountLayout('timeline-polaroids')
    expect(shown.findAll('[data-about-polaroid]')).toHaveLength(3)
    expect(shown.find('figcaption h3').text()).toBe('Spilled coffee')
    expect(shown.findAll('figcaption [data-chapter-body]')).toHaveLength(3)

    // The caption is on the white print: dark text on every background, not the background's (light) text
    for (const background of definitionOf('timeline-polaroids').backgrounds)
      expect((await mountLayout('timeline-polaroids', { background })).find('figcaption').classes(), background).toContain('text-(--site-text)')
  })

  it('timeline-polaroids: pins each print at its top edge, on one string across the row, in the background\'s other colour', async () => {
    // The button colour: the primary on light and secondary backgrounds, the secondary on primary and photo ones
    for (const background of definitionOf('timeline-polaroids').backgrounds) {
      const wrapper = await mountLayout('timeline-polaroids', { background, content: { ...content, backgroundPhoto: undefined } })
      // Without a photo the photo background renders as primary
      const colour = `var(--site-button-${background === 'photo' ? 'primary' : background})`
      expect(wrapper.find('[data-about-string]').attributes('style'), background).toContain(colour)
      for (const pin of wrapper.findAll('[data-about-pin]'))
        expect(pin.attributes('style'), background).toContain(colour)
    }

    const wrapper = await mountLayout('timeline-polaroids')
    // One string for the whole row (not one per print), behind the prints
    expect(wrapper.findAll('[data-about-string]')).toHaveLength(1)
    expect(wrapper.find('[data-about-string]').classes()).toContain('inset-x-0')
    expect(wrapper.html().indexOf('data-about-string')).toBeLessThan(wrapper.html().indexOf('data-about-timeline'))
    // Each pin after its print, so it paints on top of the print's border
    const chapter = wrapper.find('[data-about-chapter]')
    expect(chapter.html().indexOf('data-about-polaroid')).toBeLessThan(chapter.html().indexOf('data-about-pin'))
  })

  it('timeline-polaroids: aligns the heading and intro by textAlign', async () => {
    expect(await classesOf('timeline-polaroids', '[data-about-text]')).toContain('text-center')
    expect(await classesOf('timeline-polaroids', '[data-about-text]', { textAlign: 'start' })).toContain('text-start')
  })

  it('timeline-compact: aligns the chapters by textAlign', async () => {
    expect(await classesOf('timeline-compact', '[data-chapter-text]')).toContain('text-start')
    expect(await classesOf('timeline-compact', '[data-chapter-text]', { textAlign: 'center' })).toContain('text-center')
  })
})

describe('the fields each layout declares', () => {
  // The editor offers exactly what the layout says it shows, so it must show exactly that
  it.each(allLayouts.map(layout => layout.key))('%s renders the chapters and their photos only when it declares them', async (key) => {
    const fields = definitionOf(key).fields
    const wrapper = await mountLayout(key)

    expect(wrapper.find('[data-about-chapter]').exists()).toBe(fields.includes('timeline'))
    expect(wrapper.find('[data-chapter-photo]').exists()).toBe(fields.includes('timeline.photo'))
    expect(wrapper.text().includes(content.heading!)).toBe(fields.includes('heading'))
  })
})
