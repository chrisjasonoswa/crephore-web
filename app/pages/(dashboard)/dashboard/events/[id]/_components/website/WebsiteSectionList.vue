<script setup lang="ts">
import type { WebsiteSection } from '~/features/event-websites/event-website.type'
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, GripVertical, MoreHorizontal, Pencil, Trash2 } from '@lucide/vue'
import { useDraggable } from 'vue-draggable-plus'
import { getSectionLayout, getSectionType } from '~/features/sections/section.registry'

// The page's sections in order: drag the handles (or Arrow Up/Down on a focused handle) to reorder, the eye to
// hide or show one, the row to edit it; the menu has the rest.
const props = defineProps<{
  sections: WebsiteSection[]
}>()

const emit = defineEmits<{
  select: [key: string]
  move: [from: number, to: number]
  toggleVisible: [section: WebsiteSection]
  duplicate: [section: WebsiteSection]
  delete: [section: WebsiteSection]
}>()

const typeName = (section: WebsiteSection) => getSectionType(section.type).name
const layoutName = (section: WebsiteSection) => getSectionLayout(section.type, section.layout)?.name

// Drag with vue-draggable-plus (SortableJS; mouse and touch). The list belongs to the editor, so put Sortable's
// DOM move back and let the editor reorder it.
const list = useTemplateRef<HTMLElement>('list')
useDraggable(list, toRef(props, 'sections'), {
  handle: '[data-section-handle]',
  animation: 150,
  ghostClass: 'opacity-40',
  customUpdate: ({ from, item, oldIndex, newIndex }) => {
    if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex)
      return
    item.remove()
    from.insertBefore(item, from.children[oldIndex] ?? null)
    emit('move', oldIndex, newIndex)
  },
})

// Keyboard: Arrow Up/Down on a focused handle moves the section, and focus follows it
async function onHandleKeydown(event: KeyboardEvent, index: number) {
  const to = event.key === 'ArrowUp' ? index - 1 : event.key === 'ArrowDown' ? index + 1 : null
  if (to === null || to < 0 || to >= props.sections.length)
    return
  event.preventDefault()
  emit('move', index, to)
  await nextTick()
  list.value?.querySelectorAll<HTMLElement>('[data-section-handle]')[to]?.focus()
}
</script>

<template>
  <ol ref="list" class="flex flex-col gap-2" aria-label="Sections">
    <li
      v-for="(section, index) in sections"
      :key="section.key"
      data-section-row
      class="flex items-center gap-1 rounded-lg border bg-card py-1.5 pr-1 pl-1"
    >
      <button
        type="button"
        data-section-handle
        :aria-label="`Move ${typeName(section)} (${index + 1} of ${sections.length})`"
        title="Drag to reorder"
        class="flex h-8 w-6 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:cursor-grabbing"
        @keydown="onHandleKeydown($event, index)"
      >
        <GripVertical class="size-4" />
      </button>

      <button
        type="button"
        class="flex min-w-0 flex-1 cursor-pointer flex-col items-start rounded px-1.5 py-0.5 text-left hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        :class="!section.isVisible && 'opacity-60'"
        @click="emit('select', section.key)"
      >
        <span class="text-sm font-medium">{{ typeName(section) }}</span>
        <span class="w-full truncate text-xs text-muted-foreground">
          {{ layoutName(section) }}<template v-if="!section.isVisible"> · Hidden</template>
        </span>
      </button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        :aria-label="section.isVisible ? `Hide ${typeName(section)}` : `Show ${typeName(section)}`"
        :title="section.isVisible ? 'Hide from guests' : 'Show to guests'"
        @click="emit('toggleVisible', section)"
      >
        <Eye v-if="section.isVisible" />
        <EyeOff v-else class="text-muted-foreground" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button type="button" variant="ghost" size="icon-sm" :aria-label="`More actions for ${typeName(section)}`">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem @select="emit('select', section.key)">
            <Pencil /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem :disabled="index === 0" @select="emit('move', index, index - 1)">
            <ArrowUp /> Move up
          </DropdownMenuItem>
          <DropdownMenuItem :disabled="index === sections.length - 1" @select="emit('move', index, index + 1)">
            <ArrowDown /> Move down
          </DropdownMenuItem>
          <DropdownMenuItem @select="emit('duplicate', section)">
            <Copy /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" @select="emit('delete', section)">
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  </ol>
</template>
