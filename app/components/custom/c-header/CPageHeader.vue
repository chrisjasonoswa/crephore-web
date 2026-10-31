<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
}>()

useHead({ title: () => props.title })
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 class="text-3xl font-semibold tracking-tight">
        {{ title }}
      </h1>
      <!-- #description for richer content, e.g. an event's date -->
      <div v-if="$slots.description" class="mt-1 text-muted-foreground">
        <slot name="description" />
      </div>
      <p v-else-if="description" class="mt-1 text-muted-foreground">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
