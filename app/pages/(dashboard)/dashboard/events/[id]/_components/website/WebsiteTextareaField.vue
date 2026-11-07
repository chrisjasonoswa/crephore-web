<script setup lang="ts">
// Longer text of a section in the editor (a story, a message, a bio): a label and a textarea (`size="sm"` inside a list
// item). The editor that uses it decides what an emptied field is saved as.
withDefaults(defineProps<{
  label: string
  placeholder?: string
  rows?: number
  size?: 'default' | 'sm'
  // The layout needs it filled in: marked "Required" while empty
  required?: boolean
}>(), {
  rows: 3,
  size: 'default',
})

const value = defineModel<string>({ required: true })
const id = useId()
</script>

<template>
  <div class="flex flex-col" :class="size === 'sm' ? 'gap-1' : 'gap-2'">
    <div class="flex items-center justify-between gap-2">
      <Label :for="id" :class="size === 'sm' && 'text-xs'">{{ label }}</Label>
      <span v-if="required && !value.trim()" data-required class="text-xs font-medium text-amber-700 dark:text-amber-400">Required</span>
    </div>
    <Textarea :id="id" :model-value="value" :rows="rows" :placeholder="placeholder" @update:model-value="value = String($event)" />
  </div>
</template>
