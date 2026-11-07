// Scroll locks while an intro covers the page (SiteThemeScope), counted per scroller so overlapping intros (a replay
// while one plays) don't undo each other: the scroller's own styles come back when the last lock is released.
interface ScrollLock {
  count: number
  overflow: string
  scrollbarGutter: string
}
const locks = new WeakMap<HTMLElement, ScrollLock>()

/** Stops `scroller` scrolling, keeping its scrollbar's space so nothing shifts; returns the release. */
export function lockScroll(scroller: HTMLElement): () => void {
  let lock = locks.get(scroller)
  if (!lock) {
    lock = { count: 0, overflow: scroller.style.overflow, scrollbarGutter: scroller.style.scrollbarGutter }
    locks.set(scroller, lock)
    scroller.style.overflow = 'hidden'
    scroller.style.scrollbarGutter = 'stable'
  }
  lock.count += 1
  let released = false
  return () => {
    if (released)
      return
    released = true
    lock.count -= 1
    if (lock.count === 0) {
      scroller.style.overflow = lock.overflow
      scroller.style.scrollbarGutter = lock.scrollbarGutter
      locks.delete(scroller)
    }
  }
}
