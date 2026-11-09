<script setup lang="ts">
import type { DressCodeContent, DressColour } from '~/features/sections/dress-code/dress-code.type'
import { Plus } from '@lucide/vue'
import { dressColourMax, inspirationPhotoMax, sampleDressCode } from '~/features/sections/dress-code/dress-code.helpers'
import PlaygroundOptionalPhoto from './PlaygroundOptionalPhoto.vue'
import PlaygroundPhotoField from './PlaygroundPhotoField.vue'

// A dress code's settings: the attire motif, how many of the sample colours to wear (0 to `dressColourMax`) and whether there are colours
// to avoid and a description, then the inspiration photos (in order, up to `inspirationPhotoMax`) and the background
// photo.
const content = defineModel<DressCodeContent>('content', { required: true })

const id = useId()
const colourCounts = Array.from({ length: dressColourMax + 1 }, (_, count) => String(count))
// The sample's colours and one more, so every count up to the limit can be tried
const sampleColours: DressColour[] = [...sampleDressCode.colours, { id: 'rose', name: 'Dusty rose', hex: '#C9A0A0' }]

const setAttire = (attire: string | number) => (content.value = { ...content.value, attire: String(attire) || undefined })
function setColourCount(count: unknown) {
  if (typeof count === 'string' && count)
    content.value = { ...content.value, colours: sampleColours.slice(0, Number(count)) }
}
const setAvoid = (show: boolean) => (content.value = { ...content.value, avoidColours: show ? [...sampleDressCode.avoidColours] : [] })
const setDescription = (show: boolean) => (content.value = { ...content.value, description: show ? sampleDressCode.description : undefined })

const setLayoutPhotos = (layoutPhotos: string[]) => (content.value = { ...content.value, layoutPhotos })
const updatePhoto = (index: number, url: string) => setLayoutPhotos(content.value.layoutPhotos.map((photo, i) => (i === index ? url : photo)))
const addPhoto = () => setLayoutPhotos([...content.value.layoutPhotos, ''])
const removePhoto = (index: number) => setLayoutPhotos(content.value.layoutPhotos.filter((_, i) => i !== index))

const backgroundPhoto = computed({
  get: () => content.value.backgroundPhoto,
  set: backgroundPhoto => (content.value = { ...content.value, backgroundPhoto }),
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <Label :for="`${id}-attire`">Attire motif</Label>
      <Input :id="`${id}-attire`" :model-value="content.attire ?? ''" placeholder="e.g. Garden formal" @update:model-value="setAttire" />
    </div>

    <div class="flex flex-col gap-2">
      <Label :for="`${id}-colours`">Colours to wear</Label>
      <ToggleGroup :id="`${id}-colours`" type="single" variant="outline" :model-value="String(content.colours.length)" class="grid w-full grid-cols-6" @update:model-value="setColourCount">
        <ToggleGroupItem v-for="count in colourCounts" :key="count" :value="count" class="text-xs">
          {{ count }}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>

    <div class="flex items-center justify-between gap-3">
      <Label :for="`${id}-avoid`">Colours to avoid</Label>
      <Switch :id="`${id}-avoid`" :model-value="content.avoidColours.length > 0" @update:model-value="setAvoid" />
    </div>
    <div class="flex items-center justify-between gap-3">
      <Label :for="`${id}-description`">Description</Label>
      <Switch :id="`${id}-description`" :model-value="Boolean(content.description)" @update:model-value="setDescription" />
    </div>

    <div class="flex flex-col gap-2">
      <Label>Inspiration photos</Label>
      <p class="text-xs text-muted-foreground">
        Inside the layouts with photos, in order (up to {{ inspirationPhotoMax }}); missing ones show a placeholder.
      </p>
      <PlaygroundPhotoField
        v-for="(photo, index) in content.layoutPhotos"
        :key="index"
        :url="photo"
        :index="index"
        @update:url="updatePhoto(index, $event)"
        @remove="removePhoto(index)"
      />
      <Button v-if="content.layoutPhotos.length < inspirationPhotoMax" type="button" variant="outline" size="sm" class="self-start" @click="addPhoto">
        <Plus />
        Add photo
      </Button>
    </div>

    <PlaygroundOptionalPhoto
      v-model:url="backgroundPhoto"
      label="Background photo"
      hint="Behind the section when its background is Photo (any layout), under an overlay; the primary colour without it."
    />
  </div>
</template>
