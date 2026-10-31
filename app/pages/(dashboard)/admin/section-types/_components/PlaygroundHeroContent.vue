<script setup lang="ts">
import type { HeroContent } from '~/features/sections/section.content.type'
import { Plus } from '@lucide/vue'
import PlaygroundOptionalPhoto from './PlaygroundOptionalPhoto.vue'
import PlaygroundPhotoField from './PlaygroundPhotoField.vue'

// A hero's photos: the background photo, and the layout photos (one URL per field, in order).
const content = defineModel<HeroContent>('content', { required: true })

const backgroundPhoto = computed({
  get: () => content.value.backgroundPhoto,
  set: backgroundPhoto => (content.value = { ...content.value, backgroundPhoto }),
})

function setLayoutPhotos(next: string[]) {
  content.value = { ...content.value, layoutPhotos: next }
}

const updatePhoto = (index: number, url: string) =>
  setLayoutPhotos(content.value.layoutPhotos.map((photo, i) => (i === index ? url : photo)))
const addPhoto = () => setLayoutPhotos([...content.value.layoutPhotos, ''])
const removePhoto = (index: number) => setLayoutPhotos(content.value.layoutPhotos.filter((_, i) => i !== index))
</script>

<template>
  <div class="flex flex-col gap-4">
    <PlaygroundOptionalPhoto
      v-model:url="backgroundPhoto"
      label="Background photo"
      hint="Behind the section when its background is Photo (any layout), under an overlay; the primary colour without it."
    />

    <div class="flex flex-col gap-2">
      <Label>Layout photos</Label>
      <p class="text-xs text-muted-foreground">
        Inside the layout, in order. Layouts use as many as they show (up to 5); missing ones show a placeholder.
      </p>
      <PlaygroundPhotoField
        v-for="(photo, index) in content.layoutPhotos"
        :key="index"
        :url="photo"
        :index="index"
        @update:url="updatePhoto(index, $event)"
        @remove="removePhoto(index)"
      />
      <Button type="button" variant="outline" size="sm" class="self-start" @click="addPhoto">
        <Plus />
        Add photo
      </Button>
    </div>
  </div>
</template>
