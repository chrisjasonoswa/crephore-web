<script setup lang="ts">
import type { AboutContent, AboutTimelineItem } from '~/features/sections/section.content.type'
import { ArrowDown, ArrowUp, Plus, Trash2 } from '@lucide/vue'
import { aboutTimelineMaxItems, blankTimelineItem } from '~/features/sections/about'
import { moveItem } from '~/features/event-websites/event-website'
import WebsitePhotoField from './WebsitePhotoField.vue'

// The about section's text: a small label (eyebrow), the heading and the story (body); for timeline layouts also the
// chapters, each with its own label, heading, text and (unless the layout is text only) photo.
const props = defineProps<{
  eventId: number
  // The layout shows the chapters (a timeline layout); story layouts only show the story
  isTimeline: boolean
  showChapterPhotos: boolean
}>()

const content = defineModel<AboutContent>('content', { required: true })

const id = useId()

// Optional fields are removed when emptied, so the layout leaves them out
function set(key: 'eyebrow' | 'heading' | 'body', value: string | number) {
  content.value = { ...content.value, [key]: String(value) || undefined }
}

const setTimeline = (timeline: AboutTimelineItem[]) => (content.value = { ...content.value, timeline })
function setItem(index: number, key: keyof AboutTimelineItem, value: string | number | undefined) {
  const text = value === undefined ? undefined : String(value)
  setTimeline(content.value.timeline.map((item, i) => (i === index ? { ...item, [key]: key === 'heading' ? text ?? '' : text || undefined } : item)))
}
const addItem = () => setTimeline([...content.value.timeline, blankTimelineItem()])
const removeItem = (index: number) => setTimeline(content.value.timeline.filter((_, i) => i !== index))
const move = (from: number, to: number) => setTimeline(moveItem(content.value.timeline, from, to))
const canAdd = computed(() => content.value.timeline.length < aboutTimelineMaxItems)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <Label :for="`${id}-eyebrow`">Small label</Label>
      <Input :id="`${id}-eyebrow`" :model-value="content.eyebrow ?? ''" placeholder="e.g. Our story" @update:model-value="set('eyebrow', $event)" />
    </div>

    <div class="flex flex-col gap-2">
      <Label :for="`${id}-heading`">Heading</Label>
      <Input :id="`${id}-heading`" :model-value="content.heading ?? ''" placeholder="e.g. How we met" @update:model-value="set('heading', $event)" />
    </div>

    <div class="flex flex-col gap-2">
      <Label :for="`${id}-body`">{{ props.isTimeline ? 'Intro (optional)' : 'Story' }}</Label>
      <Textarea
        :id="`${id}-body`"
        :model-value="content.body ?? ''"
        rows="6"
        :placeholder="props.isTimeline ? 'A line or two above the timeline' : 'How it started, in your own words. Leave a blank line between paragraphs.'"
        @update:model-value="set('body', $event)"
      />
    </div>

    <div v-if="isTimeline" data-timeline-fields class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h5 class="text-sm font-semibold">
          Timeline
        </h5>
        <span class="text-xs text-muted-foreground">{{ content.timeline.length }} of {{ aboutTimelineMaxItems }}</span>
      </div>

      <fieldset
        v-for="(item, index) in content.timeline"
        :key="index"
        data-timeline-item
        class="flex flex-col gap-3 rounded-lg border bg-background p-3"
      >
        <legend class="sr-only">
          Chapter {{ index + 1 }}
        </legend>
        <div class="flex items-center gap-1">
          <span class="flex-1 text-xs font-semibold text-muted-foreground">Chapter {{ index + 1 }}</span>
          <Button type="button" variant="ghost" size="icon-sm" :aria-label="`Move chapter ${index + 1} up`" :disabled="index === 0" @click="move(index, index - 1)">
            <ArrowUp />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" :aria-label="`Move chapter ${index + 1} down`" :disabled="index === content.timeline.length - 1" @click="move(index, index + 1)">
            <ArrowDown />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" class="text-destructive hover:text-destructive" :aria-label="`Remove chapter ${index + 1}`" @click="removeItem(index)">
            <Trash2 />
          </Button>
        </div>
        <div class="flex flex-col gap-1.5">
          <Label :for="`${id}-item-${index}-eyebrow`" class="text-xs">Small label</Label>
          <Input :id="`${id}-item-${index}-eyebrow`" :model-value="item.eyebrow ?? ''" placeholder="e.g. 2019 · How we met" @update:model-value="setItem(index, 'eyebrow', $event)" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label :for="`${id}-item-${index}-heading`" class="text-xs">Heading</Label>
          <Input :id="`${id}-item-${index}-heading`" :model-value="item.heading" placeholder="e.g. Spilled coffee" @update:model-value="setItem(index, 'heading', $event)" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label :for="`${id}-item-${index}-body`" class="text-xs">Text (optional)</Label>
          <Textarea :id="`${id}-item-${index}-body`" :model-value="item.body ?? ''" rows="3" @update:model-value="setItem(index, 'body', $event)" />
        </div>
        <WebsitePhotoField
          v-if="showChapterPhotos"
          :url="item.photo"
          :event-id="eventId"
          :label="`Chapter ${index + 1} photo`"
          @update:url="setItem(index, 'photo', $event)"
        />
      </fieldset>

      <Button type="button" variant="outline" class="w-full border-dashed" :disabled="!canAdd" @click="addItem">
        <Plus />
        Add a chapter
      </Button>
    </div>
    <p v-else-if="content.timeline.length" class="text-xs text-muted-foreground">
      Your timeline ({{ content.timeline.length }} chapters) shows in the Timeline layouts.
    </p>
  </div>
</template>
