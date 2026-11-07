import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import SectionThumbnail from '~/components/sections/SectionThumbnail.vue'
import { createDefaultSection } from '~/features/sections/section.registry'

const theme = { primaryColor: '#1E2A44', fontPairingKey: 'serif_classic', cornerStyle: 'soft' as const, motion: { intro: 'none' as const, intensity: 'normal' as const } }

// An IntersectionObserver whose callback the test calls to bring the thumbnail into view
let reportVisible: ((visible: boolean) => void) | undefined
class FakeObserver {
  constructor(callback: IntersectionObserverCallback) {
    reportVisible = visible => callback([{ isIntersecting: visible, time: Date.now() } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
  }

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  reportVisible = undefined
})

describe('section thumbnail', () => {
  const mountThumbnail = () => mountSuspended(SectionThumbnail, { props: { section: createDefaultSection('message'), theme } })

  it('renders the section only once it comes near view, and keeps it after', async () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    const wrapper = await mountThumbnail()
    const rendered = () => wrapper.find('.crephore-site').exists()

    expect(rendered()).toBe(false)
    reportVisible?.(true)
    await nextTick()
    await vi.waitFor(() => expect(rendered()).toBe(true))
    reportVisible?.(false)
    await nextTick()
    expect(rendered()).toBe(true)
  })

  it('renders at a desktop screen\'s height, not the browser window\'s', async () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    const wrapper = await mountThumbnail()
    reportVisible?.(true)
    await vi.waitFor(() => expect(wrapper.find('.crephore-site').exists()).toBe(true))

    expect(wrapper.find('.crephore-site').attributes('style')).toContain('--site-screen-height: 750px')
  })
})
