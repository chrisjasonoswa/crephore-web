<script setup lang="ts">
import type { MessageContent } from '~/features/sections/section.content.type'

// The message section's text: a small label (eyebrow), the heading, the message (body) and the signature.
const content = defineModel<MessageContent>('content', { required: true })

const id = useId()

// Optional fields are removed when emptied, so the layout leaves them out
function set(key: 'eyebrow' | 'heading' | 'signature', value: string | number) {
  content.value = { ...content.value, [key]: String(value) || undefined }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <Label :for="`${id}-eyebrow`">Small label</Label>
      <Input :id="`${id}-eyebrow`" :model-value="content.eyebrow ?? ''" placeholder="e.g. A note from us" @update:model-value="set('eyebrow', $event)" />
    </div>

    <div class="flex flex-col gap-2">
      <Label :for="`${id}-heading`">Heading</Label>
      <Input :id="`${id}-heading`" :model-value="content.heading ?? ''" placeholder="e.g. Welcome, family & friends" @update:model-value="set('heading', $event)" />
    </div>

    <div class="flex flex-col gap-2">
      <Label :for="`${id}-body`">Message</Label>
      <Textarea
        :id="`${id}-body`"
        :model-value="content.body"
        rows="6"
        placeholder="A few words to your guests"
        @update:model-value="content = { ...content, body: String($event) }"
      />
    </div>

    <div class="flex flex-col gap-2">
      <Label :for="`${id}-signature`">Signature</Label>
      <Input :id="`${id}-signature`" :model-value="content.signature ?? ''" placeholder="e.g. With love, Ana & Marco" @update:model-value="set('signature', $event)" />
    </div>
  </div>
</template>
