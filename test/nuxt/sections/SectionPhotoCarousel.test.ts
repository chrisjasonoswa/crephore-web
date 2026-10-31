import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import SectionPhotoCarousel from '~/components/sections/SectionPhotoCarousel.vue'

const photos = ['https://example.com/1.jpg', 'https://example.com/2.jpg', 'https://example.com/3.jpg']

const mountCarousel = (props: { photos: (string | undefined)[], interval?: number }) =>
  mountSuspended(SectionPhotoCarousel, { props })
type Wrapper = Awaited<ReturnType<typeof mountCarousel>>
const shown = (wrapper: Wrapper) => wrapper.findAll('img').find(img => img.classes().includes('opacity-100'))!.attributes('src')

function prefersReducedMotion(reduce: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(query => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

describe('section photo carousel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    prefersReducedMotion(false)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shows a placeholder without photos, and a plain photo with one', async () => {
    const none = await mountCarousel({ photos: [] })
    expect(none.find('[data-photo-placeholder]').exists()).toBe(true)
    expect(none.find('[data-photo-carousel]').exists()).toBe(false)

    const one = await mountCarousel({ photos: [photos[0], ''] })
    expect(one.find('img').attributes('src')).toBe(photos[0])
    expect(one.find('[data-carousel-dot]').exists()).toBe(false)
  })

  it('skips empty slots and starts on the first photo', async () => {
    const wrapper = await mountCarousel({ photos: [photos[0], '', photos[1]] })

    expect(wrapper.findAll('img').map(img => img.attributes('src'))).toEqual([photos[0], photos[1]])
    expect(wrapper.findAll('[data-carousel-dot]')).toHaveLength(2)
    expect(shown(wrapper)).toBe(photos[0])
  })

  it('moves to the next photo every interval, wrapping around', async () => {
    const wrapper = await mountCarousel({ photos, interval: 1000 })

    await vi.advanceTimersByTimeAsync(1000)
    expect(shown(wrapper)).toBe(photos[1])
    await vi.advanceTimersByTimeAsync(2000)
    expect(shown(wrapper)).toBe(photos[0])
  })

  it('shows the photo whose dot is clicked', async () => {
    const wrapper = await mountCarousel({ photos })

    await wrapper.findAll('[data-carousel-dot]')[2]!.trigger('click')

    expect(shown(wrapper)).toBe(photos[2])
    expect(wrapper.findAll('[data-carousel-dot]')[2]!.attributes('aria-current')).toBe('true')
  })

  it('pauses while the pointer is on it', async () => {
    const wrapper = await mountCarousel({ photos, interval: 1000 })

    await wrapper.find('[data-photo-carousel]').trigger('pointerenter')
    await vi.advanceTimersByTimeAsync(3000)
    expect(shown(wrapper)).toBe(photos[0])

    await wrapper.find('[data-photo-carousel]').trigger('pointerleave')
    await vi.advanceTimersByTimeAsync(1000)
    expect(shown(wrapper)).toBe(photos[1])
  })

  it('does not autoplay for visitors who prefer reduced motion', async () => {
    prefersReducedMotion(true)
    const wrapper = await mountCarousel({ photos, interval: 1000 })

    await vi.advanceTimersByTimeAsync(5000)
    expect(shown(wrapper)).toBe(photos[0])
  })

  it('goes back to the first photo when the one shown is removed', async () => {
    const wrapper = await mountCarousel({ photos })
    await wrapper.findAll('[data-carousel-dot]')[2]!.trigger('click')

    await wrapper.setProps({ photos: photos.slice(0, 2) })
    await nextTick()

    expect(shown(wrapper)).toBe(photos[0])
  })
})
