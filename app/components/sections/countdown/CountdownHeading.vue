<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'
import type { CountdownContent } from '~/features/sections/section.content.type'
import type { Align } from '~/features/sections/section.options'
import { alignClasses } from '~/features/sections/section.options'

// The countdown's eyebrow and title. Not a layout: the countdown layouts share it so they stay consistent.
withDefaults(defineProps<{
  content: CountdownContent
  styles: BackgroundStyles
  align?: Align
  // Title size: large for full-width layouts, medium for half-width columns
  size?: 'large' | 'medium'
}>(), {
  align: 'center',
  size: 'large',
})

const titleSizes = {
  large: 'text-3xl @2xl:text-5xl',
  medium: 'text-2xl @2xl:text-4xl',
}
</script>

<template>
  <div v-if="content.eyebrow || content.title" class="flex flex-col" :class="alignClasses[align]">
    <p
      v-if="content.eyebrow"
      class="text-[0.7rem] font-semibold tracking-[0.25em] uppercase @2xl:text-xs"
      :class="styles.eyebrow"
    >
      {{ content.eyebrow }}
    </p>
    <h2
      v-if="content.title"
      class="font-(family-name:--site-font-heading) leading-tight text-balance"
      :class="[titleSizes[size], content.eyebrow && 'mt-3']"
    >
      {{ content.title }}
    </h2>
  </div>
</template>
