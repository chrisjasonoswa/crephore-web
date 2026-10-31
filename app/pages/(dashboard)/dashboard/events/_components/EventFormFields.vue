<script setup lang="ts">
import type { FormContext } from 'vee-validate'
import type { EventFormValues } from './event.form.schema'
import type { CFormSelectOption } from '~/components/custom/c-form/CFormSelectField.vue'
import { GripVertical, Plus, Trash2 } from '@lucide/vue'
import { useFieldArray } from 'vee-validate'
import { useDraggable } from 'vue-draggable-plus'
import CFormSelectField from '~/components/custom/c-form/CFormSelectField.vue'
import CFormTextareaField from '~/components/custom/c-form/CFormTextareaField.vue'
import CFormDateTimeField from '~/components/custom/c-form/CFormDateTimeField.vue'
import CFormTextField from '~/components/custom/c-form/CFormTextField.vue'
import { listEventGroups } from '~/features/event-groups/event-group.api'
import { eventTypeLabels, eventTypes } from '~/features/events/event.type'
import { timeZoneOptions } from '~/lib/date'

const props = defineProps<{
  form?: FormContext<EventFormValues>
  viewOnly?: boolean
}>()

const typeOptions: CFormSelectOption[] = eventTypes.map(type => ({ value: type, label: eventTypeLabels[type] }))

// The host's groups to file the event under (optional).
const groupOptions = ref<CFormSelectOption[]>([])
onMounted(async () => {
  const response = await listEventGroups({ page: 1, pageSize: 100, sort: ['name:asc'] })
  groupOptions.value = response.data.items.map(group => ({ value: group.id, label: group.name }))
})

// The event's start and end are entered in this timezone
const timezoneOptions: CFormSelectOption[] = timeZoneOptions()

// The event's programme, in order (e.g. Opening → Dinner → First dance); drag the handles to reorder.
const { fields: timeline, push, remove, move } = useFieldArray<string>('timeline')

// Drag with vue-draggable-plus (SortableJS; mouse and touch). The rows are vee-validate fields,
// so instead of letting the library change the list, put Sortable's DOM move back and let `move` re-render.
const timelineList = useTemplateRef<HTMLElement>('timelineList')
useDraggable(timelineList, timeline, {
  handle: '[data-timeline-handle]',
  animation: 150,
  ghostClass: 'opacity-40',
  disabled: props.viewOnly,
  customUpdate: ({ from, item, oldIndex, newIndex }) => {
    if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex)
      return
    item.remove()
    from.insertBefore(item, from.children[oldIndex] ?? null)
    move(oldIndex, newIndex)
  },
})

// Keyboard: Arrow Up/Down on a focused handle moves the item, and focus follows it
async function onHandleKeydown(event: KeyboardEvent, index: number) {
  const to = event.key === 'ArrowUp' ? index - 1 : event.key === 'ArrowDown' ? index + 1 : null
  if (to === null || to < 0 || to >= timeline.value.length)
    return
  event.preventDefault()
  move(index, to)
  await nextTick()
  timelineList.value?.querySelectorAll<HTMLElement>('[data-timeline-handle]')[to]?.focus()
}

// Event websites are subdomains of this, e.g. jane-and-john.crephore.com
const siteDomain = useSiteAddress().domain
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid gap-4 sm:grid-cols-2">
      <CFormTextField name="name" label="Name" placeholder="e.g. Ana & Marco's wedding" />
      <CFormSelectField name="type" label="Type" :options="typeOptions" />
    </div>

    <CFormTextareaField name="description" label="Description" placeholder="Optional" :rows="3" />

    <div class="grid gap-4 sm:grid-cols-2">
      <CFormDateTimeField name="startsAt" label="Starts" />
      <CFormDateTimeField name="endsAt" label="Ends" />
      <CFormSelectField name="timezone" label="Timezone" :options="timezoneOptions" class="sm:col-span-2">
        <template #field-info>
          The timezone where the event happens. The times above are in this timezone,
          and your event website shows them with it, e.g. "3:00 PM (Manila, GMT+8)",
          so guests in other countries know it's the venue's time.
        </template>
      </CFormSelectField>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <CFormTextField name="venueName" label="Venue" placeholder="e.g. Taal Vista Hotel" />
      <CFormTextField name="venueAddress" label="Venue address" />
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <CFormTextField name="subdomain" label="Website address" placeholder="jane-and-john">
        <template #field-info>
          The link you share with guests. With <strong>jane-and-john</strong>, guests visit
          <strong>jane-and-john.{{ siteDomain }}</strong>.
          Use 3–63 lowercase letters, numbers and hyphens. Each event needs its own.
        </template>
        <template #description>
          Guests open this link to see your event.
        </template>
        <template #addon-end>
          .{{ siteDomain }}
        </template>
      </CFormTextField>
      <CFormSelectField
        name="eventGroupId"
        label="Group"
        placeholder="No group"
        :options="groupOptions"
        clearable
        clear-label="No group"
      />
    </div>

    <section class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium">
          Timeline
        </h3>
        <Button
          v-if="!viewOnly"
          type="button"
          variant="outline"
          size="sm"
          @click="push('')"
        >
          <Plus />
          Add item
        </Button>
      </div>

      <p v-if="!timeline.length" class="text-sm text-muted-foreground">
        No timeline items yet. Add the programme, e.g. Opening, Dinner, First dance.
      </p>

      <div ref="timelineList" class="flex flex-col gap-3">
        <div
          v-for="(entry, index) in timeline"
          :key="entry.key"
          class="flex items-start gap-2 rounded-lg bg-background"
        >
          <button
            v-if="!viewOnly"
            type="button"
            data-timeline-handle
            :aria-label="`Reorder timeline item ${index + 1} (Arrow Up/Down)`"
            class="mt-1 flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none active:cursor-grabbing"
            @keydown="onHandleKeydown($event, index)"
          >
            <GripVertical class="size-4" />
          </button>
          <span class="mt-2 w-5 text-sm text-muted-foreground tabular-nums">{{ index + 1 }}.</span>
          <CFormTextField :name="`timeline[${index}]`" placeholder="e.g. Opening" class="flex-1" />
          <Button
            v-if="!viewOnly"
            type="button"
            variant="ghost"
            size="icon-sm"
            class="mt-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
            :aria-label="`Remove timeline item ${index + 1}`"
            @click="remove(index)"
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </section>
  </div>
</template>
