<script setup lang="ts">
import type { Component } from 'vue'

export interface CPillTab {
  value: string
  label: string
  icon?: Component
}

// The tab buttons of a shadcn `Tabs` as rounded pills (the active one filled with the primary colour).
// Put it inside `<Tabs>` in place of `TabsList`; scrolls sideways when the tabs don't fit.
// `after:hidden`: the shadcn trigger's underline indicator (for the line variant) sits 5px below each tab, and
// would make the scrolling list scroll vertically too.
defineProps<{
  tabs: CPillTab[]
  label?: string
}>()
</script>

<template>
  <TabsList
    :aria-label="label"
    class="h-auto w-full justify-start gap-2 overflow-x-auto rounded-none bg-transparent p-0 group-data-horizontal/tabs:h-auto"
  >
    <TabsTrigger
      v-for="tab in tabs"
      :key="tab.value"
      :value="tab.value"
      class="h-9 flex-none rounded-full border-0 after:hidden bg-secondary/60 px-4 text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground group-data-[variant=default]/tabs-list:data-active:shadow-none data-active:bg-primary data-active:text-primary-foreground dark:text-secondary-foreground dark:hover:text-secondary-foreground dark:data-active:border-transparent dark:data-active:bg-primary dark:data-active:text-primary-foreground"
    >
      <component :is="tab.icon" v-if="tab.icon" />
      {{ tab.label }}
    </TabsTrigger>
  </TabsList>
</template>
