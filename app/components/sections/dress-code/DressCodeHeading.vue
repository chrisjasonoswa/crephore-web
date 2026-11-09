<script setup lang="ts">
import type { DressCodeContent } from '~/features/sections/dress-code/dress-code.type'
import type { BackgroundStyles } from '~/features/sections/section.background'
import type { Align } from '~/features/sections/section.options'
import { attireOf } from '~/features/sections/dress-code/dress-code.helpers'
import { alignClasses } from '~/features/sections/section.options'

// The dress code's eyebrow, heading (the section's h2, the usual heading size) and the attire under it ("Garden
// formal", in the heading font, smaller). Each is left out when empty. Not a layout: the dress-code layouts share it.
withDefaults(defineProps<{
  content: DressCodeContent
  styles: BackgroundStyles
  align?: Align
}>(), {
  align: 'center',
})
</script>

<template>
  <div v-if="content.eyebrow || content.heading || attireOf(content)" data-dress-heading class="flex flex-col" :class="alignClasses[align]">
    <p v-if="content.eyebrow" class="text-[0.7rem] font-semibold tracking-[0.25em] uppercase @2xl:text-xs" :class="styles.eyebrow">
      {{ content.eyebrow }}
    </p>
    <h2
      v-if="content.heading"
      class="font-(family-name:--site-font-heading) text-3xl leading-tight text-balance @2xl:text-4xl"
      :class="[styles.brandText, content.eyebrow && 'mt-3']"
    >
      {{ content.heading }}
    </h2>
    <p
      v-if="attireOf(content)"
      data-dress-attire
      class="font-(family-name:--site-font-heading) text-xl leading-snug @2xl:text-2xl"
      :class="(content.eyebrow || content.heading) && 'mt-2'"
    >
      {{ attireOf(content) }}
    </p>
  </div>
</template>
