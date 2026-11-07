<script setup lang="ts">
import type { SectionLayoutDefinition } from '~/features/sections/section.registry.type'
import type { Section } from '~/features/sections/section.type'
import CAlert from '~/components/custom/c-alert/CAlert.vue'
import { fieldNotes } from '~/features/sections/section.fields'
import { getSectionType } from '~/features/sections/section.registry'

// Above a section's text in its settings: what its layout needs that's still empty (a warning), and what's filled in
// but not shown in this layout (kept for layouts that do). Notes only: nothing here stops saving or publishing.
const props = defineProps<{
  section: Section
  layout: SectionLayoutDefinition
}>()

const notes = computed(() => fieldNotes(getSectionType(props.section.type), props.layout, props.section.content))
</script>

<template>
  <!-- Role note, so screen readers don't announce them like errors -->
  <CAlert v-if="notes.missing.length" data-missing-notes type="warning" size="sm" role="note" class="w-full">
    <p v-for="note in notes.missing" :key="note">
      {{ note }}
    </p>
  </CAlert>
  <CAlert v-if="notes.hidden.length" data-hidden-notes type="info" size="sm" role="note" class="w-full">
    <p v-for="note in notes.hidden" :key="note">
      {{ note }}
    </p>
  </CAlert>
</template>
