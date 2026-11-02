<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'
import type { PeopleContent } from '~/features/sections/people/people.type'
import type { Align } from '~/features/sections/section.options'
import { alignClasses } from '~/features/sections/section.options'

// The people section's eyebrow and heading. Not a layout: the people layouts share it so they stay consistent.
withDefaults(defineProps<{
  content: PeopleContent
  styles: BackgroundStyles
  align?: Align
}>(), {
  align: 'center',
})
</script>

<template>
  <div v-if="content.eyebrow || content.heading" data-people-heading class="flex flex-col" :class="alignClasses[align]">
    <p
      v-if="content.eyebrow"
      class="text-[0.7rem] font-semibold tracking-[0.25em] uppercase @2xl:text-xs"
      :class="styles.eyebrow"
    >
      {{ content.eyebrow }}
    </p>
    <h2
      v-if="content.heading"
      class="font-(family-name:--site-font-heading) text-3xl leading-tight text-balance @2xl:text-4xl"
      :class="[content.eyebrow && 'mt-3', styles.brandText]"
    >
      {{ content.heading }}
    </h2>
  </div>
</template>
