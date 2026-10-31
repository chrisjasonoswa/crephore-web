<script setup lang="ts">
import type { SectionLayoutOptionChoice } from '~/features/sections/section.options'

// A 3×3 position (text position, card position) picked on a small frame, one dot per spot.
defineProps<{
  label: string
  choices: SectionLayoutOptionChoice[]
}>()

const value = defineModel<string>({ required: true })

// A single-select toggle group emits an empty value when the active item is clicked again; keep the current one.
function setValue(next: unknown) {
  if (typeof next === 'string' && next)
    value.value = next
}
</script>

<template>
  <div class="flex items-center gap-4">
    <ToggleGroup
      type="single"
      :model-value="value"
      :aria-label="label"
      class="grid w-32 shrink-0 grid-cols-3 gap-1 rounded-lg border bg-muted/50 p-1.5"
      @update:model-value="setValue"
    >
      <ToggleGroupItem
        v-for="choice in choices"
        :key="choice.value"
        :value="choice.value"
        :aria-label="choice.label"
        :title="choice.label"
        class="group h-7 min-w-0 rounded-sm! p-0 data-[state=on]:bg-primary/15"
      >
        <span class="size-2 rounded-full bg-muted-foreground/40 group-data-[state=on]:size-2.5 group-data-[state=on]:bg-primary" />
      </ToggleGroupItem>
    </ToggleGroup>
    <span class="text-sm text-muted-foreground">{{ choices.find(choice => choice.value === value)?.label }}</span>
  </div>
</template>
