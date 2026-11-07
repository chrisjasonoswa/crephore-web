<script setup lang="ts">
import type { EventProgram } from '~/features/event-programs/event-program.type'
import type { EventVenue, EventVenueDraft } from '~/features/event-venues/event-venue.type'
import type { Event } from '~/features/events/event.type'
import { ChevronDown, MapPin, Plus, Trash2 } from '@lucide/vue'
import { useEventListener } from '@vueuse/core'
import CConfirmationModal from '~/components/custom/c-modal/CConfirmationModal.vue'
import { blankVenue, eventVenuesMax, isSameVenues, mapVenuesToRequest, venueErrors, venueFromApi } from '~/features/event-venues/event-venue'
import { updateEventVenues } from '~/features/event-venues/event-venue.api'
import { moveItem } from '~/features/event-websites/event-website'
import { getApiErrors } from '~/lib/axios'
import { cToast } from '~/lib/cToast'
import EventSaveBar from './EventSaveBar.vue'
import EventVenueFields from './EventVenueFields.vue'

// The Venues tab: where the event happens. One card per venue (open one to edit it); the first is the main venue,
// which the website's hero and intros show. Program items pick from these. Saved with PUT /events/{id}/venues; a
// removed venue's items move to the main venue.
const props = defineProps<{
  event: Event
  venues: EventVenue[]
  // The saved program, to show which items happen at each venue
  program: EventProgram
}>()

const emit = defineEmits<{
  saved: [venues: EventVenue[]]
}>()

const canEdit = computed(() => props.event.access.includes('Owner'))

// The venues as last saved, and the copy being edited
const saved = ref<EventVenueDraft[]>(props.venues.map(venueFromApi))
const draft = ref<EventVenueDraft[]>(props.venues.map(venueFromApi))
const isSubmitting = ref(false)
const isDirty = computed(() => !isSameVenues(draft.value, saved.value))

// Venues added elsewhere (the Program tab's "Add a venue") join the list, and edits here stay
watch(() => props.venues, (venues) => {
  const known = new Set(saved.value.map(venue => venue.savedId))
  const added = venues.filter(venue => !known.has(venue.id)).map(venueFromApi)
  if (!isDirty.value) {
    saved.value = venues.map(venueFromApi)
    draft.value = venues.map(venueFromApi)
  }
  else if (added.length) {
    saved.value = [...saved.value, ...added]
    draft.value = [...draft.value, ...added]
  }
})

/* Errors: the API's rules, checked here once a save was tried; the API's own (keyed the same) until the next edit */
const hasTriedSaving = ref(false)
const serverErrors = ref<Record<string, string[]>>({})
const errors = computed<Record<string, string>>(() => ({
  ...Object.fromEntries(Object.entries(serverErrors.value).map(([key, messages]) => [key, messages[0] ?? ''])),
  ...(hasTriedSaving.value ? venueErrors(draft.value) : {}),
}))
const fieldErrors = (index: number) => Object.fromEntries(Object.entries(errors.value)
  .filter(([key]) => key.startsWith(`venues[${index}].`))
  .map(([key, message]) => [key.slice(`venues[${index}].`.length), message]))
const listError = computed(() => serverErrors.value.venues?.[0])

function setVenues(venues: EventVenueDraft[]) {
  draft.value = venues
  serverErrors.value = {}
}
const setVenue = (index: number, venue: EventVenueDraft) => setVenues(draft.value.map((v, i) => (i === index ? venue : v)))

/* Cards: one open at a time is enough, but several can be */
const open = ref(new Set<string>())
const toggle = (key: string) => {
  const next = new Set(open.value)
  if (!next.delete(key))
    next.add(key)
  open.value = next
}

const canAdd = computed(() => draft.value.length < eventVenuesMax)
function addVenue() {
  const venue = blankVenue()
  setVenues([...draft.value, venue])
  open.value = new Set([...open.value, venue.key])
}
const makeMain = (index: number) => setVenues(moveItem(draft.value, index, 0))

// The saved program's items at each saved venue ("Used by Ceremony, Reception")
const usedBy = (venue: EventVenueDraft) => venue.savedId == null
  ? []
  : props.program.items.filter(item => item.venueId === venue.savedId).map(item => item.title)

/* Removing: its items move to the main venue once saved, so say where */
const removing = ref<number | null>(null)
const isRemoveConfirmOpen = computed({
  get: () => removing.value !== null,
  set: (value: boolean) => {
    if (!value)
      removing.value = null
  },
})
const removingVenue = computed(() => (removing.value === null ? null : draft.value[removing.value] ?? null))
// Where its items go: the main venue, or the next one when it is the main venue
const movesTo = computed(() => draft.value.find((_, i) => i !== removing.value)?.name.trim() || null)
function askRemove(index: number) {
  const venue = draft.value[index]
  if (venue && usedBy(venue).length)
    removing.value = index
  else
    remove(index)
}
function remove(index: number) {
  setVenues(draft.value.filter((_, i) => i !== index))
}

/* Saving */
async function save() {
  hasTriedSaving.value = true
  const problems = venueErrors(draft.value)
  if (Object.keys(problems).length) {
    // Open the cards with a problem so it shows
    const withProblems = draft.value.filter((_, index) => Object.keys(problems).some(key => key.startsWith(`venues[${index}].`)))
    open.value = new Set([...open.value, ...withProblems.map(venue => venue.key)])
    return
  }
  isSubmitting.value = true
  const sent = draft.value
  try {
    const response = await updateEventVenues(props.event.id, mapVenuesToRequest(sent))
    saved.value = response.data.map(venueFromApi)
    // Edits made while saving stay; otherwise the saved venues (with their ids) are the new starting point. New
    // venues get new keys, so their cards are closed after saving.
    if (draft.value === sent)
      draft.value = saved.value
    hasTriedSaving.value = false
    emit('saved', response.data)
    cToast({ title: 'Venues saved.', type: 'success' })
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
watch(isLeaveConfirmOpen, (isOpen) => {
  if (!isOpen)
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

    <div class="flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4 sm:p-6">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold">
          Venues
        </h2>
        <span class="text-xs text-muted-foreground">{{ draft.length }} of {{ eventVenuesMax }}</span>
      </div>
      <p class="-mt-2 text-sm text-muted-foreground">
        Where your event happens. The main venue is the one your website's hero and intro show; each program item picks
        one of these.
      </p>

      <p v-if="listError" class="text-sm text-destructive" role="alert">
        {{ listError }}
      </p>

      <p v-if="!draft.length" class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        No venues yet. Add where your event happens; the first one is the main venue.
      </p>

      <ol class="flex flex-col gap-3" aria-label="Venues">
        <li
          v-for="(venue, index) in draft"
          :key="venue.key"
          data-venue
          class="rounded-lg border bg-background"
          :class="open.has(venue.key) && 'border-primary'"
        >
          <div class="flex flex-wrap items-center gap-3 p-3">
            <span class="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground" aria-hidden="true">
              <MapPin class="size-4" />
            </span>
            <div class="flex min-w-48 flex-1 flex-col gap-0.5">
              <div class="flex flex-wrap items-center gap-2">
                <span data-venue-name class="font-medium">{{ venue.name.trim() || 'New venue' }}</span>
                <Badge v-if="index === 0" data-main-venue>
                  Main venue
                </Badge>
              </div>
              <span v-if="venue.address.trim()" class="text-sm text-muted-foreground">{{ venue.address }}</span>
            </div>
            <span v-if="usedBy(venue).length" class="text-xs text-muted-foreground">
              Used by <span class="font-medium text-foreground">{{ usedBy(venue).join(', ') }}</span>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              :aria-expanded="open.has(venue.key)"
              :aria-label="`${open.has(venue.key) ? 'Close' : 'Edit'} ${venue.name.trim() || 'new venue'}`"
              @click="toggle(venue.key)"
            >
              <ChevronDown class="transition-transform" :class="open.has(venue.key) && 'rotate-180'" />
            </Button>
          </div>

          <div v-if="open.has(venue.key)" class="flex flex-col gap-4 border-t p-3 sm:p-4">
            <EventVenueFields
              :venue="venue"
              :event-id="event.id"
              :errors="fieldErrors(index)"
              :disabled="!canEdit"
              @update:venue="setVenue(index, $event)"
            />
            <div v-if="canEdit" class="flex flex-wrap items-center justify-end gap-2 border-t border-dashed pt-3">
              <Button v-if="index > 0" type="button" variant="ghost" size="sm" @click="makeMain(index)">
                Make main venue
              </Button>
              <Button type="button" variant="ghost" size="sm" class="text-destructive hover:text-destructive" @click="askRemove(index)">
                <Trash2 />
                Remove venue
              </Button>
            </div>
          </div>
        </li>
      </ol>

      <Button v-if="canEdit" type="button" variant="outline" class="w-full border-dashed" :disabled="!canAdd" @click="addVenue">
        <Plus />
        Add a venue
      </Button>
    </div>

    <CConfirmationModal
      v-model:is-open="isRemoveConfirmOpen"
      :title="`Remove ${removingVenue?.name.trim() || 'this venue'}?`"
      confirm-button-text="Remove"
      variant="destructive"
      :on-confirm="() => { if (removing !== null) remove(removing) }"
    >
      <template v-if="removingVenue">
        {{ usedBy(removingVenue).join(', ') }}
        {{ movesTo ? `will move to ${movesTo}` : 'will have no venue' }} when you save.
      </template>
    </CConfirmationModal>

    <CConfirmationModal
      v-model:is-open="isLeaveConfirmOpen"
      title="Leave without saving?"
      confirm-button-text="Leave"
      cancel-button-text="Stay"
      variant="destructive"
      :on-confirm="() => settleLeave(true)"
    >
      Your changes to this event's venues haven't been saved.
    </CConfirmationModal>
  </form>
</template>
