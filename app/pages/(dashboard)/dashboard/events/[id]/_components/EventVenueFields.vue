<script setup lang="ts">
import type { EventVenueDraft } from '~/features/event-venues/event-venue.type'
import { LoaderCircle, MapPin } from '@lucide/vue'
import { useDebounceFn } from '@vueuse/core'
import { mapPreviewUrl, pinLinkOf } from '~/features/event-venues/event-venue'
import { getMapPin } from '~/features/event-venues/map-pin.api'
import WebsitePhotoField from './website/WebsitePhotoField.vue'

// One venue's fields, shared by the Venues tab and the Program tab's "Add a venue" dialog: name, address, the Google
// Maps and Apple Maps links (the pin is read from them for the preview and saved with the venue), then the map preview
// beside a photo, and notes for guests (directions, parking, …).
const props = defineProps<{
  eventId: number
  // Each field's error, keyed by field ("name", "googleMapsUrl", …)
  errors?: Record<string, string | undefined>
  disabled?: boolean
}>()

const venue = defineModel<EventVenueDraft>('venue', { required: true })

const id = useId()
const set = <K extends keyof EventVenueDraft>(key: K, value: EventVenueDraft[K]) => (venue.value = { ...venue.value, [key]: value })
const text = (value: string | number | undefined) => String(value ?? '')

/* The pin: read again whenever the link it comes from changes (Google Maps' first, else Apple Maps') */
const pinLink = computed(() => pinLinkOf(venue.value))
const isFindingPin = ref(false)
const pinNotFound = ref(false)
let lookup = 0

const findPin = useDebounceFn(async (link: string | null) => {
  const current = ++lookup
  pinNotFound.value = false
  if (!link) {
    isFindingPin.value = false
    // In one update: two in a row would each start from the venue before the other (the model updates after the
    // parent re-renders), leaving one of them set
    venue.value = { ...venue.value, latitude: null, longitude: null }
    return
  }
  isFindingPin.value = true
  const pin = await getMapPin(link)
  // A newer link was entered meanwhile
  if (current !== lookup)
    return
  isFindingPin.value = false
  pinNotFound.value = !pin
  venue.value = { ...venue.value, latitude: pin?.lat ?? null, longitude: pin?.lng ?? null }
}, 400)

watch(pinLink, link => findPin(link))

const preview = computed(() => venue.value.latitude != null && venue.value.longitude != null
  ? mapPreviewUrl(venue.value.latitude, venue.value.longitude)
  : null)
</script>

<template>
  <fieldset :disabled="disabled" class="flex min-w-0 flex-col gap-4">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-1.5">
        <Label :for="`${id}-name`">Venue name</Label>
        <Input :id="`${id}-name`" :model-value="venue.name" placeholder="e.g. The Manila Hotel" :aria-invalid="!!props.errors?.name" @update:model-value="set('name', text($event))" />
        <p v-if="props.errors?.name" class="text-sm text-destructive">
          {{ props.errors.name }}
        </p>
      </div>
      <div class="flex flex-col gap-1.5">
        <Label :for="`${id}-address`">Address (optional)</Label>
        <Input :id="`${id}-address`" :model-value="venue.address" placeholder="e.g. One Rizal Park, Ermita, Manila" :aria-invalid="!!props.errors?.address" @update:model-value="set('address', text($event))" />
        <p v-if="props.errors?.address" class="text-sm text-destructive">
          {{ props.errors.address }}
        </p>
      </div>
      <div class="flex flex-col gap-1.5">
        <Label :for="`${id}-google`">Google Maps link (optional)</Label>
        <Input :id="`${id}-google`" :model-value="venue.googleMapsUrl" type="url" placeholder="https://maps.app.goo.gl/…" :aria-invalid="!!props.errors?.googleMapsUrl" @update:model-value="set('googleMapsUrl', text($event))" />
        <p v-if="props.errors?.googleMapsUrl" class="text-sm text-destructive">
          {{ props.errors.googleMapsUrl }}
        </p>
        <p v-else class="text-xs text-muted-foreground">
          In Google Maps, open the place, then Share › Copy link.
        </p>
      </div>
      <div class="flex flex-col gap-1.5">
        <Label :for="`${id}-apple`">Apple Maps link (optional)</Label>
        <Input :id="`${id}-apple`" :model-value="venue.appleMapsUrl" type="url" placeholder="https://maps.apple/p/…" :aria-invalid="!!props.errors?.appleMapsUrl" @update:model-value="set('appleMapsUrl', text($event))" />
        <p v-if="props.errors?.appleMapsUrl" class="text-sm text-destructive">
          {{ props.errors.appleMapsUrl }}
        </p>
        <p v-else class="text-xs text-muted-foreground">
          In Apple Maps, open the place, then Share › Copy Link.
        </p>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <!-- gap-2 as the photo field's, so the map and the photo line up -->
      <div class="flex flex-col gap-2">
        <span class="text-sm leading-none font-medium">Map</span>
        <div data-venue-map class="relative h-48 overflow-hidden rounded-lg border bg-muted">
          <iframe
            v-if="preview"
            :src="preview"
            :title="`Map of ${venue.name || 'the venue'}`"
            class="size-full border-0"
            loading="lazy"
            referrerpolicy="no-referrer"
          />
          <div v-else class="flex size-full flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground">
            <LoaderCircle v-if="isFindingPin" class="size-5 animate-spin" aria-hidden="true" />
            <MapPin v-else class="size-5" aria-hidden="true" />
            <span role="status">
              {{ isFindingPin
                ? 'Finding the place…'
                : pinNotFound
                  ? 'Couldn\'t find the place in that link. Copy the link from the place itself (Share › Copy link).'
                  : 'Add a Google Maps or Apple Maps link to see the place here.' }}
            </span>
          </div>
        </div>
      </div>
      <WebsitePhotoField :event-id="eventId" label="Photo (optional)" large :url="venue.photoUrl || undefined" @update:url="set('photoUrl', $event ?? '')" />
    </div>

    <div class="flex flex-col gap-1.5">
      <Label :for="`${id}-notes`">Notes (optional)</Label>
      <Textarea :id="`${id}-notes`" :model-value="venue.notes" rows="3" placeholder="e.g. Enter through the main gate. Free valet at the lobby." :aria-invalid="!!props.errors?.notes" @update:model-value="set('notes', text($event))" />
      <p v-if="props.errors?.notes" class="text-sm text-destructive">
        {{ props.errors.notes }}
      </p>
      <p v-else class="text-xs text-muted-foreground">
        Directions, parking and anything else guests should know about getting there.
      </p>
    </div>
  </fieldset>
</template>
