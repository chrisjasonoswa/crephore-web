import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, provide, useTemplateRef } from 'vue'
import { stillScopeKey, useScrollPin } from '~/features/sections/useScrollPin'

// The layout around a sideways row, as the helper sees it: a section, its content (pinned), the row in it
const Row = defineComponent({
  setup() {
    const pinned = useTemplateRef<HTMLElement>('pinned')
    const row = useTemplateRef<HTMLElement>('row')
    const { space } = useScrollPin(pinned, row)
    return () => h('section', { 'data-section': '' }, [
      h('div', { 'ref': 'pinned', 'data-pinned': '' }, [h('div', { 'ref': 'row', 'data-row': '' })]),
      space.value && h('div', { 'data-space': '', 'style': space.value }),
    ])
  },
})
const mountRow = (still = false) => mount(defineComponent({
  setup() {
    provide(stillScopeKey, still)
    return () => h(Row)
  },
}), { attachTo: document.body })

// The browser's geometry, which the test DOM doesn't compute: the row overflows by 600px, the content is 500px tall with
// the row's middle 250px down, 56px into its section, on an 800px-tall screen
let overflow = 600
let sectionTop = 400
let reduced = false
beforeEach(() => {
  overflow = 600
  sectionTop = 400
  reduced = false
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return this.dataset.row !== undefined ? 400 + overflow : 0
  })
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return this.dataset.row !== undefined ? 400 : 0
  })
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return this.dataset.pinned !== undefined ? 500 : this.dataset.row !== undefined ? 100 : 0
  })
  vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockImplementation(function (this: HTMLElement) {
    return this.dataset.pinned !== undefined ? 56 : 0
  })
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const top = this.dataset.section !== undefined ? sectionTop : this.dataset.row !== undefined ? 200 : 0
    return { top, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: top, toJSON: () => ({}) } as DOMRect
  })
  vi.stubGlobal('innerHeight', 800)
  vi.stubGlobal('matchMedia', () => ({ matches: reduced, addEventListener: () => {}, removeEventListener: () => {} }))
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => setTimeout(callback, 0))
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

const parts = (wrapper: ReturnType<typeof mountRow>) => ({
  section: wrapper.find('[data-section]').element as HTMLElement,
  pinned: wrapper.find('[data-pinned]').element as HTMLElement,
  row: wrapper.find('[data-row]').element as HTMLElement,
})

describe('useScrollPin', () => {
  it('pins the content with the row in the middle of the screen, and makes the section longer by the row\'s overflow', async () => {
    const wrapper = mountRow()
    const { pinned, row } = parts(wrapper)
    await nextTick()

    expect(pinned.style.position).toBe('sticky')
    // The row's middle (250px down the content) at the screen's middle (400px)
    expect(pinned.style.top).toBe('150px')
    expect((wrapper.find('[data-space]').element as HTMLElement).style.height).toBe('600px')
    expect(row.style.scrollSnapType).toBe('none')
  })

  it('slides the row right as the page scrolls down, one pixel for one, and back as it scrolls up', async () => {
    const { row } = parts(mountRow())
    await nextTick()

    // The section scrolled up past where the content pins (150px - 56px): 194px into the pinned stretch
    sectionTop = -100
    window.dispatchEvent(new Event('scroll'))
    expect(row.scrollLeft).toBe(194)

    // Scrolled back up, before it pins: the row is back at its start
    await new Promise(resolve => setTimeout(resolve, 5))
    sectionTop = 300
    window.dispatchEvent(new Event('scroll'))
    expect(row.scrollLeft).toBe(0)
  })

  it('scrolls the page to match a sideways swipe while pinned', async () => {
    const scrollBy = vi.fn()
    vi.stubGlobal('scrollBy', scrollBy)
    const { row } = parts(mountRow())
    await nextTick()

    sectionTop = -100
    window.dispatchEvent(new Event('scroll'))
    await new Promise(resolve => setTimeout(resolve, 5))
    row.scrollLeft = 294
    row.dispatchEvent(new Event('scroll'))

    expect(scrollBy).toHaveBeenCalledWith(0, 100)
  })

  it('leaves a row that fits, a thumbnail\'s and, with reduced motion, every row as a plain swipeable one', async () => {
    overflow = 0
    expect(parts(mountRow()).pinned.style.position).toBe('')

    overflow = 600
    expect(parts(mountRow(true)).pinned.style.position).toBe('')

    reduced = true
    expect(parts(mountRow()).pinned.style.position).toBe('')
  })
})
