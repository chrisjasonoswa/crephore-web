import type { InjectionKey, ShallowRef } from 'vue'
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'

// A `still` SiteThemeScope (thumbnails) provides true: nothing there follows the page's scroll
export const stillScopeKey: InjectionKey<boolean> = Symbol('stillScope')

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/**
 * Scrolling down moves a sideways row to the right (and up, back to the left): once the row reaches the screen, its
 * section's `content` stays pinned (sticky, the row as near the middle of the screen as the content allows) while the
 * page's scroll slides the row, one pixel for one; then the page carries on. The room for that is `space`, the style of
 * an empty element the layout puts right after the content, in the same section (a sticky element only travels within
 * its parent's content, so the section's padding wouldn't do). Swiping, dragging or trackpad-scrolling the row sideways scrolls the page to match, so both ways
 * agree. Snapping is off while pinned, so the row follows smoothly.
 *
 * Only in the browser, and only when the row has more than fits; never in a `still` scope (thumbnails) nor with reduced
 * motion, where the row stays a plain swipeable one (as the server renders it).
 */
export function useScrollPin(content: Readonly<ShallowRef<HTMLElement | null>>, row: Readonly<ShallowRef<HTMLElement | null>>) {
  const still = inject(stillScopeKey, false)
  let pinned = false
  const extra = ref(0)
  let top = 0
  // The content's offset within its section, measured unpinned: once stuck, the browser reports offsets with the
  // sticky shift in them
  let offset = 0
  let section: HTMLElement | null = null
  // Set while one side moves the other, so it doesn't bounce back
  let movingRow = false
  let movingPage = false
  let observer: ResizeObserver | undefined
  let reducedMotion: MediaQueryList | undefined

  // The content's offset within its section (only while it isn't stuck)
  function naturalOffset(el: HTMLElement, within: HTMLElement) {
    let offset = 0
    let node: HTMLElement | null = el
    while (node && node !== within) {
      offset += node.offsetTop
      node = node.offsetParent as HTMLElement | null
    }
    return offset
  }

  function unpin() {
    const el = content.value
    if (el) {
      el.style.position = ''
      el.style.top = ''
    }
    extra.value = 0
    if (row.value)
      row.value.style.scrollSnapType = ''
    pinned = false
  }

  // How far the page has scrolled while the content was pinned (0 before, `extra` after)
  function progress() {
    if (!section || !content.value)
      return 0
    return clamp(top - (section.getBoundingClientRect().top + offset), 0, extra.value)
  }

  function measure() {
    unpin()
    const el = content.value
    const strip = row.value
    section = el?.closest('section') ?? null
    if (!el || !strip || !section || still || reducedMotion?.matches)
      return
    const overflow = strip.scrollWidth - strip.clientWidth
    if (overflow <= 1)
      return
    extra.value = overflow
    offset = naturalOffset(el, section)
    // What a sticky bar above the page covers, in px (the dashboard's header around the editor's preview; nothing on the
    // site)
    const covered = Number.parseFloat(getComputedStyle(el).getPropertyValue('--site-sticky-top')) || 0
    const screen = window.innerHeight - covered
    const height = el.offsetHeight
    const rowMiddle = strip.getBoundingClientRect().top - el.getBoundingClientRect().top + strip.offsetHeight / 2
    // The row in the middle of the screen, unless that would leave the content's top or bottom off it needlessly
    top = covered + clamp(screen / 2 - rowMiddle, Math.min(0, screen - height), Math.max(0, screen - height))
    // Never lower than where the content sits with the page at its top (the hero): it would count as already scrolled
    // into, and the row would start part-way along
    top = Math.min(top, section.getBoundingClientRect().top + window.scrollY + offset)
    el.style.position = 'sticky'
    el.style.top = `${top}px`
    strip.style.scrollSnapType = 'none'
    pinned = true
    followPage()
  }

  // The page moved: slide the row to match
  function followPage() {
    if (!pinned || movingPage || !row.value)
      return
    movingRow = true
    row.value.scrollLeft = progress()
    requestAnimationFrame(() => (movingRow = false))
  }

  // The row was swiped, dragged or scrolled sideways: scroll the page to match (only while pinned; otherwise the row
  // goes back to where the page has it)
  function followRow() {
    if (!pinned || movingRow || !row.value || !section || !content.value)
      return
    const stuck = section.getBoundingClientRect().top + offset <= top + 1
    const shift = row.value.scrollLeft - progress()
    if (Math.abs(shift) < 1)
      return
    if (!stuck)
      return followPage()
    movingPage = true
    window.scrollBy(0, shift)
    requestAnimationFrame(() => (movingPage = false))
  }

  function attach(strip: HTMLElement | null, previous?: HTMLElement | null) {
    previous?.removeEventListener('scroll', followRow)
    if (previous)
      observer?.unobserve(previous)
    strip?.addEventListener('scroll', followRow, { passive: true })
    if (strip)
      observer?.observe(strip)
    measure()
  }

  onMounted(() => {
    reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    reducedMotion?.addEventListener?.('change', measure)
    observer = new ResizeObserver(() => measure())
    if (content.value)
      observer.observe(content.value)
    window.addEventListener('scroll', followPage, { passive: true })
    window.addEventListener('resize', measure)
    attach(row.value)
  })
  watch(row, attach)
  onBeforeUnmount(() => {
    unpin()
    observer?.disconnect()
    row.value?.removeEventListener('scroll', followRow)
    window.removeEventListener('scroll', followPage)
    window.removeEventListener('resize', measure)
    reducedMotion?.removeEventListener?.('change', measure)
  })

  // The room the row slides through, after the content (nothing when not pinned)
  return { space: computed(() => (extra.value ? { height: `${extra.value}px` } : undefined)) }
}
