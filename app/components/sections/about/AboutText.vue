<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'
import type { AboutContent } from '~/features/sections/section.content.type'
import type { Align } from '~/features/sections/section.options'
import { alignClasses } from '~/features/sections/section.options'
import AboutBody from './AboutBody.vue'
import AboutHeading from './AboutHeading.vue'

// The eyebrow, heading and story in one column. Not a layout; layouts that split them apart use AboutHeading and
// AboutBody directly. `#before-heading` puts something above it (e.g. a portrait), `#after` something below.
withDefaults(defineProps<{
  content: AboutContent
  styles: BackgroundStyles
  align?: Align
  size?: 'large' | 'medium'
}>(), {
  align: 'center',
  size: 'medium',
})

defineSlots<{
  'before-heading'?: () => unknown
  'after'?: () => unknown
}>()
</script>

<template>
  <div data-about-text class="flex flex-col gap-5" :class="alignClasses[align]">
    <slot name="before-heading" />
    <AboutHeading :content="content" :styles="styles" :align="align" :size="size" />
    <AboutBody :content="content" :align="align" class="w-full" />
    <slot name="after" />
  </div>
</template>
