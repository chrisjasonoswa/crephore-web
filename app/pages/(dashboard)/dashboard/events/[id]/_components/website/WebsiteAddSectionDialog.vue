<script setup lang="ts">
import type { Event } from '~/features/events/event.type'
import type { SectionType } from '~/features/sections/section.type'
import type { SiteTheme } from '~/site-theme/useSiteTheme'
import SectionThumbnail from '~/components/sections/SectionThumbnail.vue'
import { createWebsiteSection, eventOccasion } from '~/features/event-websites/event-website'
import { sectionRegistry } from '~/features/sections/section.registry'

// The section types a page can have, each shown as it would look on this event's page.
const props = defineProps<{
  event: Event
  theme: SiteTheme
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  add: [type: SectionType]
}>()

const occasion = computed(() => eventOccasion(props.event))
// A sample of each type, with the event's details filled in
const choices = computed(() => Object.values(sectionRegistry).map(definition => ({
  definition,
  sample: createWebsiteSection(definition.type, props.event),
})))

function add(type: SectionType) {
  emit('add', type)
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>Add a section</DialogTitle>
        <DialogDescription>
          Pick what to add. You can change its layout, colours, text and photos after.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 sm:grid-cols-2">
        <button
          v-for="{ definition, sample } in choices"
          :key="definition.type"
          type="button"
          :data-add-section="definition.type"
          class="flex cursor-pointer flex-col gap-2 rounded-xl border p-2 text-left transition-colors hover:border-primary/60"
          @click="add(definition.type)"
        >
          <SectionThumbnail :section="sample" :theme="theme" :occasion="occasion" class="aspect-16/10 w-full rounded-lg border bg-muted" />
          <span class="flex flex-col gap-0.5 px-1 pb-1">
            <span class="text-sm font-medium">{{ definition.name }}</span>
            <span class="text-xs text-muted-foreground">{{ definition.description }}</span>
          </span>
        </button>
      </div>
    </DialogContent>
  </Dialog>
</template>
