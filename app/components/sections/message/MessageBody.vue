<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'
import type { MessageContent } from '~/features/sections/message/message.type'
import type { Align } from '~/features/sections/section.options'

// The message's text (line breaks kept) and signature. Not a layout. The default slot goes just before the
// message, so a floated photo makes the message wrap around it and the signature follow right after it (not below the
// photo); `#before-signature` puts something beside the signature.
withDefaults(defineProps<{
  content: MessageContent
  styles: BackgroundStyles
  align?: Align
  // A large first letter, like a magazine
  dropCap?: boolean
}>(), {
  align: 'center',
  dropCap: false,
})

defineSlots<{
  'default'?: () => unknown
  'before-signature'?: () => unknown
}>()

// A block, not a flex column, so a floated photo affects everything in it
const textAlign = { start: 'text-start', center: 'text-center', end: 'text-end' }
const justify = { start: 'justify-start', center: 'justify-center', end: 'justify-end' }
</script>

<template>
  <div v-if="content.body || content.signature || $slots.default" class="flow-root" :class="textAlign[align]">
    <slot />
    <p
      v-if="content.body"
      data-message-body
      class="leading-relaxed text-pretty whitespace-pre-line @2xl:text-lg"
      :class="[
        align === 'center' && 'mx-auto max-w-prose',
        dropCap && 'first-letter:float-start first-letter:me-2 first-letter:font-(family-name:--site-font-heading) first-letter:text-6xl first-letter:leading-[0.85]',
      ]"
    >
      {{ content.body }}
    </p>
    <div v-if="content.signature || $slots['before-signature']" class="flex items-center gap-3" :class="[justify[align], content.body && 'mt-5']">
      <slot name="before-signature" />
      <p
        v-if="content.signature"
        data-message-signature
        class="font-(family-name:--site-font-heading) text-lg [font-style:var(--site-font-heading-italic)] @2xl:text-xl"
        :class="styles.eyebrow"
      >
        {{ content.signature }}
      </p>
    </div>
  </div>
</template>
