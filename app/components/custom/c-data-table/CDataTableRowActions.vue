<script setup lang="ts">
import type { Component } from 'vue'
import { Button } from '@/components/ui/button'
import { cn } from '~/lib/utils'

export interface CDataTableRowActionsConfig<TData> {
  // Kept for zao compatibility; buttons are spaced apart, so it adds nothing here
  separator?: boolean
  buttonName?: string
  icon?: Component
  className?: string
  variant?: 'default' | 'destructive'
  onClick?: (data: TData) => void
}

// A row's actions as labelled buttons side by side (e.g. "Manage" and "Delete"), not hidden behind a "⋯" menu, so
// they're easy to find for everyone. Unlike zao's z-data-table, which uses a menu.
const props = defineProps<{
  row: any
  actions: CDataTableRowActionsConfig<any>[]
}>()

const buttons = computed(() => props.actions.filter(action => !action.separator))
</script>

<template>
  <div class="flex items-center justify-end gap-1.5">
    <Button
      v-for="(action, index) in buttons"
      :key="index"
      type="button"
      size="sm"
      variant="outline"
      data-row-action
      :class="cn(
        'h-7 cursor-pointer gap-1 bg-transparent px-2.5 text-xs shadow-none',
        // Coloured outlines so they stand out in the row: the main colour, and red for destructive actions
        action.variant === 'destructive'
          ? 'border-destructive/60 text-destructive hover:border-destructive hover:bg-destructive/10 hover:text-destructive dark:border-destructive/60 dark:bg-transparent dark:hover:bg-destructive/15'
          : 'border-primary/60 text-primary hover:border-primary hover:bg-primary/10 hover:text-primary dark:border-primary/60 dark:bg-transparent dark:hover:bg-primary/15',
        action.className,
      )"
      @click="action.onClick?.(props.row)"
    >
      <component :is="action.icon" v-if="action.icon" class="size-3.5" aria-hidden="true" />
      {{ action.buttonName }}
    </Button>
  </div>
</template>
