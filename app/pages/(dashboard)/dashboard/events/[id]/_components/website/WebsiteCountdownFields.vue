<script setup lang="ts">
import type { CountdownContent } from '~/features/sections/section.content.type'
import WebsiteButtonField from './WebsiteButtonField.vue'

// The countdown's text and settings. It always counts down to the event's start (set in Details).
const content = defineModel<CountdownContent>('content', { required: true })

const id = useId()

// Optional fields are removed when emptied, so the layout leaves them out
function set(key: 'eyebrow' | 'title', value: string | number) {
  content.value = { ...content.value, [key]: String(value) || undefined }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <Label :for="`${id}-eyebrow`">Small label</Label>
      <Input :id="`${id}-eyebrow`" :model-value="content.eyebrow ?? ''" placeholder="e.g. Counting down to" @update:model-value="set('eyebrow', $event)" />
    </div>

    <div class="flex flex-col gap-2">
      <Label :for="`${id}-title`">Title</Label>
      <Input :id="`${id}-title`" :model-value="content.title ?? ''" placeholder="e.g. Ana & Marco's wedding" @update:model-value="set('title', $event)" />
    </div>

    <div class="flex items-center justify-between gap-3">
      <Label :for="`${id}-seconds`">Show seconds</Label>
      <Switch :id="`${id}-seconds`" :model-value="content.showSeconds" @update:model-value="content = { ...content, showSeconds: $event }" />
    </div>

    <WebsiteButtonField :cta="content.cta" @update:cta="content = { ...content, cta: $event }" :default-cta="{ label: 'Save the date', href: '#details' }" />
  </div>
</template>
