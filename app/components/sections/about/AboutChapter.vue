<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'
import type { AboutTimelineItem } from '~/features/sections/section.content.type'
import type { Align } from '~/features/sections/section.options'
import { alignClasses } from '~/features/sections/section.options'

// One timeline chapter's text: its eyebrow (e.g. "2019 · How we met"), heading and body. Not a layout: the timeline
// layouts share it. The body shows when the chapter has one.
withDefaults(defineProps<{
  item: AboutTimelineItem
  styles: BackgroundStyles
  align?: Align
}>(), {
  align: 'start',
})
</script>

<template>
  <div data-chapter-text class="flex flex-col" :class="alignClasses[align]">
    <p v-if="item.eyebrow" class="text-[0.65rem] font-semibold tracking-[0.2em] uppercase @2xl:text-[0.7rem]" :class="styles.eyebrow">
      {{ item.eyebrow }}
    </p>
    <h3 class="font-(family-name:--site-font-heading) text-xl leading-snug text-balance @2xl:text-2xl" :class="item.eyebrow && 'mt-1.5'">
      {{ item.heading }}
    </h3>
    <p v-if="item.body" data-chapter-body class="mt-2 text-sm leading-relaxed text-pretty whitespace-pre-line" :class="styles.muted">
      {{ item.body }}
    </p>
  </div>
</template>
