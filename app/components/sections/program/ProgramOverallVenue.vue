<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'
import { MapPin } from '@lucide/vue'

// The program's venue (`occasion.program.venue`, the event's when the whole program happens there) behind a map pin. Not a layout:
// `ProgramHeading` shows it under the heading, and layouts with a heading of their own (the vertical title) place it
// themselves. Renders nothing without a venue.
defineProps<{
  venue?: string
  styles: BackgroundStyles
}>()
</script>

<template>
  <p v-if="venue" data-program-overall-venue class="flex items-start gap-1.5 text-sm @2xl:text-base">
    <MapPin aria-hidden="true" class="mt-0.5 size-4 shrink-0 @2xl:mt-1" :class="styles.accent" />
    <span><span class="sr-only">Venue: </span>{{ venue }}</span>
  </p>
</template>
