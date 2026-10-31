<script setup lang="ts">
import { X } from '@lucide/vue'

// One photo URL in the playground's photo list.
const props = defineProps<{
  url: string
  index: number
}>()

const emit = defineEmits<{
  'update:url': [url: string]
  'remove': []
}>()

const label = computed(() => `Photo ${props.index + 1}`)
</script>

<template>
  <div class="flex items-center gap-2">
    <Input
      :model-value="url"
      type="url"
      :aria-label="`${label} URL`"
      :placeholder="`${label}: https://…`"
      @update:model-value="emit('update:url', String($event).trim())"
    />
    <Button type="button" variant="ghost" size="icon-sm" :aria-label="`Remove ${label.toLowerCase()}`" @click="emit('remove')">
      <X />
    </Button>
  </div>
</template>
