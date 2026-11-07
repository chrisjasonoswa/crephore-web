<script setup lang="ts" generic="T">
import { GripVertical, Plus, Trash2 } from '@lucide/vue'
import { useDraggable } from 'vue-draggable-plus'
import { moveItem } from '~/features/event-websites/event-website'

// A list of a section's items in the editor (about's chapters, the people): a heading with the count, each item with a
// drag handle (drag it, or press Arrow Up/Down on it, to reorder) and a remove button, then "Add …" up to `max`. Each
// item's own fields go in the `#item` slot; the editor that uses it edits them, so it keeps its own rules for empty
// values. `name` names the items' hooks (`data-<name>-item`, `data-<name>-handle`); `itemLabel` names an item for its
// buttons ("Move Bea Santos (1 of 3)", "Remove chapter 2"); `keyOf` keys items by an id when they have one, else by
// position (an item's object changes with every edit, so keying by it would rebuild its inputs while typing).
const props = withDefaults(defineProps<{
  label: string
  addLabel: string
  max: number
  name: string
  create: () => T
  itemLabel: (item: T, index: number) => string
  keyOf?: (item: T, index: number) => string | number
  // The layout needs at least one item: marked "Required" while empty
  required?: boolean
}>(), {
  keyOf: (_item: unknown, index: number) => index,
})

const items = defineModel<T[]>({ required: true })

defineSlots<{
  description?: () => unknown
  item: (props: { item: T, index: number }) => unknown
}>()

const canAdd = computed(() => items.value.length < props.max)
const add = () => (items.value = [...items.value, props.create()])
const remove = (index: number) => (items.value = items.value.filter((_, i) => i !== index))
const move = (from: number, to: number) => (items.value = moveItem(items.value, from, to))

// Drag with vue-draggable-plus: put Sortable's DOM move back and reorder the list (see WebsiteSectionList)
const list = useTemplateRef<HTMLElement>('list')
useDraggable(list, items, {
  handle: `[data-${props.name}-handle]`,
  animation: 150,
  ghostClass: 'opacity-40',
  customUpdate: ({ from, item, oldIndex, newIndex }) => {
    if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex)
      return
    item.remove()
    from.insertBefore(item, from.children[oldIndex] ?? null)
    move(oldIndex, newIndex)
  },
})

async function onHandleKeydown(event: KeyboardEvent, index: number) {
  const to = event.key === 'ArrowUp' ? index - 1 : event.key === 'ArrowDown' ? index + 1 : null
  if (to === null || to < 0 || to >= items.value.length)
    return
  event.preventDefault()
  move(index, to)
  await nextTick()
  list.value?.querySelectorAll<HTMLElement>(`[data-${props.name}-handle]`)[to]?.focus()
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <h5 class="text-sm font-semibold">
        {{ label }}
      </h5>
      <span class="flex items-center gap-2 text-xs">
        <span v-if="required && !items.length" data-required class="font-medium text-amber-700 dark:text-amber-400">Required</span>
        <span class="text-muted-foreground">{{ items.length }} of {{ max }}</span>
      </span>
    </div>
    <slot name="description" />

    <ol ref="list" class="flex flex-col gap-2" :aria-label="label">
      <li
        v-for="(item, index) in items"
        :key="keyOf(item, index)"
        v-bind="{ [`data-${name}-item`]: '' }"
        class="flex gap-1 rounded-lg border bg-background py-2 pr-2 pl-1"
      >
        <button
          type="button"
          v-bind="{ [`data-${name}-handle`]: '' }"
          :aria-label="`Move ${itemLabel(item, index)} (${index + 1} of ${items.length})`"
          title="Drag to reorder"
          class="flex h-8 w-6 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:cursor-grabbing"
          @keydown="onHandleKeydown($event, index)"
        >
          <GripVertical class="size-4" />
        </button>
        <div class="flex min-w-0 flex-1 flex-col gap-2">
          <slot name="item" :item="item" :index="index" />
        </div>
        <Button type="button" variant="ghost" size="icon-sm" class="text-destructive hover:text-destructive" :aria-label="`Remove ${itemLabel(item, index)}`" @click="remove(index)">
          <Trash2 />
        </Button>
      </li>
    </ol>

    <Button type="button" variant="outline" class="w-full border-dashed" :disabled="!canAdd" @click="add">
      <Plus />
      {{ addLabel }}
    </Button>
  </div>
</template>
