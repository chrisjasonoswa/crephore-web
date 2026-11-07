<script setup lang="ts">
import type { ProgramVenue } from '~/features/sections/program/program.type'
import { MapPin } from '@lucide/vue'
import { venuePreview } from '~/features/sections/program/program.helpers'
import { usePhotoLoading } from '~/features/sections/section.loading'

// A venue's preview, filling the box its layout gives it: its photo, else Google Maps at its pin (when it has a map
// link), else, when `placeholder` (another venue in the list has a preview, so they all keep the same shape), a
// placeholder: a pin in a round badge over the venue's name, on `tint` (the `avatar` colours of what it sits on: a solid
// soft tint of one brand colour) with the badge in `badge` (`avatarAccent`: the other brand colour), else nothing at
// all. Not a layout.
const props = withDefaults(defineProps<{
  venue: ProgramVenue
  placeholder?: boolean
  tint?: string
  badge?: string
}>(), {
  placeholder: false,
  tint: '',
  badge: '',
})

const preview = computed(() => venuePreview(props.venue))
const loading = usePhotoLoading()
</script>

<template>
  <div v-if="preview" data-venue-preview class="overflow-hidden">
    <img v-if="'photo' in preview" :src="preview.photo" alt="" :loading="loading" decoding="async" class="size-full object-cover">
    <iframe v-else :src="preview.map" :title="`Map of ${venue.name}`" loading="lazy" referrerpolicy="no-referrer" class="size-full border-0" />
  </div>
  <!-- The name is shown under it too, so screen readers skip it -->
  <div
    v-else-if="placeholder"
    data-venue-preview-placeholder
    aria-hidden="true"
    class="flex flex-col items-center justify-center gap-3 overflow-hidden p-4"
    :class="tint"
  >
    <span data-venue-placeholder-badge class="flex size-16 shrink-0 items-center justify-center rounded-full border border-current/40 bg-current/10 @2xl:size-20" :class="badge">
      <MapPin class="size-7 stroke-[1.5] @2xl:size-8" />
    </span>
    <span data-venue-placeholder-name class="max-w-full truncate text-[0.65rem] font-semibold tracking-[0.25em] uppercase">
      {{ venue.name }}
    </span>
  </div>
</template>
