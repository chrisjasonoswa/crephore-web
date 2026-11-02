<script setup lang="ts">
import { getSiteDivider } from './site-dividers'

// One decorative divider from the catalogue (`site-dividers.ts`) by key, drawn in `currentColor`, so it takes the colour
// of the text it sits in (set a colour class on it). Size it with classes keeping the 5:1 canvas, e.g. `h-5 w-25`.
// Decoration only: hidden from screen readers. Renders nothing for `none` or an unknown key.
const props = defineProps<{
  name: string
}>()

const divider = computed(() => getSiteDivider(props.name))
</script>

<template>
  <svg v-if="divider" :data-site-divider="divider.key" aria-hidden="true" viewBox="0 0 120 24" fill="none">
    <path
      v-for="(shape, i) in divider.shapes"
      :key="i"
      :d="shape.d"
      :fill="shape.draw === 'fill' ? 'currentColor' : 'none'"
      :stroke="shape.draw === 'stroke' ? 'currentColor' : 'none'"
      :stroke-width="shape.draw === 'stroke' ? 1.25 : undefined"
      stroke-linecap="round"
      stroke-linejoin="round"
      :opacity="shape.opacity"
    />
  </svg>
</template>
