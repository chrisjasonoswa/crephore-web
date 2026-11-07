<script setup lang="ts">
import type { EventProgram, EventProgramDraft, EventProgramDraftItem } from '~/features/event-programs/event-program.type'
import type { EventVenue } from '~/features/event-venues/event-venue.type'
import type { Event } from '~/features/events/event.type'
import { GripVertical, MapPin, Plus, Trash2 } from '@lucide/vue'
import { useEventListener } from '@vueuse/core'
import { useDraggable } from 'vue-draggable-plus'
import CConfirmationModal from '~/components/custom/c-modal/CConfirmationModal.vue'
import { isSameProgram, mapProgramToRequest, programErrors, programFromApi } from '~/features/event-programs/event-program'
import { updateEventProgram } from '~/features/event-programs/event-program.api'
import { moveItem } from '~/features/event-websites/event-website'
import { blankProgramItem, formatProgramDate, programDayChoices, programMaxItems } from '~/features/sections/program/program.helpers'
import { getApiErrors } from '~/lib/axios'
import { cToast } from '~/lib/cToast'
import EventAddVenueDialog from './EventAddVenueDialog.vue'
import EventSaveBar from './EventSaveBar.vue'

// The Program tab: the event's schedule, which every program section of its website shows. The items in the order
// guests see them: a title, a day, optional start and end times, one of the event's venues (the Venues tab; a new
// item starts at the main venue, and "Add a venue" adds one without leaving), speakers and a note. Drag an item's
// handle, or press Arrow Up/Down on it, to reorder. Saved with PUT /events/{id}/program.
const props = defineProps<{
  event: Event
  program: EventProgram
  // The saved venues, in order (the first is the main venue)
  venues: EventVenue[]
}>()

const emit = defineEmits<{
  'saved': [program: EventProgram]
  // A venue was added from an item
  'venues-saved': [venues: EventVenue[]]
}>()

const canEdit = computed(() => props.event.access.includes('Owner'))
const id = useId()

// The program as last saved, and the copy being edited
const saved = ref<EventProgramDraft>(programFromApi(props.program))
const draft = ref<EventProgramDraft>(programFromApi(props.program))
const isSubmitting = ref(false)

const isDirty = computed(() => !isSameProgram(draft.value, saved.value))

// The program read again elsewhere (a removed venue's items moved to the main venue): the new saved program, and the
// one to edit unless there are edits
watch(() => props.program, (program) => {
  const fresh = programFromApi(program)
  if (!isDirty.value)
    draft.value = fresh
  saved.value = fresh
})

// An item whose venue was removed moves to the main venue, as the API moved the saved ones
watch(() => props.venues, (venues) => {
  const ids = new Set(venues.map(venue => venue.id))
  if (draft.value.items.some(item => item.venueId != null && !ids.has(item.venueId)))
    draft.value = { ...draft.value, items: draft.value.items.map(item => (item.venueId != null && !ids.has(item.venueId) ? { ...item, venueId: venues[0]?.id } : item)) }
})

/* Errors: the API's rules, checked here once a save was tried; the API's own (keyed the same) until the next edit */
const hasTriedSaving = ref(false)
const serverErrors = ref<Record<string, string[]>>({})
const errors = computed<Record<string, string>>(() => ({
  ...Object.fromEntries(Object.entries(serverErrors.value).map(([key, messages]) => [key, messages[0] ?? ''])),
  ...(hasTriedSaving.value ? programErrors(draft.value) : {}),
}))
const errorOf = (index: number, field: string) => errors.value[`items[${index}].${field}`]
// Errors about the program as a whole (e.g. an item removed elsewhere)
const programError = computed(() => serverErrors.value.items?.[0])

function setDraft(next: EventProgramDraft) {
  draft.value = next
  serverErrors.value = {}
}

/* Items */
const days = computed(() => programDayChoices(props.event.startsAt, props.event.endsAt, props.event.timezone))
// The event's days, plus the item's own date when it's another (e.g. the event moved since)
const dayChoicesFor = (item: EventProgramDraftItem) => days.value.some(day => day.value === item.date) || !item.date
  ? days.value
  : [...days.value, { value: item.date, label: formatProgramDate(item.date) }]

type ItemField = 'title' | 'date' | 'startTime' | 'endTime' | 'speakers' | 'description'
const setItems = (items: EventProgramDraftItem[]) => setDraft({ ...draft.value, items })
function setItem(index: number, key: ItemField, value: unknown) {
  const text = value == null ? '' : String(value)
  // Optional fields are removed when emptied, so the layouts leave them out
  const required = key === 'title' || key === 'date'
  setItems(draft.value.items.map((item, i) => (i === index ? { ...item, [key]: required ? text : text || undefined } : item)))
}
// A new item goes on the last item's day, at the main venue
const addItem = () => setItems([...draft.value.items, {
  ...blankProgramItem(draft.value.items.at(-1)?.date ?? days.value[0]?.value ?? ''),
  ...(props.venues[0] && { venueId: props.venues[0].id }),
}])
const removeItem = (index: number) => setItems(draft.value.items.filter((_, i) => i !== index))
const move = (from: number, to: number) => setItems(moveItem(draft.value.items, from, to))
const canAdd = computed(() => draft.value.items.length < programMaxItems)

// Drag with vue-draggable-plus: put Sortable's DOM move back and reorder the list (see WebsiteSectionList)
const list = useTemplateRef<HTMLElement>('list')
useDraggable(list, computed(() => draft.value.items), {
  handle: '[data-program-handle]',
  animation: 150,
  ghostClass: 'opacity-40',
  disabled: !canEdit.value,
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
  if (to === null || to < 0 || to >= draft.value.items.length)
    return
  event.preventDefault()
  move(index, to)
  await nextTick()
  list.value?.querySelectorAll<HTMLElement>('[data-program-handle]')[to]?.focus()
}

// Clicking a time field opens the time picker (typing still works)
function openPicker(event: MouseEvent) {
  try {
    (event.currentTarget as HTMLInputElement).showPicker?.()
  }
  catch {
    // Not allowed in some browsers or frames; the field can still be typed in
  }
}

const label = (item: EventProgramDraftItem, index: number) => item.title || `Item ${index + 1}`

/* Venues: the Select's values are ids as text, plus "none" and "add" (opens the dialog; the value stays) */
const NO_VENUE = 'none'
const ADD_VENUE = 'add'
const venueValue = (item: EventProgramDraftItem) => (item.venueId != null ? String(item.venueId) : NO_VENUE)
const addingVenueFor = ref<number | null>(null)
const isAddVenueOpen = computed({
  get: () => addingVenueFor.value !== null,
  set: (open: boolean) => {
    if (!open)
      addingVenueFor.value = null
  },
})
function setVenue(index: number, value: unknown) {
  if (value === ADD_VENUE) {
    addingVenueFor.value = index
    return
  }
  const venueId = value === NO_VENUE || value == null ? undefined : Number(value)
  setItems(draft.value.items.map((item, i) => (i === index ? { ...item, venueId } : item)))
}
function onVenueAdded(venues: EventVenue[], venue: EventVenue) {
  const index = addingVenueFor.value
  emit('venues-saved', venues)
  if (index !== null)
    setVenue(index, String(venue.id))
}

/* Saving */
async function save() {
  hasTriedSaving.value = true
  if (Object.keys(programErrors(draft.value)).length)
    return
  isSubmitting.value = true
  const sent = draft.value
  try {
    const response = await updateEventProgram(props.event.id, mapProgramToRequest(sent))
    saved.value = programFromApi(response.data)
    // Edits made while saving stay; otherwise the saved program (with its ids) is the new starting point
    if (draft.value === sent)
      draft.value = saved.value
    hasTriedSaving.value = false
    emit('saved', response.data)
    cToast({ title: 'Program saved.', type: 'success' })
  }
  catch (error) {
    serverErrors.value = getApiErrors(error) ?? {}
  }
  finally {
    isSubmitting.value = false
  }
}

function discardChanges() {
  draft.value = saved.value
  serverErrors.value = {}
  hasTriedSaving.value = false
}

/* Unsaved changes: ask before leaving the page (switching tabs keeps them) */
const isLeaveConfirmOpen = ref(false)
let resolveLeave: ((leave: boolean) => void) | null = null

function settleLeave(leave: boolean) {
  resolveLeave?.(leave)
  resolveLeave = null
}

onBeforeRouteLeave(() => {
  if (!isDirty.value || isSubmitting.value)
    return true
  isLeaveConfirmOpen.value = true
  return new Promise<boolean>(resolve => (resolveLeave = resolve))
})

// Closed without confirming (Cancel, Escape, outside click): stay
watch(isLeaveConfirmOpen, (open) => {
  if (!open)
    settleLeave(false)
})

// Closing or reloading the browser tab
useEventListener(window, 'beforeunload', (event: BeforeUnloadEvent) => {
  if (isDirty.value)
    event.preventDefault()
})
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="save">
    <EventSaveBar v-if="canEdit" :is-dirty="isDirty" :is-submitting="isSubmitting" @discard="discardChanges" />

    <fieldset :disabled="!canEdit" class="flex min-w-0 flex-col gap-6 rounded-xl border bg-card p-4 sm:p-6">
      <div data-program-fields class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">
            Items
          </h2>
          <span class="text-xs text-muted-foreground">{{ draft.items.length }} of {{ programMaxItems }}</span>
        </div>
        <p class="-mt-2 text-sm text-muted-foreground">
          Guests see them in this order. Times are optional; an end time earlier than the start means it ends after midnight. Each day starts with its date. Venues come from the Venues tab.
        </p>

        <p v-if="programError" class="text-sm text-destructive" role="alert">
          {{ programError }}
        </p>

        <p v-if="!draft.items.length" class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No items yet. The program section stays hidden on your website until you add one.
        </p>

        <ol ref="list" class="flex flex-col gap-3" aria-label="Program items">
          <li
            v-for="(item, index) in draft.items"
            :key="item.id"
            data-program-item
            class="flex gap-2 rounded-lg border bg-background py-3 pr-3 pl-1.5"
          >
            <button
              v-if="canEdit"
              type="button"
              data-program-handle
              :aria-label="`Move ${label(item, index)} (${index + 1} of ${draft.items.length})`"
              title="Drag to reorder"
              class="flex h-8 w-6 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:cursor-grabbing"
              @keydown="onHandleKeydown($event, index)"
            >
              <GripVertical class="size-4" />
            </button>
            <div class="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div class="flex flex-col gap-1 lg:col-span-2">
                <Label :for="`${id}-${item.id}-title`" class="text-xs">Title</Label>
                <Input :id="`${id}-${item.id}-title`" :model-value="item.title" placeholder="e.g. Ceremony" :aria-invalid="!!errorOf(index, 'title')" @update:model-value="setItem(index, 'title', $event)" />
                <p v-if="errorOf(index, 'title')" class="text-xs text-destructive">
                  {{ errorOf(index, 'title') }}
                </p>
              </div>
              <div class="flex flex-col gap-1">
                <Label :for="`${id}-${item.id}-date`" class="text-xs">Day</Label>
                <Select :model-value="item.date || undefined" @update:model-value="setItem(index, 'date', $event)">
                  <SelectTrigger :id="`${id}-${item.id}-date`" class="w-full" :aria-invalid="!!errorOf(index, 'date')">
                    <SelectValue placeholder="Pick a day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="day in dayChoicesFor(item)" :key="day.value" :value="day.value">
                      {{ day.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="errorOf(index, 'date')" class="text-xs text-destructive">
                  {{ errorOf(index, 'date') }}
                </p>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div class="flex flex-col gap-1">
                  <Label :for="`${id}-${item.id}-start`" class="text-xs">Starts</Label>
                  <Input :id="`${id}-${item.id}-start`" type="time" :model-value="item.startTime ?? ''" class="px-2" @click="openPicker" @update:model-value="setItem(index, 'startTime', $event)" />
                </div>
                <div class="flex flex-col gap-1">
                  <Label :for="`${id}-${item.id}-end`" class="text-xs">Ends</Label>
                  <Input :id="`${id}-${item.id}-end`" type="time" :model-value="item.endTime ?? ''" class="px-2" :aria-invalid="!!errorOf(index, 'endTime')" @click="openPicker" @update:model-value="setItem(index, 'endTime', $event)" />
                </div>
                <p v-if="errorOf(index, 'endTime')" class="col-span-2 text-xs text-destructive">
                  {{ errorOf(index, 'endTime') }}
                </p>
              </div>
              <div class="flex flex-col gap-1 lg:col-span-2">
                <Label :for="`${id}-${item.id}-venue`" class="text-xs">Venue</Label>
                <Select :model-value="venueValue(item)" @update:model-value="setVenue(index, $event)">
                  <SelectTrigger :id="`${id}-${item.id}-venue`" data-program-venue class="w-full" :aria-invalid="!!errorOf(index, 'venueId')">
                    <MapPin class="text-muted-foreground" aria-hidden="true" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="(venue, venueIndex) in venues" :key="venue.id" :value="String(venue.id)">
                      {{ venue.name }}<span v-if="venueIndex === 0" class="text-muted-foreground"> · Main venue</span>
                    </SelectItem>
                    <SelectItem :value="NO_VENUE">
                      No venue
                    </SelectItem>
                    <SelectSeparator />
                    <SelectItem :value="ADD_VENUE" data-add-venue>
                      <Plus aria-hidden="true" />
                      Add a venue…
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="errorOf(index, 'venueId')" class="text-xs text-destructive">
                  {{ errorOf(index, 'venueId') }}
                </p>
              </div>
              <div class="flex flex-col gap-1 lg:col-span-2">
                <Label :for="`${id}-${item.id}-speakers`" class="text-xs">Speakers or who leads (optional)</Label>
                <Input :id="`${id}-${item.id}-speakers`" :model-value="item.speakers ?? ''" placeholder="e.g. Ana Lim, Paolo Tan" @update:model-value="setItem(index, 'speakers', $event)" />
                <p v-if="errorOf(index, 'speakers')" class="text-xs text-destructive">
                  {{ errorOf(index, 'speakers') }}
                </p>
              </div>
              <div class="flex flex-col gap-1 sm:col-span-2 lg:col-span-4">
                <Label :for="`${id}-${item.id}-description`" class="text-xs">Note (optional)</Label>
                <Textarea :id="`${id}-${item.id}-description`" :model-value="item.description ?? ''" rows="2" placeholder="e.g. Please be seated by 2:45." @update:model-value="setItem(index, 'description', $event)" />
                <p v-if="errorOf(index, 'description')" class="text-xs text-destructive">
                  {{ errorOf(index, 'description') }}
                </p>
              </div>
            </div>
            <Button v-if="canEdit" type="button" variant="ghost" size="icon-sm" class="text-destructive hover:text-destructive" :aria-label="`Remove ${label(item, index)}`" @click="removeItem(index)">
              <Trash2 />
            </Button>
          </li>
        </ol>

        <Button v-if="canEdit" type="button" variant="outline" class="w-full border-dashed" :disabled="!canAdd" @click="addItem">
          <Plus />
          Add an item
        </Button>
      </div>
    </fieldset>

    <EventAddVenueDialog v-model:is-open="isAddVenueOpen" :event-id="event.id" :venues="venues" @added="onVenueAdded" />

    <CConfirmationModal
      v-model:is-open="isLeaveConfirmOpen"
      title="Leave without saving?"
      confirm-button-text="Leave"
      cancel-button-text="Stay"
      variant="destructive"
      :on-confirm="() => settleLeave(true)"
    >
      Your changes to this event's program haven't been saved.
    </CConfirmationModal>
  </form>
</template>
