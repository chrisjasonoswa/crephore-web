<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'
import type { Align } from '~/features/sections/section.options'
import { blockAlignClasses } from '~/features/sections/section.options'

// The dress code's description in the softer text colour, line breaks kept; nothing without one. `align` places it
// (left, centred or right, its own width kept); else it follows what it's in. Not a layout.
defineProps<{
  description?: string
  styles: BackgroundStyles
  align?: Align
}>()
</script>

<template>
  <p v-if="description?.trim()" data-dress-description class="text-sm leading-relaxed whitespace-pre-line @2xl:text-base" :class="[styles.muted, align && blockAlignClasses[align]]">
    {{ description }}
  </p>
</template>
