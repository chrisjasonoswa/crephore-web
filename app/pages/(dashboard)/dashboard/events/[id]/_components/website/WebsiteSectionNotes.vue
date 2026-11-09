<script setup lang="ts">
import type { SectionLayoutDefinition } from '~/features/sections/section.registry.type'
import type { Section } from '~/features/sections/section.type'
import CAlert from '~/components/custom/c-alert/CAlert.vue'
import { missingNotes } from '~/features/sections/section.fields'
import { getSectionType } from '~/features/sections/section.registry'

// Above a section's text in its settings: what its layout needs that's still empty (a warning). A note only: nothing
// here stops saving or publishing.
const props = defineProps<{
  section: Section
  layout: SectionLayoutDefinition
}>()

const notes = computed(() => missingNotes(getSectionType(props.section.type), props.layout, props.section.content))
</script>

<template>
  <!-- Role note, so screen readers don't announce it like an error -->
  <CAlert v-if="notes.length" data-missing-notes type="warning" size="sm" role="note" class="w-full">
    <p v-for="note in notes" :key="note">
      {{ note }}
    </p>
  </CAlert>
</template>
