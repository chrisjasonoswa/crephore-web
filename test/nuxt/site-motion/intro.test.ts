import type { SiteMotion } from '~/features/site-motion/site-motion.type'
import type { SiteTheme } from '~/site-theme/useSiteTheme'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import SectionFrame from '~/components/sections/SectionFrame.vue'
import SiteThemeScope from '~/components/sections/SiteThemeScope.vue'

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

describe('intro animation', () => {
  it('plays on load with its timer for the length at the intensity, then removes itself', async () => {
    vi.useFakeTimers()
    const wrapper = await mountSite({ intro: 'shutter' }, { introOnLoad: true })
    expect(wrapper.find('[data-page-intro]').attributes('data-intro')).toBe('shutter')
    expect(wrapper.attributes('style')).toContain('--motion-intro-duration: 2300ms')

    // A scene that stalls is ended after its length and a margin
    vi.advanceTimersByTime(2300 + 2000)
    await nextTick()
    expect(wrapper.find('[data-page-intro]').exists()).toBe(false)
  })

  it('plays longer or shorter with the intensity', async () => {
    const bold = await mountSite({ intro: 'shutter', intensity: 'bold' }, { introOnLoad: true })
    expect(bold.attributes('style')).toContain('--motion-intro-duration: 2990ms')
  })

  it('is skipped by a tap or a key', async () => {
    const tapped = await mountSite({ intro: 'shutter' }, { introOnLoad: true })
    await tapped.find('[data-page-intro]').trigger('click')
    expect(tapped.find('[data-page-intro]').exists()).toBe(false)

    const keyed = await mountSite({ intro: 'shutter' }, { introOnLoad: true })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(keyed.find('[data-page-intro]').exists()).toBe(false)
  })

  it('in the editor\'s preview, plays only when "Play intro" is pressed, inside the preview', async () => {
    const wrapper = await mountSite({ intro: 'assemble' }, { introContent: { title: 'Bea & Carlo', initials: 'B & C', firstName: 'Bea', programTitles: [], stats: [], kind: 'any' } })
    expect(wrapper.find('[data-page-intro]').exists()).toBe(false)

    await wrapper.setProps({ introKey: 1 })
    await nextTick()
    await nextTick()
    const intro = wrapper.find('[data-page-intro]')
    expect(intro.exists()).toBe(true)
    expect(intro.attributes('data-intro')).toBe('assemble')
    expect(intro.attributes('data-contained')).toBeDefined()
  })

  it('never plays with no intro, or in a still scope (thumbnails)', async () => {
    expect((await mountSite({ intro: 'none' }, { introOnLoad: true })).find('[data-page-intro]').exists()).toBe(false)
    expect((await mountSite({ intro: 'shutter' }, { introOnLoad: true, still: true })).find('[data-page-intro]').exists()).toBe(false)
  })

  it('is in the server-rendered page, with the content under it', async () => {
    const app = createSSRApp({
      render: () => h(SiteThemeScope, { theme: themeWith({ intro: 'shutter' }), introOnLoad: true }, {
        default: () => h(SectionFrame, { background: 'light' }, { default: () => [h('h2', 'Our big day')] }),
      }),
    })
    const html = await renderToString(app)
    expect(html).toContain('data-page-intro')
    expect(html).toContain('Our big day')
  })
})

describe('scene intros', () => {
  const content = { title: 'Elena Santos', initials: 'ES', firstName: 'Elena', programTitles: [], stats: [], kind: 'memorial' as const }
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'animate').mockImplementation(() => ({ finished: Promise.resolve(), cancel: () => {} }) as unknown as Animation)
  })

  it('has the scene\'s first frame in the server-rendered page', async () => {
    const app = createSSRApp({
      render: () => h(SiteThemeScope, { theme: themeWith({ intro: 'dates' }), introOnLoad: true, introContent: content }, {
        default: () => h(SectionFrame, { background: 'light' }, { default: () => [h('h2', 'In memory')] }),
      }),
    })
    const html = await renderToString(app)
    expect(html).toMatch(/data-intro="dates"/)
    expect(html).toContain('intro-scene-cover')
    expect(html).toContain('background:var(--p)')
    expect(html).toContain('In memory')
  })

  it('gives the scene the hero\'s background and heading colours, the primary\'s without a hero', async () => {
    const light = await mountSite({ intro: 'splash' }, { introOnLoad: true, introContent: { ...content, heroBackground: 'light' } })
    const style = light.find('[data-page-intro]').attributes('style')
    expect(style).toContain('--hero-bg: var(--site-bg)')
    expect(style).toContain('--hero-heading: var(--site-primary-text)')

    const none = await mountSite({ intro: 'splash' }, { introOnLoad: true, introContent: content })
    expect(none.find('[data-page-intro]').attributes('style')).toContain('--hero-bg: var(--site-primary)')
  })

  it('plays the scene with the site\'s text, then removes itself', async () => {
    const wrapper = await mountSite({ intro: 'dates' }, { introOnLoad: true, introContent: content })
    await vi.waitFor(() => expect(wrapper.find('.intro-scene-layer').text()).toContain('Elena Santos'))
    await vi.waitFor(() => expect(wrapper.find('[data-page-intro]').exists()).toBe(false), { timeout: 3000 })
  })

  it('is skipped by a tap', async () => {
    const wrapper = await mountSite({ intro: 'dates' }, { introOnLoad: true, introContent: content })
    await wrapper.find('[data-page-intro]').trigger('click')
    expect(wrapper.find('[data-page-intro]').exists()).toBe(false)
  })

  it('is a short fade of its cover with reduced motion, without loading the scene', async () => {
    mockReducedMotion(true)
    vi.useFakeTimers()
    const wrapper = await mountSite({ intro: 'dates' }, { introOnLoad: true, introContent: content })
    expect(wrapper.find('.intro-scene-layer').text()).toBe('')
    vi.advanceTimersByTime(200)
    await nextTick()
    expect(wrapper.find('[data-page-intro]').exists()).toBe(false)
  })
})

