import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { nextTick, onBeforeUnmount, onMounted, ref, toValue, watch } from 'vue'

/**
 * A row that scrolls sideways on every screen (e.g. the about section's card and polaroid timelines). Touch and
 * trackpads scroll it natively; this adds dragging with the mouse. While dragging, snapping waits until the drag ends
 * (`isDragging`, drop the row's snap classes then), and a drag doesn't count as a click on what's under it.
 * `canScroll` (more to see than fits) is measured in the browser only, so the server renders without it.
 */
export function useDragScroll(row: Readonly<ShallowRef<HTMLElement | null>>, itemCount: MaybeRefOrGetter<number>) {
  const canScroll = ref(false)
  const isDragging = ref(false)

  const measure = () => (canScroll.value = !!row.value && row.value.scrollWidth > row.value.clientWidth + 1)

  let observer: ResizeObserver | undefined
  onMounted(() => {
    measure()
    observer = new ResizeObserver(measure)
    if (row.value)
      observer.observe(row.value)
  })
  onBeforeUnmount(() => observer?.disconnect())
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

  return { canScroll, isDragging, startDrag, drag, endDrag, ignoreClickAfterDrag }
}
