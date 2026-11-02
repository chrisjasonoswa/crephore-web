<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'

// The date before a day's items ("Mon, 15 Feb"), between two thin lines. Not a layout: every program layout puts it
// before each day, the first too, except those with a day label of their own (cards, tickets, the pinned note), the
// agenda (a date badge on every item, and tabs when there are more days) and the date-led layouts.
defineProps<{
  label: string
  styles: BackgroundStyles
}>()
</script>

<template>
  <h3 data-program-day class="flex items-center gap-4 text-[0.7rem] font-semibold tracking-[0.25em] uppercase" :class="styles.eyebrow">
    <span aria-hidden="true" class="h-px flex-1 bg-current/30" />
    <span class="text-center">{{ label }}</span>
    <span aria-hidden="true" class="h-px flex-1 bg-current/30" />
  </h3>
</template>
