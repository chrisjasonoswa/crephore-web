import type { SectionBackground } from '~/features/sections/section.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import { backgroundStyles } from '~/features/sections/section.background'
import { sectionBackgrounds } from '~/features/sections/section.type'

const photo = 'https://example.com/couple.jpg'

const mountFrame = (props: { background: SectionBackground, imageUrl?: string, overlay?: 'full' | 'top' | 'bottom' | 'start' | 'end' }, attrs: Record<string, unknown> = {}) =>
  mountSuspended(SectionFrame, {
    props,
    attrs,
    slots: {
      // Exposes what the frame hands to layouts
      default: ({ styles, background }: { styles: { button: string }, background: string }) =>
        h('p', { 'data-background': background, 'class': styles.button }, 'content'),
    },
  })

describe('SectionFrame', () => {
  it.each(sectionBackgrounds)('applies the %s background and passes its styles to the layout', async (background) => {
    const wrapper = await mountFrame({ background, imageUrl: photo })

    for (const className of backgroundStyles[background].root.split(' '))
      expect(wrapper.find('section').classes()).toContain(className)
    expect(wrapper.find('p').attributes('data-background')).toBe(background)
    expect(wrapper.find('p').classes()).toEqual(backgroundStyles[background].button.split(' '))
  })

  it('draws the photo and overlay only on the photo background', async () => {
    expect((await mountFrame({ background: 'photo', imageUrl: photo })).find('img').exists()).toBe(true)
    expect((await mountFrame({ background: 'light', imageUrl: photo })).find('img').exists()).toBe(false)
  })

  it('renders as the primary background when the photo background has no photo', async () => {
    const wrapper = await mountFrame({ background: 'photo' })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('p').attributes('data-background')).toBe('primary')
  })

  it.each([
    ['full', ['bg-(--site-photo-overlay)']],
    ['top', ['bg-linear-to-b', 'from-60%']],
    ['bottom', ['bg-linear-to-t', 'from-60%']],
    // Full overlay on narrow screens (text spans the width), gradient across from 768px
    ['start', ['bg-(--site-photo-overlay)', '@3xl:bg-linear-to-r', '@3xl:from-50%']],
    ['end', ['bg-(--site-photo-overlay)', '@3xl:bg-linear-to-l', '@3xl:from-50%']],
  ] as const)('uses the %s overlay', async (overlay, classes) => {
    const wrapper = await mountFrame({ background: 'photo', imageUrl: photo, overlay })

    expect(wrapper.find('img + div').classes()).toEqual(expect.arrayContaining([...classes]))
  })

  it('puts the layout\'s classes on the section', async () => {
    const wrapper = await mountFrame({ background: 'light' }, { class: 'min-h-svh justify-end' })

    expect(wrapper.find('section').classes()).toEqual(expect.arrayContaining(['min-h-svh', 'justify-end']))
  })
})
