<script setup lang="ts">
import type { ProgramContent, ProgramItem } from '~/features/sections/program/program.type'
import type { SectionOccasion } from '~/features/sections/section.type'
import { addDays, occasionDate, sampleProgramItems } from '~/features/sections/program/program.helpers'
import PlaygroundOptionalPhoto from './PlaygroundOptionalPhoto.vue'

// The program section's settings: how many items (the sample program, then a conference-style list) over how many
// days (1 = all on the event's day; more spread the items evenly, from the occasion's date), an overall venue, the
// layout photo (the vertical title and photo cards) and the background photo.
const props = defineProps<{
  occasion: SectionOccasion
}>()

const content = defineModel<ProgramContent>('content', { required: true })

const id = useId()
const sample = sampleProgramItems()
const extras: Omit<ProgramItem, 'id' | 'date'>[] = [
  { startTime: '09:00', endTime: '09:30', title: 'Registration & coffee', venue: 'Lobby' },
  { startTime: '09:30', endTime: '10:30', title: 'Opening keynote', venue: 'Hall A', speakers: 'Ana Lim', description: 'Where the industry is heading.' },
  { startTime: '10:45', endTime: '11:30', title: 'Panel: Building teams', venue: 'Hall B', speakers: 'Paolo Tan, Rina Cruz, Jun Ong, Mia Uy' },
  { startTime: '12:00', title: 'Lunch', venue: 'Garden Terrace' },
  { title: 'Closing remarks', speakers: 'The organisers' },
  { startTime: '14:00', endTime: '15:00', title: 'Workshops', venue: 'Rooms 1–3', description: 'Pick one when you register.' },
]
const counts = [1, 3, 6, 12]
const dayCounts = [1, 2, 3]

const count = ref(String(content.value.items.length))
const dayCount = ref('1')

// Rebuilt from the controls; the dates follow the occasion, so switching it keeps "Event day" / "Next day" right
function build() {
  const total = Number(count.value)
  const days = Number(dayCount.value)
  const eventDate = occasionDate(props.occasion)
  const items = Array.from({ length: total }, (_, index): ProgramItem => {
    const base = sample[index] ?? extras[(index - sample.length) % extras.length]!
    const day = Math.min(days - 1, Math.floor((index * days) / total))
    return { ...base, id: `playground-${index}`, date: days > 1 ? addDays(eventDate, day) : '' }
  })
  content.value = { ...content.value, items }
}
watch(() => occasionDate(props.occasion), () => dayCount.value !== '1' && build())

const venue = computed({
  get: () => content.value.venue ?? '',
  set: venue => (content.value = { ...content.value, venue: venue || undefined }),
})

const layoutPhoto = computed({
  get: () => content.value.layoutPhotos[0],
  // An empty string keeps the field open while a URL is typed; undefined removes it
  set: photo => (content.value = { ...content.value, layoutPhotos: photo === undefined ? [] : [photo] }),
})

const backgroundPhoto = computed({
  get: () => content.value.backgroundPhoto,
  set: backgroundPhoto => (content.value = { ...content.value, backgroundPhoto }),
})

// A single-select toggle group emits an empty value when the active item is clicked again; keep the current one
function pick(control: 'count' | 'days', next: unknown) {
  if (typeof next !== 'string' || !next)
    return
  if (control === 'count')
    count.value = next
  else
    dayCount.value = next
  build()
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <Label :for="`${id}-count`">Items</Label>
      <ToggleGroup :id="`${id}-count`" type="single" variant="outline" :model-value="count" class="grid w-full grid-cols-4" @update:model-value="pick('count', $event)">
        <ToggleGroupItem v-for="value in counts" :key="value" :value="String(value)" class="text-xs">
          {{ value }}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>

    <div class="flex flex-col gap-2">
      <Label :for="`${id}-days`">Days</Label>
      <ToggleGroup :id="`${id}-days`" type="single" variant="outline" :model-value="dayCount" class="grid w-full grid-cols-3" @update:model-value="pick('days', $event)">
        <ToggleGroupItem v-for="value in dayCounts" :key="value" :value="String(value)" class="text-xs">
          {{ value }}
        </ToggleGroupItem>
      </ToggleGroup>
      <p class="text-xs text-muted-foreground">
        Each day starts with its date (tabs in the agenda when there are more days).
      </p>
    </div>

    <div class="flex flex-col gap-2">
      <Label :for="`${id}-venue`">Overall venue</Label>
      <Input :id="`${id}-venue`" v-model="venue" placeholder="e.g. Manila Cathedral" />
      <p class="text-xs text-muted-foreground">
        Under the heading, in every layout.
      </p>
    </div>

    <PlaygroundOptionalPhoto
      v-model:url="layoutPhoto"
      label="Layout photo"
      hint="Inside the vertical title and photo cards layouts; a soft placeholder without it."
    />

    <PlaygroundOptionalPhoto
      v-model:url="backgroundPhoto"
      label="Background photo"
      hint="Behind the section when its background is Photo (any layout), under an overlay; the primary colour without it."
    />
  </div>
</template>
