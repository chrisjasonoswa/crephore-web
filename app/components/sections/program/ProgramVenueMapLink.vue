<script setup lang="ts">
import type { ProgramVenue } from '~/features/sections/program/program.type'
import { MapPin, X } from '@lucide/vue'
import { venueMapLinks } from '~/features/sections/program/program.helpers'
import { safeHref } from '~/features/sections/section.links'

// A venue's "See map": its map link, opened in a new tab. With both a Google Maps and an Apple Maps link it opens a
// small dialog to pick one; with neither it isn't shown. The links are what the host saved, so they go through
// `safeHref`. `linkClass` styles it to suit the layout (a text link by default). Not a layout.
const props = defineProps<{
  venue: ProgramVenue
  linkClass?: string
}>()
// With both links it renders the button and its dialog, so the layout's classes go on the link or button itself
defineOptions({ inheritAttrs: false })

const links = computed(() => venueMapLinks(props.venue).filter(link => safeHref(link.href)))
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const open = () => dialog.value?.showModal?.()
const close = () => dialog.value?.close?.()
// A click on the backdrop (outside the dialog's box) closes it
function onDialogClick(event: MouseEvent) {
  if (event.target === dialog.value)
    close()
}
</script>

<template>
  <a
    v-if="links.length === 1"
    v-bind="$attrs"
    :href="safeHref(links[0]!.href)"
    target="_blank"
    rel="noopener noreferrer"
    data-venue-map-link
    :class="linkClass ?? 'inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4'"
  >
    <MapPin aria-hidden="true" class="size-4" />See map<span class="sr-only">: {{ venue.name }} in {{ links[0]!.label }} (opens in a new tab)</span>
  </a>
  <template v-else-if="links.length > 1">
    <button
      v-bind="$attrs"
      type="button"
      data-venue-map-link
      aria-haspopup="dialog"
      :class="linkClass ?? 'inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4'"
      @click="open"
    >
      <MapPin aria-hidden="true" class="size-4" />See map<span class="sr-only">: {{ venue.name }}</span>
    </button>
    <dialog
      ref="dialog"
      data-venue-map-dialog
      :aria-label="`Open ${venue.name} in`"
      class="m-auto w-[min(22rem,calc(100%-2rem))] rounded-(--site-radius) bg-(--site-bg) p-0 text-(--site-text) shadow-xl backdrop:bg-black/50"
      @click="onDialogClick"
    >
      <div class="flex flex-col gap-4 p-6">
        <div class="flex items-start justify-between gap-4">
          <p class="font-(family-name:--site-font-heading) text-xl leading-snug text-(--site-primary-text)">
            Open {{ venue.name }} in
          </p>
          <button type="button" class="-mt-1 -mr-2 rounded-full p-1.5 text-(--site-muted) hover:bg-(--site-primary-50)" aria-label="Close" @click="close">
            <X aria-hidden="true" class="size-4" />
          </button>
        </div>
        <div class="flex flex-col gap-2">
          <a
            v-for="link in links"
            :key="link.label"
            :href="safeHref(link.href)"
            target="_blank"
            rel="noopener noreferrer"
            data-venue-map-choice
            class="rounded-(--site-radius) bg-(--site-button-light) px-4 py-3 text-center text-sm font-semibold text-(--site-on-button-light)"
            @click="close"
          >
            {{ link.label }}<span class="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </dialog>
  </template>
</template>
