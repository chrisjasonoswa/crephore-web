<script setup lang="ts">
import type { AboutContent } from '~/features/sections/about/about.type'
import { Plus } from '@lucide/vue'
import { getSectionType } from '~/features/sections/section.registry'
import PlaygroundOptionalPhoto from './PlaygroundOptionalPhoto.vue'
import PlaygroundPhotoField from './PlaygroundPhotoField.vue'

// The about section's settings: the background photo, the story's layout photos, a short or long story, how many
// chapters the timeline has, and the chapters' photos (one URL used for every chapter).
const content = defineModel<AboutContent>('content', { required: true })

const id = useId()
const sample = getSectionType('about').defaultContent
const longStory = `${sample.body}\n\nOur families met for the first time over lechon and karaoke, and somehow everyone sang the same song. We knew then that this was home.`
const sampleChapters = [
  ...sample.timeline,
  { eyebrow: '2026 · The wedding', heading: 'See you there', body: 'With everyone who got us here.' },
  { eyebrow: 'Next', heading: 'Forever', body: 'The rest of the story is ours to write.' },
]

const backgroundPhoto = computed({
  get: () => content.value.backgroundPhoto,
  set: backgroundPhoto => (content.value = { ...content.value, backgroundPhoto }),
})

const setLayoutPhotos = (layoutPhotos: string[]) => (content.value = { ...content.value, layoutPhotos })
const updatePhoto = (index: number, url: string) =>
  setLayoutPhotos(content.value.layoutPhotos.map((photo, i) => (i === index ? url : photo)))
const addPhoto = () => setLayoutPhotos([...content.value.layoutPhotos, ''])
const removePhoto = (index: number) => setLayoutPhotos(content.value.layoutPhotos.filter((_, i) => i !== index))

const story = computed({
  get: () => (!content.value.body ? 'none' : content.value.body.length > (sample.body?.length ?? 0) ? 'long' : 'short'),
  set: (next: string) => (content.value = { ...content.value, body: next === 'none' ? undefined : next === 'long' ? longStory : sample.body }),
})
const chapterCount = computed({
  get: () => String(content.value.timeline.length),
  set: (next: string) => {
    const photo = content.value.timeline[0]?.photo
    content.value = { ...content.value, timeline: sampleChapters.slice(0, Number(next)).map(item => ({ ...item, photo })) }
  },
})
const chapterPhoto = computed({
  get: () => content.value.timeline[0]?.photo,
  set: photo => (content.value = { ...content.value, timeline: content.value.timeline.map(item => ({ ...item, photo })) }),
})

function pick(next: unknown, apply: (value: string) => void) {
  if (typeof next === 'string' && next)
    apply(next)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <Label>Story</Label>
      <ToggleGroup type="single" variant="outline" :model-value="story" class="grid w-full grid-cols-3" @update:model-value="pick($event, value => (story = value))">
        <ToggleGroupItem value="none" class="text-xs">None</ToggleGroupItem>
        <ToggleGroupItem value="short" class="text-xs">Short</ToggleGroupItem>
        <ToggleGroupItem value="long" class="text-xs">Long</ToggleGroupItem>
      </ToggleGroup>
    </div>

    <div class="flex flex-col gap-2">
      <Label :for="`${id}-chapters`">Timeline chapters</Label>
      <ToggleGroup :id="`${id}-chapters`" type="single" variant="outline" :model-value="chapterCount" class="grid w-full grid-cols-6" @update:model-value="pick($event, value => (chapterCount = value))">
        <ToggleGroupItem v-for="count in 6" :key="count" :value="String(count - 1)" class="text-xs">
          {{ count - 1 }}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>

    <PlaygroundOptionalPhoto
      v-model:url="backgroundPhoto"
      label="Background photo"
      hint="Behind the section when its background is Photo (any layout), under an overlay; the primary colour without it."
    />
    <PlaygroundOptionalPhoto
      v-model:url="chapterPhoto"
      label="Chapter photo"
      hint="Used for every chapter in the timeline layouts (Compact shows none); placeholders without it."
    />

    <div class="flex flex-col gap-2">
      <Label>Layout photos</Label>
      <p class="text-xs text-muted-foreground">
        Inside the story layouts, in order (up to 3); missing ones show a placeholder.
      </p>
      <PlaygroundPhotoField
        v-for="(photo, index) in content.layoutPhotos"
        :key="index"
        :url="photo"
        :index="index"
        @update:url="updatePhoto(index, $event)"
        @remove="removePhoto(index)"
      />
      <Button v-if="content.layoutPhotos.length < 3" type="button" variant="outline" size="sm" class="self-start" @click="addPhoto">
        <Plus />
        Add photo
      </Button>
    </div>
  </div>
</template>
