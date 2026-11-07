<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'
import type { ProgramContent } from '~/features/sections/program/program.type'
import type { Align } from '~/features/sections/section.options'
import { alignClasses } from '~/features/sections/section.options'
import ProgramOverallVenue from './ProgramOverallVenue.vue'

// The program section's eyebrow, heading and the program's venue (`venue`, the event's when the whole program happens
// there; behind a map pin). Not a layout:
// the program layouts share it so they stay consistent. `look` sets the style:
//  - default: the eyebrow in small spaced capitals over the heading
//  - script: the eyebrow in the heading font's italic over a capitals heading (the pinned note)
//  - display: a capitals heading (the date-led layouts, the vertical title's heading across the top)
// Headings are never bold, and every look is the usual heading size.
withDefaults(defineProps<{
  content: ProgramContent
  // The program's venue (`occasion.program.venue`)
  venue?: string
  styles: BackgroundStyles
  align?: Align
  look?: 'default' | 'script' | 'display'
}>(), {
  align: 'center',
  look: 'default',
})
</script>

<template>
  <div v-if="content.eyebrow || content.heading || venue" data-program-heading class="flex flex-col" :class="alignClasses[align]">
    <!-- Script: the heading font's italic; otherwise small spaced capitals in the body font -->
    <p
      v-if="content.eyebrow && look === 'script'"
      class="font-(family-name:--site-font-heading) text-xl [font-style:var(--site-font-heading-italic)] @2xl:text-2xl"
      :class="styles.eyebrow"
    >
      {{ content.eyebrow }}
    </p>
    <p v-else-if="content.eyebrow" class="text-[0.7rem] font-semibold tracking-[0.25em] uppercase @2xl:text-xs" :class="styles.eyebrow">
      {{ content.eyebrow }}
    </p>
    <h2
      v-if="content.heading"
      class="font-(family-name:--site-font-heading) text-balance"
      :class="[
        styles.brandText,
        {
          'default': ['text-3xl leading-tight @2xl:text-4xl', content.eyebrow && 'mt-3'],
          'script': ['text-3xl leading-tight [text-transform:var(--site-font-heading-case)] @2xl:text-4xl', content.eyebrow && 'mt-1'],
          'display': ['text-3xl leading-tight [text-transform:var(--site-font-heading-case)] @2xl:text-4xl', content.eyebrow && 'mt-3'],
        }[look],
      ]"
    >
      {{ content.heading }}
    </h2>
    <ProgramOverallVenue :venue="venue" :styles="styles" :class="(content.eyebrow || content.heading) && 'mt-3'" />
  </div>
</template>
