<script setup lang="ts">
import { MoreHorizontal } from '@lucide/vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '~/lib/utils'

export interface CDataTableRowActionsConfig<TData> {
  separator?: boolean
  buttonName?: string
  className?: string
  variant?: 'default' | 'destructive'
  onClick?: (data: TData) => void
}

const props = defineProps<{
  row: any
  actions: CDataTableRowActionsConfig<any>[]
}>()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="outline"
        size="icon"
        class="flex h-8 w-8 cursor-pointer p-0 shadow-none data-[state=open]:bg-muted"
      >
        <MoreHorizontal class="text-primary" />
        <span class="sr-only">Open menu</span>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" class="w-40">
      <template v-for="(action, index) in actions" :key="index">
        <DropdownMenuSeparator v-if="action.separator" />

        <DropdownMenuItem
          v-else
          :class="cn('cursor-pointer', action.className)"
          :variant="action.variant"
          @click="action.onClick?.(props.row)"
        >
          {{ action.buttonName }}
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
