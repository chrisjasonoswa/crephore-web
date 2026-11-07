<script setup lang="ts">
import type { Event } from '~/features/events/event.type'
import type { HeroContent, HeroLifeDates } from '~/features/sections/hero/hero.type'
import { eventOccasion } from '~/features/event-websites/event-website'
import { formatOccasionDate } from '~/features/sections/countdown/countdown.helpers'
import { formatLifeDates } from '~/features/sections/hero/hero.helpers'
import WebsiteButtonField from './WebsiteButtonField.vue'
import WebsiteChoiceGroup from './WebsiteChoiceGroup.vue'
import WebsiteEventFields from './WebsiteEventFields.vue'
import WebsiteTextField from './WebsiteTextField.vue'

// The hero's text: label and the RSVP button. The names, date and place are the event's name, start date and venue,
// shown locked (changed in Details). A memorial also picks how its dates of birth and passing show under the name.
const props = defineProps<{
  event: Event
}>()

const content = defineModel<HeroContent>('content', { required: true })

const occasion = computed(() => eventOccasion(props.event))
const isMemorial = computed(() => props.event.type === 'Memorial')

// A memorial's life dates as the hero shows them (in full while none is chosen, so the host still sees them)
const lifeDates = computed(() => formatLifeDates(occasion.value, content.value.lifeDates ?? 'full') ?? 'Not added yet')

const eventFields = computed(() => [
  { label: 'Heading', value: props.event.name },
  ...(isMemorial.value ? [{ label: 'Life dates', value: lifeDates.value }] : []),
  { label: 'Date', value: formatOccasionDate(occasion.value) },
  { label: 'Place', value: props.event.venueName },
])

// "None" is stored as no value, so the hero leaves the dates out
const lifeDatesChoices: { value: HeroLifeDates | 'none', label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'full', label: 'Full dates' },
  { value: 'years', label: 'Years only' },
]

function setLifeDates(value: HeroLifeDates | 'none') {
  content.value = { ...content.value, lifeDates: value === 'none' ? undefined : value }
}

// Optional fields are removed when emptied, so the layout leaves them out
function setEyebrow(value: string | number) {
  content.value = { ...content.value, eyebrow: String(value) || undefined }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <WebsiteTextField :model-value="content.eyebrow ?? ''" label="Small label" placeholder="e.g. Together with their families" @update:model-value="setEyebrow" />

    <WebsiteEventFields :fields="eventFields">
      <!-- How the hero shows them, above the dates and indented like them -->
      <template #control="{ field }">
        <div v-if="field.label === 'Life dates'" class="ps-3">
          <WebsiteChoiceGroup
            data-life-dates-field
            :model-value="content.lifeDates ?? 'none'"
            :choices="lifeDatesChoices"
            label="Life dates"
            @update:model-value="setLifeDates"
          />
        </div>
      </template>
    </WebsiteEventFields>

    <WebsiteButtonField :cta="content.cta" @update:cta="content = { ...content, cta: $event }" :default-cta="{ label: 'RSVP', href: '#rsvp' }" />
  </div>
</template>
