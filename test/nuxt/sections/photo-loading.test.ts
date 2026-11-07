import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import SectionRenderer from '~/components/sections/SectionRenderer.vue'
import { createDefaultSection } from '~/features/sections/section.registry'

// A split hero with its own photo, on the photo background with a background photo too
const hero = {
  ...createDefaultSection('hero'),
  layout: 'split',
  background: 'photo' as const,
  content: { eyebrow: 'Together', layoutPhotos: ['https://example.com/couple.jpg'], backgroundPhoto: 'https://example.com/garden.jpg' },
}

describe('photo loading', () => {
  it('loads a section\'s photos as guests scroll near them, decoding off the main thread', async () => {
    const wrapper = await mountSuspended(SectionRenderer, { props: { section: hero } })
    const images = wrapper.findAll('img')

    expect(images.length).toBeGreaterThan(0)
    expect(images.map(img => [img.attributes('loading'), img.attributes('decoding')])).toEqual(images.map(() => ['lazy', 'async']))
  })

  it('loads the first section\'s photos right away (`priority`)', async () => {
    const wrapper = await mountSuspended(SectionRenderer, { props: { section: hero, priority: true } })

    expect(wrapper.findAll('img').map(img => img.attributes('loading'))).toEqual(wrapper.findAll('img').map(() => 'eager'))
  })
})
