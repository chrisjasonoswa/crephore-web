import type { SiteMotion } from '~/features/site-motion/site-motion.type'
import type { SiteTheme } from '~/site-theme/useSiteTheme'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SiteThemeScope from '~/components/sections/SiteThemeScope.vue'
import { lockScroll } from '~/features/site-motion/scroll-lock'

const themeWith = (motion: Partial<SiteMotion> = {}): SiteTheme => ({
  primaryColor: '#1E2A44',
  secondaryColor: '#E8A598',
  fontPairingKey: 'serif_classic',
  cornerStyle: 'soft',
  motion: { intro: 'shutter', intensity: 'normal', ...motion },
})

function mockReducedMotion(reduce: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(query => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }))
}

const mountSite = (motion: Partial<SiteMotion> = {}, props: Record<string, unknown> = {}) =>
  mountSuspended(SiteThemeScope, {
    props: { theme: themeWith(motion), ...props },
    slots: { default: () => h(SectionFrame, { background: 'light' }, { default: () => [h('h2', 'Our big day')] }) },
  })

beforeEach(() => mockReducedMotion(false))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('scrolling during the intro', () => {
  it('locks the page\'s scrolling while the intro plays, keeping the scrollbar\'s space, and gives it back after', async () => {
    vi.useFakeTimers()
    const wrapper = await mountSite({ intro: 'shutter' }, { introOnLoad: true })
    await nextTick()
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(document.documentElement.style.scrollbarGutter).toBe('stable')

    // Ended by its timer at the latest: its length and a margin
    vi.advanceTimersByTime(2300 + 2000)
    await nextTick()
    expect(wrapper.find('[data-page-intro]').exists()).toBe(false)
    expect(document.documentElement.style.overflow).toBe('')
    expect(document.documentElement.style.scrollbarGutter).toBe('')
  })

  it('gives scrolling back when the intro is skipped', async () => {
    const wrapper = await mountSite({ intro: 'shutter' }, { introOnLoad: true })
    await nextTick()
    await wrapper.find('[data-page-intro]').trigger('click')
    await nextTick()
    expect(document.documentElement.style.overflow).toBe('')
  })

  it('never locks in the editor or playground ("Play intro"): they keep scrolling', async () => {
    const scroller = document.createElement('div')
    scroller.style.overflowY = 'auto'
    document.body.append(scroller)
    const wrapper = await mountSuspended(SiteThemeScope, {
      props: { theme: themeWith({ intro: 'shutter' }) },
      slots: { default: () => h('h2', 'Our big day') },
      attachTo: scroller,
    })
    await wrapper.setProps({ introKey: 1 })
    await nextTick()
    await nextTick()
    expect(wrapper.find('[data-page-intro]').exists()).toBe(true)
    expect(scroller.style.overflow).toBe('')
    expect(document.documentElement.style.overflow).toBe('')
    wrapper.unmount()
    scroller.remove()
  })

  it('never locks without an intro', async () => {
    await mountSite({ intro: 'none' }, { introOnLoad: true })
    await nextTick()
    expect(document.documentElement.style.overflow).toBe('')
  })
})

describe('scroll lock', () => {
  it('counts overlapping locks and gives the scroller its own styles back after the last', () => {
    const scroller = document.createElement('div')
    scroller.style.overflow = 'auto'
    const first = lockScroll(scroller)
    const second = lockScroll(scroller)
    first()
    first()
    expect(scroller.style.overflow).toBe('hidden')
    second()
    expect(scroller.style.overflow).toBe('auto')
    expect(scroller.style.scrollbarGutter).toBe('')
  })
})
