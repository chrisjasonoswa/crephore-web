import type { Section } from '~/features/sections/section.type'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SectionRenderer from '~/components/sections/SectionRenderer.vue'

const mountSection = async (section: Section) => {
  const wrapper = await mountSuspended(SectionRenderer, { props: { section } })
  // Layouts are async components
  await flushPromises()
  return wrapper
}

describe('SectionRenderer', () => {
  it('renders the registered layout for the section', async () => {
    const wrapper = await mountSection({
      type: 'hero',
      layout: 'centered',
      background: 'primary',
      content: { title: 'Ana & Marco' },
    })

    expect(wrapper.find('section h1').text()).toBe('Ana & Marco')
  })

  it('renders nothing for an unknown layout', async () => {
    const wrapper = await mountSection({
      type: 'hero',
      layout: 'does-not-exist',
      background: 'primary',
      content: { title: 'Ana & Marco' },
    })

    expect(wrapper.find('section').exists()).toBe(false)
  })
})

describe('SectionRenderer hero layouts', () => {
  it.each(['centered', 'text-left', 'text-right', 'text-bottom-left', 'text-bottom-right', 'text-bottom', 'text-top-right', 'text-top-left', 'text-top'])('renders the %s layout', async (layout) => {
    const wrapper = await mountSection({
      type: 'hero',
      layout,
      background: 'light',
      content: { title: 'Ana & Marco' },
    })

    expect(wrapper.find('section h1').text()).toBe('Ana & Marco')
  })
})
