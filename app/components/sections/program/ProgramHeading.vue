<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'
import type { ProgramContent } from '~/features/sections/program/program.type'
import type { Align } from '~/features/sections/section.options'
import { alignClasses } from '~/features/sections/section.options'
import ProgramOverallVenue from './ProgramOverallVenue.vue'

// The program section's eyebrow, heading and overall venue (behind a map pin, when the host fills it in). Not a layout:
// the program layouts share it so they stay consistent. `look` sets the style:
//  - default: the eyebrow in small spaced capitals over the heading
//  - script: the eyebrow in the heading font's italic over a bold capitals heading (the pinned note)
//  - display: a large bold capitals heading, tightly set (the date-led layouts)
withDefaults(defineProps<{
  content: ProgramContent
  styles: BackgroundStyles
  align?: Align
  look?: 'default' | 'script' | 'display'
}>(), {
  align: 'center',
  look: 'default',
})
</script>

<template>
  <div v-if="content.eyebrow || content.heading || content.venue" data-program-heading class="flex flex-col" :class="alignClasses[align]">
    <p
      v-if="content.eyebrow"
      :class="[
        styles.eyebrow,
        look === 'script'
          ? 'font-(family-name:--site-font-heading) text-xl [font-style:var(--site-font-heading-italic)] @2xl:text-2xl'
          : 'text-[0.7rem] font-semibold tracking-[0.25em] uppercase @2xl:text-xs',
      ]"
    >
      {{ content.eyebrow }}
    </p>
    <h2
      v-if="content.heading"
      class="font-(family-name:--site-font-heading) text-balance"
      :class="[
        styles.brandText,
        {
          'default': ['text-3xl leading-tight @2xl:text-4xl', content.eyebrow && 'mt-3'],
          'script': ['text-3xl leading-tight font-bold uppercase @2xl:text-4xl', content.eyebrow && 'mt-1'],
          'display': ['text-4xl leading-[0.95] font-bold uppercase @2xl:text-6xl', content.eyebrow && 'mt-3'],
        }[look],
      ]"
    >
      {{ content.heading }}
    </h2>
    <ProgramOverallVenue :venue="content.venue" :styles="styles" :class="(content.eyebrow || content.heading) && 'mt-3'" />
  </div>
</template>
