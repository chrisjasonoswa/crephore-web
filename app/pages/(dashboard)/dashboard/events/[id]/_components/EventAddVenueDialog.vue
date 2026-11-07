<script setup lang="ts">
import type { EventVenue } from '~/features/event-venues/event-venue.type'
import { blankVenue, mapVenuesToRequest, venueErrors, venueFromApi } from '~/features/event-venues/event-venue'
import { updateEventVenues } from '~/features/event-venues/event-venue.api'
import { getApiErrors } from '~/lib/axios'
import { cToast } from '~/lib/cToast'
import EventVenueFields from './EventVenueFields.vue'

// The Program tab's "Add a venue": every venue field, saved to the event's venues right away (after the saved ones,
// so edits pending in the Venues tab aren't sent), then picked for the item.
const props = defineProps<{
  eventId: number
  // The saved venues
  venues: EventVenue[]
}>()

const emit = defineEmits<{
  // The saved list, and the new venue in it
  added: [venues: EventVenue[], venue: EventVenue]
}>()

const isOpen = defineModel<boolean>('isOpen', { required: true })

const venue = ref(blankVenue())
const isSubmitting = ref(false)
const hasTriedSaving = ref(false)
const serverErrors = ref<Record<string, string[]>>({})

// Start empty each time it opens
watch(isOpen, (open) => {
  if (open) {
    venue.value = blankVenue()
    hasTriedSaving.value = false
    serverErrors.value = {}
  }
})

// Its errors, keyed by field: the new venue is the last in the list sent
const index = computed(() => props.venues.length)
const errors = computed(() => {
  const prefix = `venues[${index.value}].`
  const all = {
    ...Object.fromEntries(Object.entries(serverErrors.value).map(([key, messages]) => [key, messages[0] ?? ''])),
    ...(hasTriedSaving.value ? venueErrors([...props.venues.map(venueFromApi), venue.value]) : {}),
  }
  return Object.fromEntries(Object.entries(all).filter(([key]) => key.startsWith(prefix)).map(([key, message]) => [key.slice(prefix.length), message]))
})

function onVenueUpdate(next: typeof venue.value) {
  venue.value = next
  serverErrors.value = {}
}

async function save() {
  hasTriedSaving.value = true
  if (Object.keys(errors.value).length)
    return
  isSubmitting.value = true
  try {
    const response = await updateEventVenues(props.eventId, mapVenuesToRequest([...props.venues.map(venueFromApi), venue.value]))
    const added = response.data[index.value]
    if (added)
      emit('added', response.data, added)
    isOpen.value = false
    cToast({ title: `${added?.name ?? 'Venue'} added.`, type: 'success' })
  }
  catch (error) {
    serverErrors.value = getApiErrors(error) ?? {}
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Add a venue</DialogTitle>
        <DialogDescription>
          It's saved to your venues right away{{ venues.length ? '' : ' as the main venue' }} and picked for this item.
        </DialogDescription>
      </DialogHeader>
      <form class="flex flex-col gap-6" @submit.prevent="save">
        <EventVenueFields :venue="venue" :event-id="eventId" :errors="errors" @update:venue="onVenueUpdate" />
        <DialogFooter>
          <Button type="button" variant="outline" :disabled="isSubmitting" @click="isOpen = false">
            Cancel
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Adding…' : 'Add venue' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
