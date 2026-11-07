<script setup lang="ts">
import type { WebsiteSection } from '~/features/event-websites/event-website.type'
import type { SectionOccasion } from '~/features/sections/section.type'
import type { EventKind } from '~/site-theme/eventKinds'
import type { SiteTheme } from '~/site-theme/useSiteTheme'
import { Plus } from '@lucide/vue'
import SectionRenderer from '~/components/sections/SectionRenderer.vue'
import SiteThemeScope from '~/components/sections/SiteThemeScope.vue'
import { getSectionType } from '~/features/sections/section.registry'
import { introContentFor } from '~/features/site-motion/intro-content'

// The page as guests will see it, in the event's theme. Click a section to edit it; the selected one is outlined.
// Hidden sections are shown faded so they can still be picked. Links inside sections don't navigate here.
const props = defineProps<{
  sections: WebsiteSection[]
  theme: SiteTheme
  occasion: SectionOccasion
  selectedKey: string | null
  // Changes each time the host presses "Play intro"
  introKey?: number
  // The kind of event, for intros that fall back to sample text
  eventKind: EventKind
}>()

const emit = defineEmits<{
  select: [key: string]
  add: []
}>()

// A program section without items is left out of the published site, so it's shown like a hidden one here
const hasNoSchedule = (section: WebsiteSection) => section.type === 'program' && !props.occasion.program.items.length

// What the intros show, as on the published site
const introContent = computed(() => introContentFor(props.sections, props.occasion, props.eventKind))

// Bring the selected section into view when it's picked from the list
const root = useTemplateRef<HTMLElement>('root')
watch(() => props.selectedKey, async (key) => {
  await nextTick()
  root.value?.querySelector(`[data-preview-section="${key}"]`)?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' })
})
</script>

<template>
  <div ref="root">
    <SiteThemeScope v-if="sections.length" :theme="theme" :intro-key="introKey" :intro-content="introContent">
      <div
        v-for="section in sections"
        :key="section.key"
        :data-preview-section="section.key"
        class="group relative cursor-pointer"
        @click.prevent="emit('select', section.key)"
      >
        <div :class="(!section.isVisible || hasNoSchedule(section)) && 'opacity-40 grayscale'">
          <SectionRenderer :section="section" :occasion="occasion" />
        </div>
        <!-- Editor outline and name: a fixed editor blue, never a theme colour, so it can't be mistaken for part of
             the section on any background (a dark outline looks like a border on light sections).
             The outline sits 4px inside the section with corners 4px tighter than the preview frame's (rounded-xl),
             so it follows the frame's rounded corners instead of being cut off by them. -->
        <div
          class="pointer-events-none absolute inset-1 rounded-lg transition-shadow"
          :class="section.key === selectedKey ? 'ring-2 ring-sky-500' : 'group-hover:ring-1 group-hover:ring-sky-500/70'"
        />
        <span
          class="pointer-events-none absolute top-3 left-3 rounded-md bg-sky-500 px-2 py-0.5 font-sans text-xs font-medium text-white shadow-sm transition-opacity"
          :class="section.key === selectedKey || !section.isVisible || hasNoSchedule(section) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
        >
          {{ getSectionType(section.type).name }}<template v-if="!section.isVisible"> · Hidden</template><template v-else-if="hasNoSchedule(section)"> · No schedule yet</template>
        </span>
      </div>
    </SiteThemeScope>

    <Empty v-else class="min-h-96">
      <EmptyHeader>
        <EmptyTitle>Your page is empty</EmptyTitle>
        <EmptyDescription>
          Start with a hero: it welcomes guests with your names, the date and the place.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" @click="emit('add')">
          <Plus />
          Add a section
        </Button>
      </EmptyContent>
    </Empty>
  </div>
</template>
