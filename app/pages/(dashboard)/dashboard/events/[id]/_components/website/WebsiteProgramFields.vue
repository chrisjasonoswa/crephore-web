<script setup lang="ts">
import type { Event } from '~/features/events/event.type'
import type { ProgramContent, ProgramItem } from '~/features/sections/program/program.type'
import { GripVertical, Plus, Trash2 } from '@lucide/vue'
import { useDraggable } from 'vue-draggable-plus'
import { moveItem } from '~/features/event-websites/event-website'
import { blankProgramItem, programDayChoices, programMaxItems } from '~/features/sections/program/program.helpers'

// The program section's text: a small label (eyebrow), the heading, an overall venue and the items, in the order guests see them. Each
// item has a title, its day (the event's days and the day after), optional start and end times, venue, speakers and a
// note. Drag an item's handle, or press Arrow Up/Down on it, to reorder.
const props = defineProps<{
  event: Pick<Event, 'startsAt' | 'endsAt' | 'timezone'>
}>()

const content = defineModel<ProgramContent>('content', { required: true })

const id = useId()

const days = computed(() => programDayChoices(props.event.startsAt, props.event.endsAt, props.event.timezone))
// Items without a date are on the event's day
const dayOf = (item: ProgramItem) => item.date || days.value[0]?.value || ''

// Optional fields are removed when emptied, so the layout leaves them out
function set(key: 'eyebrow' | 'heading' | 'venue', value: string | number) {
  const text = String(value)
  content.value = { ...content.value, [key]: key === 'heading' ? text : text || undefined }
}

type ItemField = 'title' | 'date' | 'startTime' | 'endTime' | 'venue' | 'speakers' | 'description'
const setItems = (items: ProgramItem[]) => (content.value = { ...content.value, items })
function setItem(index: number, key: ItemField, value: unknown) {
  const text = value == null ? '' : String(value)
  const required = key === 'title' || key === 'date'
  setItems(content.value.items.map((item, i) => (i === index ? { ...item, [key]: required ? text : text || undefined } : item)))
}
// A new item goes on the last item's day
const addItem = () => setItems([...content.value.items, blankProgramItem(content.value.items.length ? dayOf(content.value.items.at(-1)!) : days.value[0]?.value ?? '')])
const removeItem = (index: number) => setItems(content.value.items.filter((_, i) => i !== index))
const move = (from: number, to: number) => setItems(moveItem(content.value.items, from, to))
const canAdd = computed(() => content.value.items.length < programMaxItems)

// Drag with vue-draggable-plus: put Sortable's DOM move back and reorder the list (see WebsiteSectionList)
const list = useTemplateRef<HTMLElement>('list')
useDraggable(list, computed(() => content.value.items), {
  handle: '[data-program-handle]',
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
  if (to === null || to < 0 || to >= content.value.items.length)
    return
  event.preventDefault()
  move(index, to)
  await nextTick()
  list.value?.querySelectorAll<HTMLElement>('[data-program-handle]')[to]?.focus()
}

// The panel is too narrow for "08:30 PM" plus the browser's clock icon, so the icon is hidden and clicking the field
// opens the time picker instead (typing still works)
const timeInputClass = 'px-2 [&::-webkit-calendar-picker-indicator]:hidden'
function openPicker(event: MouseEvent) {
  try {
    (event.currentTarget as HTMLInputElement).showPicker?.()
  }
  catch {
    // Not allowed in some browsers or frames; the field can still be typed in
  }
}

const label = (item: ProgramItem, index: number) => item.title || `Item ${index + 1}`
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <Label :for="`${id}-eyebrow`">Small label</Label>
      <Input :id="`${id}-eyebrow`" :model-value="content.eyebrow ?? ''" placeholder="e.g. The day" @update:model-value="set('eyebrow', $event)" />
    </div>

    <div class="flex flex-col gap-2">
      <Label :for="`${id}-heading`">Heading</Label>
      <Input :id="`${id}-heading`" :model-value="content.heading" placeholder="e.g. Program" @update:model-value="set('heading', $event)" />
    </div>

    <div class="flex flex-col gap-2">
      <Label :for="`${id}-venue`">Venue (optional)</Label>
      <Input :id="`${id}-venue`" :model-value="content.venue ?? ''" placeholder="e.g. Manila Cathedral" @update:model-value="set('venue', $event)" />
      <p class="text-xs text-muted-foreground">
        Where everything happens, shown under the heading. Give an item its own venue only when it's somewhere else.
      </p>
    </div>

    <div data-program-fields class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h5 class="text-sm font-semibold">
          Items
        </h5>
        <span class="text-xs text-muted-foreground">{{ content.items.length }} of {{ programMaxItems }}</span>
      </div>
      <p class="-mt-2 text-xs text-muted-foreground">
        Guests see them in this order. Times are optional; an end time earlier than the start means it ends after midnight. Each day starts with its date.
      </p>

      <ol ref="list" class="flex flex-col gap-2" aria-label="Program items">
        <li
          v-for="(item, index) in content.items"
          :key="item.id"
          data-program-item
          class="flex gap-1 rounded-lg border bg-background py-2 pr-2 pl-1"
        >
          <button
            type="button"
            data-program-handle
            :aria-label="`Move ${label(item, index)} (${index + 1} of ${content.items.length})`"
            title="Drag to reorder"
            class="flex h-8 w-6 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:cursor-grabbing"
            @keydown="onHandleKeydown($event, index)"
          >
            <GripVertical class="size-4" />
          </button>
          <div class="flex min-w-0 flex-1 flex-col gap-2">
            <div class="flex flex-col gap-1">
              <Label :for="`${id}-${item.id}-title`" class="text-xs">Title</Label>
              <Input :id="`${id}-${item.id}-title`" :model-value="item.title" placeholder="e.g. Ceremony" @update:model-value="setItem(index, 'title', $event)" />
            </div>
            <!-- The panel is narrow: the day gets its own row, so its label and the times fit -->
            <div class="flex flex-col gap-1">
              <Label :for="`${id}-${item.id}-date`" class="text-xs">Day</Label>
              <NativeSelect
                :id="`${id}-${item.id}-date`"
                :model-value="dayOf(item)"
                class="w-full"
                @update:model-value="setItem(index, 'date', $event)"
              >
                <NativeSelectOption v-for="day in days" :key="day.value" :value="day.value">
                  {{ day.label }}
                </NativeSelectOption>
              </NativeSelect>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div class="flex flex-col gap-1">
                <Label :for="`${id}-${item.id}-start`" class="text-xs">Starts</Label>
                <Input :id="`${id}-${item.id}-start`" type="time" :model-value="item.startTime ?? ''" :class="timeInputClass" @click="openPicker" @update:model-value="setItem(index, 'startTime', $event)" />
              </div>
              <div class="flex flex-col gap-1">
                <Label :for="`${id}-${item.id}-end`" class="text-xs">Ends</Label>
                <Input :id="`${id}-${item.id}-end`" type="time" :model-value="item.endTime ?? ''" :class="timeInputClass" @click="openPicker" @update:model-value="setItem(index, 'endTime', $event)" />
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <Label :for="`${id}-${item.id}-venue`" class="text-xs">Venue (optional)</Label>
              <Input :id="`${id}-${item.id}-venue`" :model-value="item.venue ?? ''" placeholder="e.g. Grand Ballroom" @update:model-value="setItem(index, 'venue', $event)" />
            </div>
            <div class="flex flex-col gap-1">
              <Label :for="`${id}-${item.id}-speakers`" class="text-xs">Speakers or who leads (optional)</Label>
              <Input :id="`${id}-${item.id}-speakers`" :model-value="item.speakers ?? ''" placeholder="e.g. Ana Lim, Paolo Tan" @update:model-value="setItem(index, 'speakers', $event)" />
            </div>
            <div class="flex flex-col gap-1">
              <Label :for="`${id}-${item.id}-description`" class="text-xs">Note (optional)</Label>
              <Textarea :id="`${id}-${item.id}-description`" :model-value="item.description ?? ''" rows="2" placeholder="e.g. Please be seated by 2:45." @update:model-value="setItem(index, 'description', $event)" />
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon-sm" class="text-destructive hover:text-destructive" :aria-label="`Remove ${label(item, index)}`" @click="removeItem(index)">
            <Trash2 />
          </Button>
        </li>
      </ol>

      <Button type="button" variant="outline" class="w-full border-dashed" :disabled="!canAdd" @click="addItem">
        <Plus />
        Add an item
      </Button>
    </div>
  </div>
</template>
