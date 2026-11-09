import type { Component } from 'vue'
import type { MessageContent } from '~/features/sections/message/message.type'
import type { SectionBackground } from '~/features/sections/section.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import MessageCard from '~/components/sections/message/MessageCard.vue'
import MessageEditorial from '~/components/sections/message/MessageEditorial.vue'
import MessageInline from '~/components/sections/message/MessageInline.vue'
import MessageOverlap from '~/components/sections/message/MessageOverlap.vue'
import MessagePhotoMiddle from '~/components/sections/message/MessagePhotoMiddle.vue'
import MessagePolaroid from '~/components/sections/message/MessagePolaroid.vue'
import MessagePortrait from '~/components/sections/message/MessagePortrait.vue'
import MessagePostcard from '~/components/sections/message/MessagePostcard.vue'
import MessageSidePhoto from '~/components/sections/message/MessageSidePhoto.vue'
import MessageSplit from '~/components/sections/message/MessageSplit.vue'
import MessageStacked from '~/components/sections/message/MessageStacked.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import { resolveLayoutOptions } from '~/features/sections/section.options'
import { getSectionLayout } from '~/features/sections/section.registry'
import { sampleOccasion } from '~/features/sections/section.type'

const backgroundPhoto = 'https://example.com/background.jpg'
const layoutPhoto = 'https://example.com/couple.jpg'

const content: MessageContent = {
  eyebrow: 'A note from us',
  heading: 'Welcome, family & friends',
  body: 'We are so glad you\'re here.\nWe can\'t imagine this day without you.',
  signature: 'With love, Bea & Carlo',
  backgroundPhoto,
  layoutPhotos: [layoutPhoto],
}

// Each layout, and whether its text sits on its own light card (so the background photo gets no overlay)
const layouts: { key: string, component: Component, onCard?: boolean }[] = [
  { key: 'stacked', component: MessageStacked },
  { key: 'split', component: MessageSplit },
  { key: 'side-photo', component: MessageSidePhoto },
  { key: 'polaroid', component: MessagePolaroid },
  { key: 'portrait', component: MessagePortrait },
  { key: 'card', component: MessageCard, onCard: true },
  { key: 'overlap', component: MessageOverlap, onCard: true },
  { key: 'postcard', component: MessagePostcard, onCard: true },
  { key: 'editorial', component: MessageEditorial },
  { key: 'inline', component: MessageInline },
  { key: 'photo-middle', component: MessagePhotoMiddle },
]

const definitionOf = (key: string) => getSectionLayout('message', key)!

// Mounts a layout like SectionRenderer does: its options with defaults filled in
const mountLayout = (key: string, props: { content?: MessageContent, background?: SectionBackground, options?: Record<string, string> } = {}) => {
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
// Position of one element before another in the rendered HTML
const comesBefore = (wrapper: Wrapper, first: string, second: string) => {
  const html = wrapper.html()
  return html.indexOf(first) < html.indexOf(second)
}

describe.each(layouts)('message layout $key', ({ key, onCard }) => {
  it('renders the eyebrow, heading, message and signature in that order', async () => {
    const wrapper = await mountLayout(key)

    expect(wrapper.text()).toContain('A note from us')
    expect(wrapper.find('h2').text()).toBe('Welcome, family & friends')
    expect(wrapper.find('[data-message-body]').text()).toContain('We are so glad you\'re here.')
    expect(wrapper.find('[data-message-signature]').text()).toBe('With love, Bea & Carlo')
    expect(comesBefore(wrapper, 'A note from us', '<h2')).toBe(true)
    expect(comesBefore(wrapper, '<h2', 'data-message-body')).toBe(true)
    expect(comesBefore(wrapper, 'data-message-body', 'data-message-signature')).toBe(true)
  })

  it('keeps the message\'s line breaks', async () => {
    const wrapper = await mountLayout(key)

    expect(wrapper.find('[data-message-body]').classes()).toContain('whitespace-pre-line')
  })

  it('declares one layout photo', () => {
    expect(definitionOf(key).layoutPhotoCount).toBe(1)
  })

  it('shows its layout photo, and the background photo only on the photo background', async () => {
    expect(sources(await mountLayout(key, { background: 'light' }))).toEqual([layoutPhoto])
    expect(sources(await mountLayout(key, { background: 'photo' }))).toEqual([backgroundPhoto, layoutPhoto])
  })

  it('never shows the background photo on a colour background', async () => {
    for (const background of definitionOf(key).backgrounds.filter(b => b !== 'photo'))
      expect(sources(await mountLayout(key, { background }))).not.toContain(backgroundPhoto)
  })

  it(key === 'portrait' ? 'leaves the photo out when there is none (a plain letter)' : 'keeps its shape with a placeholder when there is no photo', async () => {
    const wrapper = await mountLayout(key, { content: { ...content, backgroundPhoto: undefined, layoutPhotos: [] } })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.findAll('[data-photo-placeholder]')).toHaveLength(key === 'portrait' ? 0 : 1)
  })

  it(`on the photo background, shows the background photo ${onCard ? 'without an overlay (the text has its own card)' : 'under an overlay'}, with the photo colours`, async () => {
    const wrapper = await mountLayout(key, { background: 'photo' })
    const section = wrapper.find('section')

    expect(section.find(':scope > img').attributes('src')).toBe(backgroundPhoto)
    expect(section.find(':scope > img + [class~="-z-10"]').exists()).toBe(!onCard)
    for (const className of backgroundStyles.photo.root.split(' '))
      expect(section.classes()).toContain(className)
  })

  it('applies each background it supports', async () => {
    for (const background of definitionOf(key).backgrounds) {
      const wrapper = await mountLayout(key, { background })
      for (const className of backgroundStyles[background].root.split(' '))
        expect(wrapper.find('section').classes()).toContain(className)
    }
  })

  it('renders only the message when the optional content is missing', async () => {
    const wrapper = await mountLayout(key, { content: { body: 'Welcome!', layoutPhotos: [] } })

    expect(wrapper.find('[data-message-body]').text()).toBe('Welcome!')
    expect(wrapper.find('h2').exists()).toBe(false)
    expect(wrapper.find('[data-message-heading]').exists()).toBe(false)
    expect(wrapper.find('[data-message-signature]').exists()).toBe(false)
  })

  it('leaves the message out when it is empty', async () => {
    const wrapper = await mountLayout(key, { content: { ...content, body: '' } })

    expect(wrapper.find('[data-message-body]').exists()).toBe(false)
    expect(wrapper.find('h2').exists()).toBe(true)
  })
})

describe('placement options', () => {
  // The photo's place in the grid or row on wide screens
  const photoClasses = async (key: string, options: Record<string, string>) =>
    (await mountLayout(key, { options })).find('[data-message-photo]').classes()

  it('stacked: puts the photo across the top and aligns the note by textAlign', async () => {
    const wrapper = await mountLayout('stacked')
    expect(comesBefore(wrapper, 'data-message-photo', 'data-message-text')).toBe(true)
    expect(wrapper.find('[data-message-text]').classes()).toContain('text-center')

    expect((await mountLayout('stacked', { options: { textAlign: 'start' } })).find('[data-message-text]').classes()).toContain('text-start')
  })

  it('split: puts the photo on photoSide and the note in the other half', async () => {
    expect(await photoClasses('split', {})).toContain('@3xl:col-start-1')

    const wrapper = await mountLayout('split', { options: { photoSide: 'right' } })
    expect(wrapper.find('[data-message-photo]').classes()).toContain('@3xl:col-start-2')
    expect(wrapper.find('[data-message-column]').classes()).toContain('@3xl:col-start-1')
  })

  it('side-photo: frames the photo in an arch by default, or plain or a print border', async () => {
    const arch = await mountLayout('side-photo')
    expect(arch.find('[data-message-photo]').classes()).toContain('rounded-t-full')

    const plain = await mountLayout('side-photo', { options: { frame: 'plain' } })
    expect(plain.find('[data-message-photo]').classes()).toContain('rounded-(--site-radius)')
    expect(plain.find('[data-message-frame]').classes()).not.toContain('bg-white')

    const framed = await mountLayout('side-photo', { options: { frame: 'framed' } })
    expect(framed.find('[data-message-photo]').classes()).not.toContain('rounded-t-full')
    expect(framed.find('[data-message-frame]').classes()).toContain('bg-white')
  })

  it('side-photo and polaroid: put the photo on photoSide', async () => {
    for (const key of ['side-photo', 'polaroid']) {
      const row = async (photoSide: string) => (await mountLayout(key, { options: { photoSide } })).find('.mx-auto').classes()
      expect(await row('left'), key).toContain('@3xl:flex-row')
      expect(await row('right'), key).toContain('@3xl:flex-row-reverse')
    }
  })

  it('polaroid: tilts the photo in a white print border', async () => {
    const wrapper = await mountLayout('polaroid')

    expect(wrapper.find('[data-message-polaroid]').classes()).toEqual(expect.arrayContaining(['bg-white', '-rotate-6']))
  })

  it('portrait: puts the round photo on top, or beside the signature', async () => {
    const top = await mountLayout('portrait')
    expect(comesBefore(top, 'data-message-photo', '<h2')).toBe(true)
    expect(top.find('[data-message-photo]').classes()).toContain('rounded-full')

    const bySignature = await mountLayout('portrait', { options: { photoPlacement: 'signature' } })
    expect(comesBefore(bySignature, 'data-message-body', 'data-message-photo')).toBe(true)
    expect(comesBefore(bySignature, 'data-message-photo', 'data-message-signature')).toBe(true)
  })

  it('card: puts the note on a light card with the photo on photoCorner', async () => {
    const wrapper = await mountLayout('card')
    for (const className of backgroundStyles.light.root.split(' '))
      expect(wrapper.find('[data-message-card]').classes()).toContain(className)
    expect(wrapper.find('[data-message-corner]').classes()).toContain('-right-3')

    expect((await mountLayout('card', { options: { photoCorner: 'left' } })).find('[data-message-corner]').classes()).toContain('-left-3')
  })

  it('overlap: puts the photo on photoSide and the light panel over its edge', async () => {
    const left = await mountLayout('overlap')
    expect(left.find('[data-message-photo]').classes()).toContain('@3xl:col-start-1')
    expect(left.find('[data-message-panel]').classes()).toContain('@3xl:col-start-6')
    for (const className of backgroundStyles.light.root.split(' '))
      expect(left.find('[data-message-panel]').classes()).toContain(className)

    const right = await mountLayout('overlap', { options: { photoSide: 'right' } })
    expect(right.find('[data-message-photo]').classes()).toContain('@3xl:col-start-6')
    expect(right.find('[data-message-panel]').classes()).toContain('@3xl:col-start-2')
  })

  it('postcard: puts the photo on photoSide of a light card, with a stamp', async () => {
    const wrapper = await mountLayout('postcard')
    const card = wrapper.find('[data-message-postcard]')
    expect(card.classes()).toContain('@3xl:flex-row')
    for (const className of backgroundStyles.light.root.split(' '))
      expect(card.classes()).toContain(className)
    expect(wrapper.find('[data-message-stamp]').exists()).toBe(true)

    expect((await mountLayout('postcard', { options: { photoSide: 'right' } })).find('[data-message-postcard]').classes()).toContain('@3xl:flex-row-reverse')
  })

  it('editorial: puts the heading and message side by side, the photo below or above them', async () => {
    const below = await mountLayout('editorial')
    expect(below.find('[data-message-text]').classes()).toContain('@3xl:grid-cols-2')
    expect(below.find('[data-message-editorial]').classes()).toContain('flex-col')

    expect((await mountLayout('editorial', { options: { photoPosition: 'above' } })).find('[data-message-editorial]').classes()).toContain('flex-col-reverse')
  })

  it('inline: floats a square photo on photoSide from the top of the note, with a drop cap', async () => {
    const wrapper = await mountLayout('inline')
    expect(wrapper.find('[data-message-photo]').classes()).toEqual(expect.arrayContaining(['float-right', 'aspect-square']))
    // Floated before the heading, so a short note sits level with the photo and the message wraps around it
    expect(comesBefore(wrapper, 'data-message-photo', 'data-message-heading')).toBe(true)
    expect(wrapper.find('[data-message-text]').find('[data-message-heading]').exists()).toBe(true)
    expect(wrapper.find('[data-message-text]').find('[data-message-body]').exists()).toBe(true)
    expect(wrapper.find('[data-message-body]').classes()).toContain('first-letter:text-6xl')

    expect(await photoClasses('inline', { photoSide: 'left' })).toContain('float-left')
  })

  it('photo-middle: puts the photo between the heading and the message, aligned by textAlign', async () => {
    const wrapper = await mountLayout('photo-middle')
    expect(comesBefore(wrapper, '<h2', 'data-message-photo')).toBe(true)
    expect(comesBefore(wrapper, 'data-message-photo', 'data-message-body')).toBe(true)
    expect(wrapper.find('[data-message-text]').classes()).toContain('text-center')

    expect((await mountLayout('photo-middle', { options: { textAlign: 'start' } })).find('[data-message-text]').classes()).toContain('text-start')
  })
})
