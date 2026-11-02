import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { nextTick, onBeforeUnmount, onMounted, ref, toValue, watch } from 'vue'

/**
 * A row that scrolls sideways on every screen (e.g. the about section's card and polaroid timelines). Touch and
 * trackpads scroll it natively; this adds dragging with the mouse. While dragging, snapping waits until the drag ends
 * (`isDragging`, drop the row's snap classes then), and a drag doesn't count as a click on what's under it.
 * `canScroll` (more to see than fits) and `thumb` (how much of the row shows and where, for `SectionScrollHint`) are
 * measured in the browser only, so the server renders without them.
 */
export function useDragScroll(row: Readonly<ShallowRef<HTMLElement | null>>, itemCount: MaybeRefOrGetter<number>) {
  const canScroll = ref(false)
  const isDragging = ref(false)
  // Fractions of the row's full width: how much of it shows, and how far along that part starts
  const thumb = ref({ size: 1, offset: 0 })

  function measure() {
    const el = row.value
    canScroll.value = !!el && el.scrollWidth > el.clientWidth + 1
    if (el && el.scrollWidth)
      thumb.value = { size: Math.min(1, el.clientWidth / el.scrollWidth), offset: Math.abs(el.scrollLeft) / el.scrollWidth }
  }

  let observer: ResizeObserver | undefined
  // Follows the row, which a layout only renders once it has items
  function watchRow(el: HTMLElement | null, previous?: HTMLElement | null) {
    previous?.removeEventListener('scroll', measure)
    if (previous)
      observer?.unobserve(previous)
    el?.addEventListener('scroll', measure, { passive: true })
    if (el)
      observer?.observe(el)
    measure()
  }
  onMounted(() => {
    observer = new ResizeObserver(measure)
    watchRow(row.value)
  })
  watch(row, watchRow)
  onBeforeUnmount(() => {
    row.value?.removeEventListener('scroll', measure)
    observer?.disconnect()
  })
  watch(() => toValue(itemCount), () => nextTick(measure))

  let startX = 0
  let startScroll = 0
  let dragged = false

  function startDrag(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || event.button !== 0)
      return
    measure()
    if (!canScroll.value || !row.value)
      return
    isDragging.value = true
    dragged = false
    startX = event.clientX
    startScroll = row.value.scrollLeft
    row.value.setPointerCapture?.(event.pointerId)
  }

  function drag(event: PointerEvent) {
    if (!isDragging.value || !row.value)
      return
    const distance = event.clientX - startX
    if (Math.abs(distance) > 3)
      dragged = true
    row.value.scrollLeft = startScroll - distance
  }

  function endDrag(event: PointerEvent) {
    if (!isDragging.value)
      return
    isDragging.value = false
    row.value?.releasePointerCapture?.(event.pointerId)
  }

  // Bind with `@click.capture`
  function ignoreClickAfterDrag(event: MouseEvent) {
    if (!dragged)
      return
    event.preventDefault()
    event.stopPropagation()
    dragged = false
  }

  return { canScroll, thumb, isDragging, startDrag, drag, endDrag, ignoreClickAfterDrag }
}
