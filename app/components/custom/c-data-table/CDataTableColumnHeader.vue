<script setup lang="ts">
import { ArrowDown, ArrowUp } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { cn } from '~/lib/utils'

const props = defineProps<{
  column: any
  title: string
  class?: string
}>()

const canSort = computed(() => {
  if (props.column?.columnDef?.enableSorting === false) {
    return false
  }

  return typeof props.column?.toggleSorting === 'function'
})

const handleToggleSorting = () => {
  const sortDirection = props.column?.getIsSorted?.()

  if (sortDirection === 'asc') {
    props.column?.toggleSorting?.(true)
    return
  }

  if (sortDirection === 'desc') {
    props.column?.clearSorting?.()
    return
  }

  props.column?.toggleSorting?.(false)
}
</script>

<template>
  <div v-if="!canSort" :class="cn(props.class)">
    {{ title }}
  </div>

  <div v-else :class="cn('flex items-center space-x-2', props.class)">
    <Button
      variant="ghost"
      size="sm"
      class="-ml-3 h-8 cursor-pointer hover:bg-accent"
      @click="handleToggleSorting"
    >
      <span>{{ title }}</span>
      <ArrowDown v-if="column.getIsSorted() === 'desc'" class="ml-2 h-4 w-4" />
      <ArrowUp v-else-if="column.getIsSorted() === 'asc'" class="ml-2 h-4 w-4" />
    </Button>
  </div>
</template>
