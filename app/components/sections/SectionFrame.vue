<script setup lang="ts">
import type { SectionBackground } from '~/features/sections/section.type'
import { resolveBackground, backgroundStyles } from '~/features/sections/section.background'

/*
 * A section's background: its colour, or the photo plus its overlay on the `photo` background.
 * Layouts only arrange their content inside it and never draw backgrounds themselves.
 * Classes passed to it (height, padding, flex, …) go on the <section>.
 */
const props = withDefaults(defineProps<{
  background: SectionBackground
  imageUrl?: string
  // Where the overlay is at full strength; it must cover wherever the text sits.
  //  - full:   everywhere (text anywhere)
  //  - top / bottom: top / bottom 60%, fading out towards the other edge
  //  - start / end: the left / right half from 768px (fading across); everywhere on narrow screens,
  //    where the text spans the full width
  //  - none: no overlay (the text sits on its own solid card)
  overlay?: 'full' | 'top' | 'bottom' | 'start' | 'end' | 'none'
}>(), {
  overlay: 'full',
})

// Photo without a photo renders as the primary background.
const resolvedBackground = computed(() => resolveBackground(props.background, props.imageUrl))
const styles = computed(() => backgroundStyles[resolvedBackground.value])
const photoUrl = computed(() => (resolvedBackground.value === 'photo' ? props.imageUrl : undefined))

const overlayClasses: Record<NonNullable<typeof props.overlay>, string> = {
  full: 'bg-(--site-photo-overlay)',
  top: 'bg-linear-to-b from-(--site-photo-overlay) from-60% to-transparent',
  bottom: 'bg-linear-to-t from-(--site-photo-overlay) from-60% to-transparent',
  start: 'bg-(--site-photo-overlay) @3xl:bg-transparent @3xl:bg-linear-to-r @3xl:from-(--site-photo-overlay) @3xl:from-50% @3xl:to-transparent',
  end: 'bg-(--site-photo-overlay) @3xl:bg-transparent @3xl:bg-linear-to-l @3xl:from-(--site-photo-overlay) @3xl:from-50% @3xl:to-transparent',
  none: '',
}
</script>

<template>
  <section class="relative isolate overflow-hidden" :class="styles.root">
    <template v-if="photoUrl">
      <img :src="photoUrl" alt="" class="absolute inset-0 -z-20 size-full object-cover">
      <div v-if="overlay !== 'none'" class="absolute inset-0 -z-10" :class="overlayClasses[overlay]" />
    </template>

    <slot :styles="styles" :background="resolvedBackground" />
  </section>
</template>
