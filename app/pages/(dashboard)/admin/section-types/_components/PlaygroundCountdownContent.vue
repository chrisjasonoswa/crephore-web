<script setup lang="ts">
import type { CountdownContent } from '~/features/sections/section.content.type'
import PlaygroundOptionalPhoto from './PlaygroundOptionalPhoto.vue'

// A countdown's settings: seconds, the optional button, the background photo and the layout photo.
const content = defineModel<CountdownContent>('content', { required: true })

const id = useId()

const sampleCta = { label: 'Save the date', href: '#details' }

const setShowSeconds = (showSeconds: boolean) => (content.value = { ...content.value, showSeconds })
const setShowButton = (show: boolean) => (content.value = { ...content.value, cta: show ? sampleCta : undefined })

const backgroundPhoto = computed({
  get: () => content.value.backgroundPhoto,
  set: backgroundPhoto => (content.value = { ...content.value, backgroundPhoto }),
})
const layoutPhoto = computed({
  get: () => content.value.layoutPhoto,
  set: layoutPhoto => (content.value = { ...content.value, layoutPhoto }),
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between gap-3">
      <Label :for="`${id}-seconds`">Show seconds</Label>
      <Switch :id="`${id}-seconds`" :model-value="content.showSeconds" @update:model-value="setShowSeconds" />
    </div>
    <div class="flex items-center justify-between gap-3">
      <Label :for="`${id}-button`">Button ("Save the date")</Label>
      <Switch :id="`${id}-button`" :model-value="Boolean(content.cta)" @update:model-value="setShowButton" />
    </div>

    <PlaygroundOptionalPhoto
      v-model:url="backgroundPhoto"
      label="Background photo"
      hint="Behind the section when its background is Photo (any layout), under an overlay; the primary colour without it."
    />
    <PlaygroundOptionalPhoto
      v-model:url="layoutPhoto"
      label="Layout photo"
      hint="Inside the layout (Split); a placeholder without it."
    />
  </div>
</template>
