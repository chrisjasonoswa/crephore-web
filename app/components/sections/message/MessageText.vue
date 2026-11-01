<script setup lang="ts">
import type { BackgroundStyles } from '~/features/sections/section.background'
import type { MessageContent } from '~/features/sections/section.content.type'
import type { Align } from '~/features/sections/section.options'
import { alignClasses } from '~/features/sections/section.options'
import MessageHeading from './MessageHeading.vue'
import MessageBody from './MessageBody.vue'

// The whole note in one column: eyebrow, heading, body and signature. Not a layout; layouts that split the note
// apart use MessageHeading and MessageBody directly. `#before-heading` puts something above it (e.g. a photo).
withDefaults(defineProps<{
  content: MessageContent
  styles: BackgroundStyles
  align?: Align
}>(), {
  align: 'center',
})

defineSlots<{
  'before-heading'?: () => unknown
  'before-signature'?: () => unknown
}>()
</script>

<template>
  <div data-message-text class="flex flex-col gap-5" :class="alignClasses[align]">
    <slot name="before-heading" />
    <MessageHeading :content="content" :styles="styles" :align="align" />
    <MessageBody :content="content" :styles="styles" :align="align" class="w-full">
      <template v-if="$slots['before-signature']" #before-signature>
        <slot name="before-signature" />
      </template>
    </MessageBody>
  </div>
</template>
