import type { Section, SectionOccasion } from '~/features/sections/section.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SectionRenderer from '~/components/sections/SectionRenderer.vue'

// The page's event: the hero's and countdown's heading come from it
const occasion: SectionOccasion = { name: 'Ana & Marco', venue: 'Manila Cathedral', startsAt: '2027-02-13T16:00:00Z', timezone: 'Asia/Manila', program: { items: [] } }

const mountSection = async (section: Section, occasion?: SectionOccasion) => {
  const wrapper = await mountSuspended(SectionRenderer, { props: { section, occasion } })
  // Layouts are async components
  await flushPromises()
  return wrapper
}

describe('SectionRenderer', () => {
  it('renders the registered layout for the section', async () => {
    const wrapper = await mountSection({
      type: 'hero',
      layout: 'split',
      background: 'primary',
      content: { layoutPhotos: [] },
    }, occasion)

    expect(wrapper.find('section h1').text()).toBe('Ana & Marco')
  })

  it('passes the layout its options, defaults filled in', async () => {
    const wrapper = await mountSection({
      type: 'hero',
      layout: 'split',
      options: { photoSide: 'left' },
      background: 'light',
      content: { layoutPhotos: [] },
    }, occasion)

    // photoSide as stored, textPosition from the default ("left")
    expect(wrapper.find('[data-hero-text]').classes()).toEqual(expect.arrayContaining(['@3xl:col-start-2', 'items-start']))
  })

  it('renders nothing for an unknown layout', async () => {
    const wrapper = await mountSection({
      type: 'hero',
      layout: 'does-not-exist',
      background: 'primary',
      content: { layoutPhotos: [] },
    }, occasion)

    expect(wrapper.find('section').exists()).toBe(false)
  })
})

describe('SectionRenderer hero layouts', () => {
  it.each(['fullscreen', 'split', 'arch', 'editorial', 'overlay-card', 'collage', 'banner', 'filmstrip', 'polaroid', 'framed'])('renders the %s layout', async (layout) => {
    const wrapper = await mountSection({
      type: 'hero',
      layout,
      background: 'light',
      content: { layoutPhotos: [] },
    }, occasion)

    expect(wrapper.find('section h1').text()).toBe('Ana & Marco')
  })
})

describe('SectionRenderer occasion', () => {
  const countdown: Section = { type: 'countdown', layout: 'boxes', background: 'light', content: { showSeconds: true, layoutPhotos: [] } }

  it('passes the page\'s occasion to the layout', async () => {
    const wrapper = await mountSection(countdown, occasion)

    expect(wrapper.find('h2').text()).toBe('Ana & Marco')
    expect(wrapper.find('[data-countdown-date]').text()).toBe('Sunday, 14 February 2027')
  })

  it('uses a sample occasion in previews without one', async () => {
    const wrapper = await mountSection(countdown)

    expect(wrapper.find('h2').text()).toBe('Bea & Carlo')
    expect(wrapper.find('[data-unit="days"]').text()).toMatch(/^11[12]\D/)
  })
})
