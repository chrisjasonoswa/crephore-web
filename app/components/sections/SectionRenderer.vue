<script setup lang="ts">
import type { Section, SectionOccasion } from '~/features/sections/section.type'
import { resolveLayoutOptions } from '~/features/sections/section.options'
import { getSectionLayout } from '~/features/sections/section.registry'
import { sampleOccasion } from '~/features/sections/section.type'

// Renders any section through the registry, so pages never import layout components directly.
const props = defineProps<{
  section: Section
  // The page's event; previews without one get a sample (112 days away)
  occasion?: SectionOccasion
}>()

const fallbackOccasion = sampleOccasion()

const layout = computed(() => getSectionLayout(props.section.type, props.section.layout))
// Every option the layout offers, defaults filled in
const options = computed(() => (layout.value ? resolveLayoutOptions(layout.value.options, props.section.options) : {}))
</script>

<template>
  <component
    :is="layout.component"
    v-if="layout"
    :content="section.content"
    :background="section.background"
    :options="options"
    :occasion="occasion ?? fallbackOccasion"
  />
</template>
