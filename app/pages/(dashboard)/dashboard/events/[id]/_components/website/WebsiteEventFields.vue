<script setup lang="ts">
import CAlert from '~/components/custom/c-alert/CAlert.vue'

// Section text that comes from the event (the hero's heading, a memorial's life dates, date and place, the countdown's
// heading): an info alert naming them, with a link to the Details tab to change them, then each shown as plain text.
// Never editable here and never saved with the section. The `control` slot puts a section setting between a field's
// label and its value (e.g. how the life dates show).
const props = defineProps<{
  fields: { label: string, value: string }[]
}>()

defineSlots<{
  control?: (props: { field: { label: string, value: string } }) => unknown
}>()

const route = useRoute()

// "Heading, date and place are" / "Heading is"
const subject = computed(() => {
  const labels = props.fields.map((field, index) => (index === 0 ? field.label : field.label.toLowerCase()))
  const list = labels.length > 1 ? `${labels.slice(0, -1).join(', ')} and ${labels.at(-1)}` : labels[0]
  return `${list} ${labels.length > 1 ? 'are' : 'is'}`
})
</script>

<template>
  <div class="flex flex-col gap-4" data-event-fields>
    <!-- Role note, so screen readers don't announce it like an error -->
    <CAlert type="info" role="note">
      {{ subject }} from the event details. <NuxtLink :to="{ query: { ...route.query, tab: undefined } }" class="font-medium underline underline-offset-2">Click here to edit event details</NuxtLink>
    </CAlert>

    <dl class="flex flex-col gap-4">
      <div v-for="field in fields" :key="field.label" class="flex flex-col gap-1.5">
        <dt class="text-sm font-medium">
          {{ field.label }}
        </dt>
        <slot name="control" :field="field" />
        <dd class="ps-3 text-sm">
          {{ field.value }}
        </dd>
      </div>
    </dl>
  </div>
</template>
