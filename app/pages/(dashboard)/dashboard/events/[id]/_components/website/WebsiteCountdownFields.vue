<script setup lang="ts">
import type { Event } from '~/features/events/event.type'
import type { CountdownContent } from '~/features/sections/countdown/countdown.type'
import WebsiteButtonField from './WebsiteButtonField.vue'
import WebsiteEventFields from './WebsiteEventFields.vue'
import WebsiteTextField from './WebsiteTextField.vue'

// The countdown's text and settings. Its heading is the event's name and it counts down to the event's start, both
// set in Details.
const props = defineProps<{
  event: Event
}>()

const content = defineModel<CountdownContent>('content', { required: true })

const id = useId()
const eventFields = computed(() => [{ label: 'Heading', value: props.event.name }])

// Optional fields are removed when emptied, so the layout leaves them out
function setEyebrow(value: string | number) {
  content.value = { ...content.value, eyebrow: String(value) || undefined }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <WebsiteTextField :model-value="content.eyebrow ?? ''" label="Small label" placeholder="e.g. Counting down to" @update:model-value="setEyebrow" />

    <WebsiteEventFields :fields="eventFields" />

    <div class="flex items-center justify-between gap-3">
      <Label :for="`${id}-seconds`">Show seconds</Label>
      <Switch :id="`${id}-seconds`" :model-value="content.showSeconds" @update:model-value="content = { ...content, showSeconds: $event }" />
    </div>

    <WebsiteButtonField :cta="content.cta" @update:cta="content = { ...content, cta: $event }" :default-cta="{ label: 'Save the date', href: '#details' }" />
  </div>
</template>
