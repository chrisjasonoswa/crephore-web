<script setup lang="ts">
import type { Section } from '~/features/sections/section.type'
import { getSectionLayout } from '~/features/sections/section.registry'

// Renders any section through the registry, so pages never import layout components directly.
const props = defineProps<{ section: Section }>()

const layout = computed(() => getSectionLayout(props.section.type, props.section.layout))
</script>

<template>
  <component
    :is="layout.component"
    v-if="layout"
    :content="section.content"
    :background="section.background"
  />
</template>
