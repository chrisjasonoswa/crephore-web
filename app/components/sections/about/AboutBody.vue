<script setup lang="ts">
import type { AboutContent } from '~/features/sections/about/about.type'
import type { Align } from '~/features/sections/section.options'

// The about section's story: one paragraph per blank-line-separated block (single line breaks kept). Not a layout.
// A block, not a flex column, so a photo floated in the default slot makes the story wrap around it.
const props = withDefaults(defineProps<{
  content: AboutContent
  align?: Align
  // A large first letter, like a magazine
  dropCap?: boolean
}>(), {
  align: 'center',
  dropCap: false,
})

defineSlots<{
  default?: () => unknown
}>()

const paragraphs = computed(() => (props.content.body ?? '').split(/\n\s*\n/).map(text => text.trim()).filter(Boolean))
const textAlign = { start: 'text-start', center: 'text-center', end: 'text-end' }
</script>

<template>
  <div v-if="paragraphs.length || $slots.default" data-about-body class="flow-root" :class="textAlign[align]">
    <slot />
    <p
      v-for="(paragraph, index) in paragraphs"
      :key="index"
      data-about-paragraph
      class="leading-relaxed text-pretty whitespace-pre-line @2xl:text-lg"
      :class="[
        index > 0 && 'mt-4',
        align === 'center' && 'mx-auto max-w-prose',
        dropCap && index === 0 && 'first-letter:float-start first-letter:me-2 first-letter:font-(family-name:--site-font-heading) first-letter:text-6xl first-letter:leading-[0.85]',
      ]"
    >
      {{ paragraph }}
    </p>
  </div>
</template>
