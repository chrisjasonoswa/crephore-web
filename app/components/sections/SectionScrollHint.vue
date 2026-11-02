<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'

// Under a row that scrolls sideways (`useDragScroll`): a short track whose thumb shows how much of the row is in view
// and how far along it is, so guests can tell there's more to swipe to. Only a sign, not a control (no arrows). Render
// it while the row can scroll (`canScroll`).
const props = defineProps<{
  thumb: { size: number, offset: number }
  styles: BackgroundStyles
}>()

// Never thinner than this, so a long row's thumb still reads; it then travels the rest of the track
const MIN_SIZE = 0.2
const thumbStyle = computed(() => {
  const size = Math.max(props.thumb.size, MIN_SIZE)
  const along = props.thumb.size < 1 ? props.thumb.offset / (1 - props.thumb.size) : 0
  return { width: `${size * 100}%`, left: `${Math.min(1, along) * (1 - size) * 100}%` }
})
</script>

<template>
  <div aria-hidden="true" data-scroll-hint class="relative mx-auto h-1 w-16 rounded-full bg-current/15 @2xl:w-20">
    <span data-scroll-thumb class="absolute inset-y-0 rounded-full bg-current" :class="styles.brandText" :style="thumbStyle" />
  </div>
</template>
