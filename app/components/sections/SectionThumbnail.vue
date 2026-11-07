<script setup lang="ts">
import type { Section, SectionOccasion } from '~/features/sections/section.type'
import type { SiteTheme } from '~/site-theme/useSiteTheme'
import { useElementSize, useElementVisibility } from '@vueuse/core'
import SectionRenderer from './SectionRenderer.vue'
import SiteThemeScope from './SiteThemeScope.vue'

// A small picture of a section for pickers (layouts, section types): the section rendered at a desktop width and
// scaled down to the box, with the event's theme. Not interactive. Size the box with classes (e.g. `aspect-video`);
// the section is cut off at the bottom when taller. Pickers show many (every layout of a type), so each renders only
// once it's near the visible part of its dialog, and stays rendered after.
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

// Near view (300px ahead, so it's ready before it scrolls in); without IntersectionObserver, right away. Until the box
// is measured the scale is 0, so nothing shows at the wrong size
const nearView = typeof IntersectionObserver === 'undefined' ? ref(true) : useElementVisibility(box, { rootMargin: '300px' })
const seen = ref(false)
watchEffect(() => {
  if (nearView.value)
    seen.value = true
})
</script>

<template>
  <div ref="box" data-section-thumbnail class="relative overflow-hidden" aria-hidden="true" inert>
    <div
      v-if="seen"
      class="pointer-events-none absolute top-0 left-0 origin-top-left"
      :style="{ width: `${renderWidth}px`, transform: `scale(${scale})` }"
    >
      <!-- Still: the final state, no motion -->
      <!-- A desktop screen's height at the render width, so a full-height hero keeps a screen's proportions -->
      <SiteThemeScope :theme="theme" still screen-height="750px">
        <SectionRenderer :section="section" :occasion="occasion" />
      </SiteThemeScope>
    </div>
  </div>
</template>
