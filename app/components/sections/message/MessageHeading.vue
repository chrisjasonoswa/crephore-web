<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'
import type { MessageContent } from '~/features/sections/message/message.type'
import type { Align } from '~/features/sections/section.options'
import { alignClasses } from '~/features/sections/section.options'

// The message's eyebrow and heading. Not a layout: the message layouts share it so they stay consistent.
withDefaults(defineProps<{
  content: MessageContent
  styles: BackgroundStyles
  align?: Align
  // Heading size: large for a heading on its own column, medium for most layouts
  size?: 'large' | 'medium'
}>(), {
  align: 'center',
  size: 'medium',
})

const headingSizes = {
  large: 'text-4xl @2xl:text-6xl',
  medium: 'text-3xl @2xl:text-4xl',
}
</script>

<template>
  <div v-if="content.eyebrow || content.heading" data-message-heading class="flex flex-col" :class="alignClasses[align]">
    <p
      v-if="content.eyebrow"
      class="text-[0.7rem] font-semibold tracking-[0.25em] uppercase @2xl:text-xs"
      :class="styles.eyebrow"
    >
      {{ content.eyebrow }}
    </p>
    <h2
      v-if="content.heading"
      class="font-(family-name:--site-font-heading) leading-tight text-balance"
      :class="[headingSizes[size], content.eyebrow && 'mt-3', styles.brandText]"
    >
      {{ content.heading }}
    </h2>
  </div>
</template>
