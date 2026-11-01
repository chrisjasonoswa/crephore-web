<script setup lang="ts">
import type { MessageContent } from '~/features/sections/section.content.type'
import PlaygroundOptionalPhoto from './PlaygroundOptionalPhoto.vue'

// A message's settings: the signature, the background photo and the layout photo.
const content = defineModel<MessageContent>('content', { required: true })

const id = useId()

const sampleSignature = 'With love, from us'

const setShowSignature = (show: boolean) => (content.value = { ...content.value, signature: show ? sampleSignature : undefined })

const backgroundPhoto = computed({
  get: () => content.value.backgroundPhoto,
  set: backgroundPhoto => (content.value = { ...content.value, backgroundPhoto }),
})
const layoutPhoto = computed({
  get: () => content.value.layoutPhotos[0],
  set: url => (content.value = { ...content.value, layoutPhotos: url ? [url] : [] }),
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between gap-3">
      <Label :for="`${id}-signature`">Signature</Label>
      <Switch :id="`${id}-signature`" :model-value="Boolean(content.signature)" @update:model-value="setShowSignature" />
    </div>

    <PlaygroundOptionalPhoto
      v-model:url="backgroundPhoto"
      label="Background photo"
      hint="Behind the section when its background is Photo (any layout), under an overlay; the primary colour without it."
    />
    <PlaygroundOptionalPhoto
      v-model:url="layoutPhoto"
      label="Layout photo"
      hint="Inside the layout; a placeholder without it (the centred letter leaves it out)."
    />
  </div>
</template>
