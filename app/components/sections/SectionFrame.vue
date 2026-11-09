<script setup lang="ts">
import type { SectionBackground } from '~/features/sections/section.type'
import { resolveBackground, backgroundStyles } from '~/features/sections/section.background'
import { usePhotoLoading } from '~/features/sections/section.loading'

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
  // With a `top`, `bottom`, `start` or `end` overlay: the photo fades into a solid colour at that edge (the primary, or
  // its dark shade when light text wouldn't read on it: `--site-photo-edge`), clear by 45% of the way across, and the
  // overlay stays near the text (full over the nearest 40%, clear by 65%), so the far side of the photo is untouched
  edge?: boolean
}>(), {
  overlay: 'full',
  edge: false,
})

// Photo without a photo renders as the primary background.
const resolvedBackground = computed(() => resolveBackground(props.background, props.imageUrl))
const styles = computed(() => backgroundStyles[resolvedBackground.value])
const photoUrl = computed(() => (resolvedBackground.value === 'photo' ? props.imageUrl : undefined))
const loading = usePhotoLoading()

const overlayClasses: Record<NonNullable<typeof props.overlay>, string> = {
  full: 'bg-(--site-photo-overlay)',
  top: 'bg-linear-to-b from-(--site-photo-overlay) from-60% to-transparent',
  bottom: 'bg-linear-to-t from-(--site-photo-overlay) from-60% to-transparent',
  start: 'bg-(--site-photo-overlay) @3xl:bg-transparent @3xl:bg-linear-to-r @3xl:from-(--site-photo-overlay) @3xl:from-50% @3xl:to-transparent',
  end: 'bg-(--site-photo-overlay) @3xl:bg-transparent @3xl:bg-linear-to-l @3xl:from-(--site-photo-overlay) @3xl:from-50% @3xl:to-transparent',
  none: '',
}
// With `edge`: the overlay only near the text (the start and end overlays still cover everything on narrow screens,
// where the text spans the width), at the least strength that keeps text readable (`--site-photo-overlay-edge`; the
// others are a little stronger), and the fade into the edge colour over it
const nearOverlayClasses: Partial<Record<NonNullable<typeof props.overlay>, string>> = {
  top: 'bg-linear-to-b from-(--site-photo-overlay-edge) from-40% to-transparent to-65%',
  bottom: 'bg-linear-to-t from-(--site-photo-overlay-edge) from-40% to-transparent to-65%',
  start: 'bg-(--site-photo-overlay-edge) @3xl:bg-transparent @3xl:bg-linear-to-r @3xl:from-(--site-photo-overlay-edge) @3xl:from-40% @3xl:to-transparent @3xl:to-65%',
  end: 'bg-(--site-photo-overlay-edge) @3xl:bg-transparent @3xl:bg-linear-to-l @3xl:from-(--site-photo-overlay-edge) @3xl:from-40% @3xl:to-transparent @3xl:to-65%',
}
const edgeClasses: Partial<Record<NonNullable<typeof props.overlay>, string>> = {
  top: 'bg-linear-to-b from-(--site-photo-edge) to-transparent to-45%',
  bottom: 'bg-linear-to-t from-(--site-photo-edge) to-transparent to-45%',
  start: 'bg-linear-to-r from-(--site-photo-edge) to-transparent to-45%',
  end: 'bg-linear-to-l from-(--site-photo-edge) to-transparent to-45%',
}
const edgeClass = computed(() => (props.edge ? edgeClasses[props.overlay] : undefined))
const overlayClass = computed(() => (edgeClass.value && nearOverlayClasses[props.overlay]) || overlayClasses[props.overlay])
</script>

<template>
  <!-- Clipped, not hidden: overflow-hidden would make the section a scroll container and stop sticky children (the
       photo cards' photo) from sticking -->
  <section class="relative isolate overflow-clip" :class="styles.root">
    <template v-if="photoUrl">
      <img :src="photoUrl" alt="" :loading="loading" decoding="async" class="absolute inset-0 -z-20 size-full object-cover">
      <div v-if="overlay !== 'none'" data-photo-overlay class="absolute inset-0 -z-10" :class="overlayClass" />
      <!-- Over the overlay, which stays at full strength where the text sits -->
      <div v-if="edgeClass" data-photo-edge class="absolute inset-0 -z-10" :class="edgeClass" />
    </template>

    <slot :styles="styles" :background="resolvedBackground" />
  </section>
</template>
