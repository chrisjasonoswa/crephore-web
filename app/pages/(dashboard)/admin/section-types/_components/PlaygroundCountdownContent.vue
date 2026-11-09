<script setup lang="ts">
import type { CountdownContent } from '~/features/sections/countdown/countdown.type'
import PlaygroundOptionalPhoto from './PlaygroundOptionalPhoto.vue'

// A countdown's settings: seconds, the optional message and button, the background photo and the layout photos.
const content = defineModel<CountdownContent>('content', { required: true })

const id = useId()

const sampleCta = { label: 'Save the date', href: '#details' }
const sampleBody = 'We are getting married in the hills above Florence, and there is no one we would rather have beside us.'

const setShowSeconds = (showSeconds: boolean) => (content.value = { ...content.value, showSeconds })
const setShowBody = (show: boolean) => (content.value = { ...content.value, body: show ? sampleBody : undefined })
const setShowButton = (show: boolean) => (content.value = { ...content.value, cta: show ? sampleCta : undefined })

const backgroundPhoto = computed({
  get: () => content.value.backgroundPhoto,
  set: backgroundPhoto => (content.value = { ...content.value, backgroundPhoto }),
})
// Layout photo `index`, keeping the others in their places (an earlier one turned off stays as an empty slot, which
// the layouts show as a placeholder; empty slots at the end are dropped)
const layoutPhoto = (index: number) => computed({
  get: () => content.value.layoutPhotos[index],
  set: (url?: string) => {
    const layoutPhotos = Array.from({ length: Math.max(content.value.layoutPhotos.length, index + 1) }, (_, i) => content.value.layoutPhotos[i] ?? '')
    layoutPhotos[index] = url ?? ''
    if (url === undefined) {
      while (layoutPhotos.length && !layoutPhotos.at(-1))
        layoutPhotos.pop()
    }
    content.value = { ...content.value, layoutPhotos }
  },
})
const firstLayoutPhoto = layoutPhoto(0)
const secondLayoutPhoto = layoutPhoto(1)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between gap-3">
      <Label :for="`${id}-seconds`">Show seconds</Label>
      <Switch :id="`${id}-seconds`" :model-value="content.showSeconds" @update:model-value="setShowSeconds" />
    </div>
    <div class="flex items-center justify-between gap-3">
      <Label :for="`${id}-body`">Message (Invitation)</Label>
      <Switch :id="`${id}-body`" :model-value="Boolean(content.body)" @update:model-value="setShowBody" />
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
      v-model:url="firstLayoutPhoto"
      label="Layout photo"
      hint="Inside the layout (Split, the Invitation's tall photo); a placeholder without it."
    />
    <PlaygroundOptionalPhoto
      v-model:url="secondLayoutPhoto"
      label="Second layout photo"
      hint="The Invitation's small photo; a placeholder without it."
    />
  </div>
</template>
