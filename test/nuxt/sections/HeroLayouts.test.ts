import type { Component } from 'vue'
import type { HeroContent } from '~/features/sections/section.content.type'
import type { SectionBackground } from '~/features/sections/section.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import HeroCentered from '~/components/sections/hero/HeroCentered.vue'
import HeroTextBottom from '~/components/sections/hero/HeroTextBottom.vue'
import HeroTextBottomLeft from '~/components/sections/hero/HeroTextBottomLeft.vue'
import HeroTextBottomRight from '~/components/sections/hero/HeroTextBottomRight.vue'
import HeroTextLeft from '~/components/sections/hero/HeroTextLeft.vue'
import HeroTextRight from '~/components/sections/hero/HeroTextRight.vue'
import HeroTextTop from '~/components/sections/hero/HeroTextTop.vue'
import HeroTextTopLeft from '~/components/sections/hero/HeroTextTopLeft.vue'
import HeroTextTopRight from '~/components/sections/hero/HeroTextTopRight.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import { sectionBackgrounds } from '~/features/sections/section.type'

const background = 'https://example.com/background.jpg'
const layoutImage = 'https://example.com/couple.jpg'

const content: HeroContent = {
  eyebrow: 'Together with their families',
  title: 'Ana & Marco',
  subtitle: 'invite you to celebrate their wedding',
  date: 'Saturday, 12 June 2027',
  location: 'Tagaytay, Philippines',
  cta: { label: 'RSVP', href: '#rsvp' },
  backgroundImageUrl: background,
  layoutImageUrl: layoutImage,
}

// Where each layout puts the text, and so the overlay and the layout image.
//  - vertical: how the frame positions the content
//  - overlay:  a class only that overlay has (see SectionFrame)
//  - side:     text column from 768px for left/right layouts; layout image takes the other column
//  - imageFirst: for centred layouts, whether the layout image comes before the text
const layouts: {
  key: string
  component: Component
  vertical: 'justify-start' | 'justify-center' | 'justify-end'
  overlay: string
  side?: { text: string, image: string }
  imageFirst?: boolean
}[] = [
  { key: 'centered', component: HeroCentered, vertical: 'justify-center', overlay: 'bg-(--site-photo-overlay)', imageFirst: true },
  { key: 'text-left', component: HeroTextLeft, vertical: 'justify-center', overlay: '@3xl:bg-linear-to-r', side: { text: '@3xl:col-start-1', image: '@3xl:col-start-2' } },
  { key: 'text-right', component: HeroTextRight, vertical: 'justify-center', overlay: '@3xl:bg-linear-to-l', side: { text: '@3xl:col-start-2', image: '@3xl:col-start-1' } },
  { key: 'text-bottom-left', component: HeroTextBottomLeft, vertical: 'justify-end', overlay: 'bg-linear-to-t', side: { text: '@3xl:col-start-1', image: '@3xl:col-start-2' } },
  { key: 'text-bottom-right', component: HeroTextBottomRight, vertical: 'justify-end', overlay: 'bg-linear-to-t', side: { text: '@3xl:col-start-2', image: '@3xl:col-start-1' } },
  { key: 'text-bottom', component: HeroTextBottom, vertical: 'justify-end', overlay: 'bg-linear-to-t', imageFirst: true },
  { key: 'text-top-right', component: HeroTextTopRight, vertical: 'justify-start', overlay: 'bg-linear-to-b', side: { text: '@3xl:col-start-2', image: '@3xl:col-start-1' } },
  { key: 'text-top-left', component: HeroTextTopLeft, vertical: 'justify-start', overlay: 'bg-linear-to-b', side: { text: '@3xl:col-start-1', image: '@3xl:col-start-2' } },
  { key: 'text-top', component: HeroTextTop, vertical: 'justify-start', overlay: 'bg-linear-to-b', imageFirst: false },
]

const mountLayout = (component: Component, props: { content: HeroContent, background: SectionBackground }) =>
  mountSuspended(component, { props })

const imageSources = (wrapper: Awaited<ReturnType<typeof mountLayout>>) =>
  wrapper.findAll('img').map(img => img.attributes('src'))

describe.each(layouts)('hero layout $key', ({ component, vertical, overlay, side, imageFirst }) => {
  it('positions the text', async () => {
    const wrapper = await mountLayout(component, { content, background: 'light' })

    expect(wrapper.find('h1').text()).toBe('Ana & Marco')
    expect(wrapper.find('section').classes()).toContain(vertical)
    if (side)
      expect(wrapper.find('h1').element.closest(`[class*="${side.text}"]`)).not.toBeNull()
  })

  it('shows the background image with its overlay only on the photo background', async () => {
    const onPhoto = await mountLayout(component, { content, background: 'photo' })
    expect(imageSources(onPhoto)).toContain(background)
    expect(onPhoto.find('img + div').classes()).toContain(overlay)

    const onLight = await mountLayout(component, { content, background: 'light' })
    expect(imageSources(onLight)).not.toContain(background)
  })

  it('shows the layout image on any background, in the space the text does not use', async () => {
    const wrapper = await mountLayout(component, { content, background: 'light' })
    const image = wrapper.findAll('img').find(img => img.attributes('src') === layoutImage)!

    expect(image).toBeDefined()
    if (side) {
      expect(image.classes()).toContain(side.image)
      // Above the text on narrow screens
      expect(image.classes()).toContain('order-first')
    }
    else {
      const html = wrapper.html()
      expect(html.indexOf(layoutImage) < html.indexOf('<h1')).toBe(imageFirst)
    }
  })

  it('leaves the layout image out when there is none', async () => {
    const wrapper = await mountLayout(component, { content: { ...content, layoutImageUrl: undefined }, background: 'light' })

    expect(imageSources(wrapper)).not.toContain(layoutImage)
  })

  it.each(sectionBackgrounds)('applies the %s background', async (background) => {
    const wrapper = await mountLayout(component, { content, background })

    for (const className of backgroundStyles[background].root.split(' '))
      expect(wrapper.find('section').classes()).toContain(className)
  })

  it('renders as the primary background when the photo background has no background image', async () => {
    const wrapper = await mountLayout(component, { content: { ...content, backgroundImageUrl: undefined }, background: 'photo' })

    expect(imageSources(wrapper)).not.toContain(background)
    for (const className of backgroundStyles.primary.root.split(' '))
      expect(wrapper.find('section').classes()).toContain(className)
  })
})

describe('hero content', () => {
  it('renders all content', async () => {
    const wrapper = await mountLayout(HeroCentered, { content, background: 'light' })

    expect(wrapper.text()).toContain('Together with their families')
    expect(wrapper.text()).toContain('invite you to celebrate their wedding')
    expect(wrapper.text()).toContain('Saturday, 12 June 2027')
    expect(wrapper.text()).toContain('Tagaytay, Philippines')
    expect(wrapper.find('a').attributes('href')).toBe('#rsvp')
  })

  it('renders only the title when the optional content is missing', async () => {
    const wrapper = await mountLayout(HeroCentered, { content: { title: 'Ana & Marco' }, background: 'light' })

    expect(wrapper.find('h1').text()).toBe('Ana & Marco')
    expect(wrapper.findAll('p')).toHaveLength(0)
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.find('img').exists()).toBe(false)
  })
})
