<script setup lang="ts" generic="T extends string">
import { Check } from '@lucide/vue'

// Pick one of a few choices, as cards side by side: the chosen one gets a strong border, a bold label and a check
// badge, so it stands out at a glance. `#swatch` puts something above a choice's label (e.g. a colour).
defineProps<{
  choices: { value: T, label: string }[]
  // Names the group for screen readers
  label: string
}>()

const value = defineModel<T>({ required: true })

defineSlots<{
  swatch?: (props: { choice: { value: T, label: string }, selected: boolean }) => unknown
}>()

// A single-select toggle group emits an empty value when the chosen card is clicked again; keep the current one
function choose(next: unknown) {
  if (typeof next === 'string' && next)
    value.value = next as T
}
</script>

<template>
  <ToggleGroup
    type="single"
    variant="outline"
    :spacing="2"
    :model-value="value"
    :aria-label="label"
    class="grid w-full auto-cols-fr grid-flow-col pt-1 pe-1"
    @update:model-value="choose"
  >
    <ToggleGroupItem
      v-for="choice in choices"
      :key="choice.value"
      :value="choice.value"
      data-choice
      class="relative h-auto min-h-10 flex-col gap-2 rounded-lg bg-card px-2 py-2.5 text-xs font-normal hover:border-primary/40 hover:bg-card data-[state=on]:border-primary data-[state=on]:bg-card data-[state=on]:font-semibold data-[state=on]:ring-[0.5px] data-[state=on]:ring-primary"
    >
      <slot name="swatch" :choice="choice" :selected="choice.value === value" />
      {{ choice.label }}
      <span
        aria-hidden="true"
        class="absolute -end-1 -top-1 hidden size-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm group-data-[state=on]/toggle:flex"
      >
        <Check class="size-2.5" stroke-width="3.5" />
      </span>
    </ToggleGroupItem>
  </ToggleGroup>
</template>
