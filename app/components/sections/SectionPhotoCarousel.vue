<script setup lang="ts">
import SectionPhoto from './SectionPhoto.vue'

// One photo spot that turns into a slideshow when it has several photos: they crossfade every few seconds, with
// dots to pick one. One photo (or none, a placeholder) renders like `SectionPhoto`. Layouts pass the shape and size
// classes, as for `SectionPhoto`.
// Autoplay starts on mount only (server and first render show the first photo), pauses while the pointer or focus
// is on it, and stays off for visitors who prefer reduced motion; the dots still work.
const props = withDefaults(defineProps<{
  // In order; empty slots (removed photos) are skipped
  photos: (string | undefined)[]
  // Milliseconds each photo stays
  interval?: number
}>(), {
  interval: 5000,
})

const slides = computed(() => props.photos.filter((photo): photo is string => !!photo))
const current = ref(0)
const isPaused = ref(false)

// The list can shrink while editing; keep showing a photo that exists
watch(() => slides.value.length, (length) => {
  if (current.value >= length)
    current.value = 0
})

let timer: ReturnType<typeof setInterval> | undefined

function next() {
  if (!isPaused.value && slides.value.length > 1)
    current.value = (current.value + 1) % slides.value.length
}

onMounted(() => {
  if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
    timer = setInterval(next, props.interval)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <SectionPhoto v-if="slides.length <= 1" :src="slides[0]" />
  <div
    v-else
    data-photo-carousel
    role="group"
    aria-roledescription="carousel"
    aria-label="Photos"
    class="relative overflow-hidden"
    @pointerenter="isPaused = true"
    @pointerleave="isPaused = false"
    @focusin="isPaused = true"
    @focusout="isPaused = false"
  >
    <img
      v-for="(src, i) in slides"
      :key="`${i}-${src}`"
      :src="src"
      alt=""
      :aria-hidden="i !== current"
      class="absolute inset-0 size-full object-cover transition-opacity duration-700 motion-reduce:transition-none"
      :class="i === current ? 'opacity-100' : 'opacity-0'"
    >

    <div class="absolute inset-x-0 bottom-3 flex justify-center">
      <div class="flex items-center gap-1.5 rounded-full bg-(--site-photo-overlay) px-2.5 py-1.5">
        <button
          v-for="(_, i) in slides"
          :key="i"
          type="button"
          data-carousel-dot
          :aria-label="`Show photo ${i + 1} of ${slides.length}`"
          :aria-current="i === current"
          class="h-1.5 cursor-pointer rounded-full bg-(--site-on-dark) transition-all"
          :class="i === current ? 'w-4' : 'w-1.5 opacity-50 hover:opacity-80'"
          @click="current = i"
        />
      </div>
    </div>
  </div>
</template>
