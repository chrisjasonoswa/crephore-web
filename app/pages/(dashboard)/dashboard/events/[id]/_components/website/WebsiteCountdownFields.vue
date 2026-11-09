<script setup lang="ts">
import type { Event } from '~/features/events/event.type'
import type { CountdownContent, CountdownField } from '~/features/sections/countdown/countdown.type'
import type { SectionLayoutDefinition } from '~/features/sections/section.registry.type'
import { layoutFields } from '~/features/sections/section.fields'
import WebsiteButtonField from './WebsiteButtonField.vue'
import WebsiteTextareaField from './WebsiteTextareaField.vue'
import WebsiteTextField from './WebsiteTextField.vue'

// The countdown's text and settings: the small label, the heading (optional: the event's name without one, shown as
// its placeholder), the message only where the layout shows it (the invitation), seconds and the button. It counts down
// to the event's start, set in Details.
const props = defineProps<{
  event: Event
  layout: SectionLayoutDefinition
}>()
const fields = computed(() => layoutFields<CountdownField>(props.layout))

const content = defineModel<CountdownContent>('content', { required: true })

const id = useId()

// Optional fields are removed when emptied, so the layout leaves them out
function set(key: 'eyebrow' | 'heading' | 'body', value: string | number) {
  content.value = { ...content.value, [key]: String(value) || undefined }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <WebsiteTextField :model-value="content.eyebrow ?? ''" label="Small label" placeholder="e.g. Counting down to" @update:model-value="set('eyebrow', $event)" />
    <div class="flex flex-col gap-2" data-countdown-heading>
      <WebsiteTextField :model-value="content.heading ?? ''" label="Heading (optional)" :placeholder="event.name" @update:model-value="set('heading', $event)" />
      <p class="text-xs text-muted-foreground">
        Leave it empty to show the event's name.
      </p>
    </div>

    <WebsiteTextareaField
      v-if="fields.uses('body')"
      :model-value="content.body ?? ''"
      label="Message (optional)"
      :rows="3"
      placeholder="e.g. We are getting married in the hills above Florence, and there is no one we would rather have beside us."
      @update:model-value="set('body', $event)"
    />

    <div class="flex items-center justify-between gap-3">
      <Label :for="`${id}-seconds`">Show seconds</Label>
      <Switch :id="`${id}-seconds`" :model-value="content.showSeconds" @update:model-value="content = { ...content, showSeconds: $event }" />
    </div>

    <WebsiteButtonField :cta="content.cta" @update:cta="content = { ...content, cta: $event }" :default-cta="{ label: 'Save the date', href: '#details' }" />
  </div>
</template>
