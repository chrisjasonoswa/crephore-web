<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'
import type { CountdownContent } from '~/features/sections/countdown/countdown.type'
import type { Align } from '~/features/sections/section.options'
import type { SectionOccasion } from '~/features/sections/section.type'
import { countdownHeading } from '~/features/sections/countdown/countdown.helpers'
import { alignClasses } from '~/features/sections/section.options'

// The countdown's eyebrow and heading (the host's, else the event's name: `countdownHeading`). Not a layout: the
// countdown layouts share it so they stay consistent.
withDefaults(defineProps<{
  content: CountdownContent
  occasion: SectionOccasion
  styles: BackgroundStyles
  align?: Align
  // Heading size: large for full-width layouts, medium for half-width columns, display for a half-width column led by
  // the heading (the invitation)
  size?: 'display' | 'large' | 'medium'
}>(), {
  align: 'center',
  size: 'large',
})

const headingSizes = {
  display: 'text-4xl @2xl:text-5xl @5xl:text-6xl',
  large: 'text-3xl @2xl:text-5xl',
  medium: 'text-2xl @2xl:text-4xl',
}
</script>

<template>
  <div class="flex flex-col" :class="alignClasses[align]">
    <p
      v-if="content.eyebrow"
      class="text-[0.7rem] font-semibold tracking-[0.25em] uppercase @2xl:text-xs"
      :class="styles.eyebrow"
    >
      {{ content.eyebrow }}
    </p>
    <h2
      class="font-(family-name:--site-font-heading) leading-tight text-balance"
      :class="[headingSizes[size], content.eyebrow && (size === 'display' ? 'mt-5' : 'mt-3'), styles.brandText]"
    >
      {{ countdownHeading(content, occasion) }}
    </h2>
  </div>
</template>
