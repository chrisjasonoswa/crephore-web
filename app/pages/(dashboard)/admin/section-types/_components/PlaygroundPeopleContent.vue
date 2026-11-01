<script setup lang="ts">
import type { PeopleContent } from '~/features/sections/people/people.type'
import { getSectionType } from '~/features/sections/section.registry'
import PlaygroundOptionalPhoto from './PlaygroundOptionalPhoto.vue'

// The people section's settings: how many people (the sample list, then more), the background photo, and one photo
// used for everyone.
const content = defineModel<PeopleContent>('content', { required: true })

const id = useId()
const sample = getSectionType('people').defaultContent.people
const extras = ['Ninang Cora', 'Ninong Ben', 'Lia Ramos', 'Jun Dela Cruz', 'Mia Tan', 'Rico Lim', 'Bel Uy', 'Dino Go']
const peopleFor = (count: number) => Array.from({ length: count }, (_, index) => sample[index] ?? {
  id: `extra-${index}`,
  name: extras[(index - sample.length) % extras.length]!,
  role: index % 2 ? 'Secondary sponsor' : 'Principal sponsor',
})
const counts = [1, 2, 3, 5, 8, 16]

const count = computed({
  get: () => String(content.value.people.length),
  set: (next: string) => {
    const photo = content.value.people[0]?.photo
    content.value = { ...content.value, people: peopleFor(Number(next)).map(person => ({ ...person, photo })) }
  },
})
const photo = computed({
  get: () => content.value.people[0]?.photo,
  set: photo => (content.value = { ...content.value, people: content.value.people.map(person => ({ ...person, photo })) }),
})
const backgroundPhoto = computed({
  get: () => content.value.backgroundPhoto,
  set: backgroundPhoto => (content.value = { ...content.value, backgroundPhoto }),
})

function pick(next: unknown) {
  if (typeof next === 'string' && next)
    count.value = next
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <Label :for="`${id}-count`">People</Label>
      <ToggleGroup :id="`${id}-count`" type="single" variant="outline" :model-value="count" class="grid w-full grid-cols-6" @update:model-value="pick">
        <ToggleGroupItem v-for="value in counts" :key="value" :value="String(value)" class="text-xs">
          {{ value }}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>

    <PlaygroundOptionalPhoto
      v-model:url="backgroundPhoto"
      label="Background photo"
      hint="Behind the section when its background is Photo (any layout), under an overlay; the primary colour without it."
    />
    <PlaygroundOptionalPhoto
      v-model:url="photo"
      label="Person photo"
      hint="Used for everyone (the entourage list and credits show none); placeholders without it."
    />
  </div>
</template>
