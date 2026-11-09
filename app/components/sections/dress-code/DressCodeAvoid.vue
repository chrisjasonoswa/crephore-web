<script setup lang="ts">
import type { DressColour } from '~/features/sections/dress-code/dress-code.type'
import type { BackgroundStyles } from '~/features/sections/section.background'
import type { Align } from '~/features/sections/section.options'
import { justifyClasses } from '~/features/sections/section.options'

// "Please avoid" and the colours to avoid, each a small swatch struck through with its name; nothing without any. Not
// a layout: the dress-code layouts put it under their colours.
withDefaults(defineProps<{
  colours: DressColour[]
  styles: BackgroundStyles
  align?: Align
}>(), {
  align: 'center',
})
</script>

<template>
  <div v-if="colours.length" data-dress-avoid class="flex flex-wrap items-center gap-x-4 gap-y-2" :class="justifyClasses[align]">
    <span class="text-[0.65rem] font-semibold tracking-[0.2em] uppercase" :class="styles.muted">Please avoid</span>
    <span v-for="colour in colours" :key="colour.id" data-dress-avoid-colour class="flex items-center gap-1.5 text-xs">
      <!-- The colour struck through -->
      <svg aria-hidden="true" viewBox="0 0 16 16" class="size-4 shrink-0">
        <circle cx="8" cy="8" r="7" :fill="colour.hex" stroke="currentColor" stroke-opacity=".25" />
        <line x1="3" y1="13" x2="13" y2="3" stroke="currentColor" stroke-width="1.5" :class="styles.accent" />
      </svg>
      {{ colour.name }}
    </span>
  </div>
</template>
