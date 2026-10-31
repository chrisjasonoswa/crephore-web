<script setup lang="ts">
import type { Event } from '~/features/events/event.type'
import type { HeroContent } from '~/features/sections/section.content.type'
import { eventOccasion } from '~/features/event-websites/event-website'
import { formatOccasionDate } from '~/features/sections/countdown'
import WebsiteButtonField from './WebsiteButtonField.vue'

// The hero's text: label, names, date, place and the RSVP button. The date and place start as the event's;
// when they've been changed, a link puts the event's back.
const props = defineProps<{
  event: Event
}>()

const content = defineModel<HeroContent>('content', { required: true })

const id = useId()
const eventDate = computed(() => formatOccasionDate(eventOccasion(props.event)))

// Optional fields are removed when emptied, so the layout leaves them out
function set(key: 'eyebrow' | 'date' | 'venue', value: string | number) {
  content.value = { ...content.value, [key]: String(value) || undefined }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <Label :for="`${id}-eyebrow`">Small label</Label>
      <Input :id="`${id}-eyebrow`" :model-value="content.eyebrow ?? ''" placeholder="e.g. Together with their families" @update:model-value="set('eyebrow', $event)" />
    </div>

    <div class="flex flex-col gap-2">
      <Label :for="`${id}-title`">Title</Label>
      <Input :id="`${id}-title`" :model-value="content.title" placeholder="e.g. Ana & Marco" @update:model-value="content = { ...content, title: String($event) }" />
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between gap-2">
        <Label :for="`${id}-date`">Date</Label>
        <Button v-if="content.date !== eventDate" type="button" variant="link" size="xs" class="h-auto p-0" @click="content = { ...content, date: eventDate }">
          Use the event's date
        </Button>
      </div>
      <Input :id="`${id}-date`" :model-value="content.date ?? ''" :placeholder="eventDate" @update:model-value="set('date', $event)" />
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between gap-2">
        <Label :for="`${id}-venue`">Place</Label>
        <Button
          v-if="event.venueName && content.venue !== event.venueName"
          type="button"
          variant="link"
          size="xs"
          class="h-auto p-0"
          @click="content = { ...content, venue: event.venueName }"
        >
          Use the event's venue
        </Button>
      </div>
      <Input :id="`${id}-venue`" :model-value="content.venue ?? ''" placeholder="e.g. Manila Cathedral" @update:model-value="set('venue', $event)" />
    </div>

    <WebsiteButtonField :cta="content.cta" @update:cta="content = { ...content, cta: $event }" :default-cta="{ label: 'RSVP', href: '#rsvp' }" />
  </div>
</template>
