<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'
import { programSpeakers } from '~/features/sections/program/program.helpers'

// An item's speakers (who leads it): a soft "with" in the heading font's italic, then the names in small spaced
// capitals in the label colour, so they read apart from the venue (plain) and the note (softer). Not a layout: the
// program layouts share it. Renders nothing without speakers.
const props = defineProps<{
  speakers?: string
  styles: BackgroundStyles
}>()

const names = computed(() => programSpeakers(props.speakers).join(', '))
</script>

<template>
  <p v-if="names" data-program-speakers class="flex flex-wrap items-baseline gap-x-2">
    <span class="font-(family-name:--site-font-heading) text-sm [font-style:var(--site-font-heading-italic)]" :class="styles.muted">with</span>
    <span class="text-xs font-semibold tracking-[0.15em] uppercase" :class="styles.eyebrow">{{ names }}</span>
  </p>
</template>
