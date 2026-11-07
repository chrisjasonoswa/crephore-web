<script setup lang="ts">
import type { AboutContent, AboutField, AboutTimelineItem } from '~/features/sections/about/about.type'
import type { SectionLayoutDefinition } from '~/features/sections/section.registry.type'
import { aboutTimelineMaxItems, blankTimelineItem } from '~/features/sections/about/about.helpers'
import { layoutFields } from '~/features/sections/section.fields'
import WebsiteListField from './WebsiteListField.vue'
import WebsitePhotoField from './WebsitePhotoField.vue'
import WebsiteTextareaField from './WebsiteTextareaField.vue'
import WebsiteTextField from './WebsiteTextField.vue'

// The about section's text, the fields its layout shows (`layout.fields`): a small label (eyebrow), the heading and the
// story (body, the intro on timelines); on timelines also the chapters, each with its own label, heading, text and
// (unless the layout leaves it out) photo, in a `WebsiteListField` (drag or Arrow Up/Down on a handle to reorder).
const props = defineProps<{
  eventId: number
  layout: SectionLayoutDefinition
}>()
const fields = computed(() => layoutFields<AboutField>(props.layout))

const content = defineModel<AboutContent>('content', { required: true })


// Optional fields are removed when emptied, so the layout leaves them out
function set(key: 'eyebrow' | 'heading' | 'body', value: string | number) {
  content.value = { ...content.value, [key]: String(value) || undefined }
}

const setTimeline = (timeline: AboutTimelineItem[]) => (content.value = { ...content.value, timeline })
function setItem(index: number, key: keyof AboutTimelineItem, value: string | number | undefined) {
  const text = value === undefined ? undefined : String(value)
  setTimeline(content.value.timeline.map((item, i) => (i === index ? { ...item, [key]: key === 'heading' ? text ?? '' : text || undefined } : item)))
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <WebsiteTextField v-if="fields.uses('eyebrow')" :model-value="content.eyebrow ?? ''" label="Small label" placeholder="e.g. Our story" @update:model-value="set('eyebrow', $event)" />
    <WebsiteTextField v-if="fields.uses('heading')" :model-value="content.heading ?? ''" label="Heading" placeholder="e.g. How we met" @update:model-value="set('heading', $event)" />
    <WebsiteTextareaField
      v-if="fields.uses('body')"
      :model-value="content.body ?? ''"
      :label="fields.label('body', 'Story')"
      :required="fields.requires('body')"
      :rows="6"
      :placeholder="fields.uses('timeline') ? 'A line or two above the timeline' : 'How it started, in your own words. Leave a blank line between paragraphs.'"
      @update:model-value="set('body', $event)"
    />

    <WebsiteListField
      v-if="fields.uses('timeline')"
      data-timeline-fields
      :required="fields.requires('timeline')"
      :model-value="content.timeline"
      label="Timeline"
      add-label="Add a chapter"
      name="timeline"
      :max="aboutTimelineMaxItems"
      :create="blankTimelineItem"
      :item-label="(_item, index) => `chapter ${index + 1}`"
      @update:model-value="setTimeline"
    >
      <template #item="{ item, index }">
        <span class="text-xs font-semibold text-muted-foreground">Chapter {{ index + 1 }}</span>
        <WebsiteTextField size="sm" :model-value="item.eyebrow ?? ''" label="Small label" placeholder="e.g. 2019 · How we met" @update:model-value="setItem(index, 'eyebrow', $event)" />
        <WebsiteTextField size="sm" :model-value="item.heading" label="Heading" placeholder="e.g. Spilled coffee" @update:model-value="setItem(index, 'heading', $event)" />
        <WebsiteTextareaField size="sm" :model-value="item.body ?? ''" label="Text (optional)" @update:model-value="setItem(index, 'body', $event)" />
        <WebsitePhotoField
          v-if="fields.uses('timeline.photo')"
          :url="item.photo"
          :event-id="eventId"
          :label="`Chapter ${index + 1} photo`"
          @update:url="setItem(index, 'photo', $event)"
        />
      </template>
    </WebsiteListField>
  </div>
</template>
