<script setup lang="ts">
import type { Section, SectionOccasion } from '~/features/sections/section.type'
import type { SiteTheme } from '~/site-theme/useSiteTheme'
import { useElementSize } from '@vueuse/core'
import SectionRenderer from './SectionRenderer.vue'
import SiteThemeScope from './SiteThemeScope.vue'

// A small picture of a section for pickers (layouts, section types): the section rendered at a desktop width and
// scaled down to the box, with the event's theme. Not interactive. Size the box with classes (e.g. `aspect-video`);
// the section is cut off at the bottom when taller.
const props = withDefaults(defineProps<{
  section: Section
  theme: SiteTheme
  occasion?: SectionOccasion
  // The width it is rendered at before scaling down
  renderWidth?: number
}>(), {
  renderWidth: 1200,
})

const box = useTemplateRef<HTMLElement>('box')
const { width } = useElementSize(box)
const scale = computed(() => width.value / props.renderWidth)
</script>

<template>
  <div ref="box" data-section-thumbnail class="relative overflow-hidden" aria-hidden="true" inert>
    <div
      v-if="width"
      class="pointer-events-none absolute top-0 left-0 origin-top-left"
      :style="{ width: `${renderWidth}px`, transform: `scale(${scale})` }"
    >
      <SiteThemeScope :theme="theme">
        <SectionRenderer :section="section" :occasion="occasion" />
      </SiteThemeScope>
    </div>
  </div>
</template>
