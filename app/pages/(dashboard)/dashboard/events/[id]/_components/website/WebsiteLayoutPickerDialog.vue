<script setup lang="ts">
import type { Section, SectionOccasion } from '~/features/sections/section.type'
import type { SiteTheme } from '~/site-theme/useSiteTheme'
import SectionThumbnail from '~/components/sections/SectionThumbnail.vue'
import { changeSectionLayout, getSectionType } from '~/features/sections/section.registry'

// Every layout of the section's type, each shown with the section's own text, photos and the event's colours.
// Also opens right after a section is added (`isNew`): its current layout is the default, kept when closed.
const props = defineProps<{
  section: Section
  theme: SiteTheme
  occasion: SectionOccasion
  isNew?: boolean
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  pick: [layoutKey: string]
}>()

const definition = computed(() => getSectionType(props.section.type))

function pick(key: string) {
  emit('pick', key)
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-h-[90svh] overflow-y-auto sm:max-w-5xl">
      <DialogHeader>
        <DialogTitle>Choose a {{ definition.name.toLowerCase() }} layout</DialogTitle>
        <DialogDescription v-if="isNew">
          Pick how your new section looks. You can change it any time from its settings.
        </DialogDescription>
        <DialogDescription v-else>
          Your text and photos stay the same; only the arrangement changes.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="layout in definition.layouts"
          :key="layout.key"
          type="button"
          :data-layout="layout.key"
          :aria-pressed="layout.key === section.layout"
          class="group flex cursor-pointer flex-col gap-2 rounded-xl border p-2 text-left transition-colors hover:border-primary/60 aria-pressed:border-primary aria-pressed:ring-2 aria-pressed:ring-primary/30"
          @click="pick(layout.key)"
        >
          <SectionThumbnail
            :section="changeSectionLayout(section, layout.key)"
            :theme="theme"
            :occasion="occasion"
            class="aspect-16/10 w-full rounded-lg border bg-muted"
          />
          <span class="flex flex-col gap-0.5 px-1 pb-1">
            <span class="text-sm font-medium">{{ layout.name }}</span>
            <span class="line-clamp-2 text-xs text-muted-foreground">{{ layout.description }}</span>
          </span>
        </button>
      </div>
    </DialogContent>
  </Dialog>
</template>
