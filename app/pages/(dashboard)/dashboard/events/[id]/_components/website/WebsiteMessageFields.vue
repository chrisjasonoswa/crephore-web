<script setup lang="ts">
import type { MessageContent, MessageField } from '~/features/sections/message/message.type'
import type { SectionLayoutDefinition } from '~/features/sections/section.registry.type'
import { layoutFields } from '~/features/sections/section.fields'
import WebsiteTextareaField from './WebsiteTextareaField.vue'
import WebsiteTextField from './WebsiteTextField.vue'

// The message section's text: a small label (eyebrow), the heading, the message (body) and the signature; what the
// layout needs is marked (`layout.required`).
const props = defineProps<{ layout: SectionLayoutDefinition }>()
const fields = computed(() => layoutFields<MessageField>(props.layout))
const content = defineModel<MessageContent>('content', { required: true })

// Optional fields are removed when emptied, so the layout leaves them out
function set(key: 'eyebrow' | 'heading' | 'signature', value: string | number) {
  content.value = { ...content.value, [key]: String(value) || undefined }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <WebsiteTextField :model-value="content.eyebrow ?? ''" label="Small label" placeholder="e.g. A note from us" @update:model-value="set('eyebrow', $event)" />
    <WebsiteTextField :model-value="content.heading ?? ''" label="Heading" placeholder="e.g. Welcome, family & friends" @update:model-value="set('heading', $event)" />
    <WebsiteTextareaField :model-value="content.body" label="Message" :required="fields.requires('body')" :rows="6" placeholder="A few words to your guests" @update:model-value="content = { ...content, body: $event }" />
    <WebsiteTextField :model-value="content.signature ?? ''" label="Signature" placeholder="e.g. With love, Ana & Marco" @update:model-value="set('signature', $event)" />
  </div>
</template>
