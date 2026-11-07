<script setup lang="ts">
// One line of a section's text in the editor: a label and an input (`size="sm"` inside a list item). The editor that
// uses it decides what an emptied field is saved as.
withDefaults(defineProps<{
  label: string
  placeholder?: string
  size?: 'default' | 'sm'
  // The layout needs it filled in: marked "Required" while empty
  required?: boolean
}>(), {
  size: 'default',
})

const value = defineModel<string>({ required: true })
const id = useId()
</script>

<template>
  <div class="flex flex-col" :class="size === 'sm' ? 'gap-1.5' : 'gap-2'">
    <div class="flex items-center justify-between gap-2">
      <Label :for="id" :class="size === 'sm' && 'text-xs'">{{ label }}</Label>
      <span v-if="required && !value.trim()" data-required class="text-xs font-medium text-amber-700 dark:text-amber-400">Required</span>
    </div>
    <Input :id="id" :model-value="value" :placeholder="placeholder" @update:model-value="value = String($event)" />
  </div>
</template>
