<script setup lang="ts">
import type { EventWebsiteStartChoice } from './EventWebsiteStart.vue'
import type { EventWebsite, EventWebsiteDraft } from '~/features/event-websites/event-website.type'
import type { Event } from '~/features/events/event.type'
import { ArrowLeft, LayoutTemplate, RotateCw, TriangleAlert } from '@lucide/vue'
import { useEventListener } from '@vueuse/core'
import CConfirmationModal from '~/components/custom/c-modal/CConfirmationModal.vue'
import {
  createBlankWebsite,
  isSameWebsite,
  mapWebsiteToRequest,
  websiteFromApi,
  withSavedIds,
} from '~/features/event-websites/event-website'
import {
  deleteEventWebsite,
  getEventWebsite,
  publishEventWebsite,
  unpublishEventWebsite,
  updateEventWebsite,
} from '~/features/event-websites/event-website.api'
import { cToast } from '~/lib/cToast'
import EventWebsiteStart from './EventWebsiteStart.vue'
import WebsiteEditor from './website/WebsiteEditor.vue'

// The Website tab: the saved website in the editor, or (when there is none yet) the choice between a template and
// a blank page. The editor works on a copy; "Save changes" sends the whole website (PUT /events/{id}/website).
// Guests only see it once published, as it was when last published. The template picker is a placeholder for now.
const props = defineProps<{
  event: Event
}>()

const isLoading = ref(true)
const loadFailed = ref(false)
// What the editor shows; null on the start choice
const website = ref<EventWebsiteDraft | null>(null)
// The website as last saved; null when the server has none
const saved = ref<EventWebsiteDraft | null>(null)
const isSaving = ref(false)
const isPickingTemplate = ref(false)

// Publishing, as the server last reported it
const publishedAt = ref<string | null>(null)
const hasUnpublishedChanges = ref(false)
const isPublishing = ref(false)
const siteUrl = computed(() => useSiteAddress().urlOf(props.event.subdomain))

function setPublishState(website: EventWebsite | null) {
  publishedAt.value = website?.publishedAt ?? null
  hasUnpublishedChanges.value = website?.hasUnpublishedChanges ?? false
}

async function load() {
  isLoading.value = true
  loadFailed.value = false
  try {
    const response = await getEventWebsite(props.event.id)
    saved.value = response.data ? websiteFromApi(response.data) : null
    website.value = saved.value
    setPublishState(response.data)
  }
  catch {
    // The API client already showed its message
    loadFailed.value = true
  }
  finally {
    isLoading.value = false
  }
}
onMounted(load)

// A blank page that was never saved has nothing to lose yet
const isDirty = computed(() => !!website.value && !isSameWebsite(website.value, saved.value ?? createBlankWebsite()))

function start(choice: EventWebsiteStartChoice) {
  if (choice === 'blank')
    website.value = createBlankWebsite()
  else
    isPickingTemplate.value = true
}

// Whether it saved; the API client shows why when it didn't
async function save(): Promise<boolean> {
  const sent = website.value
  if (!sent)
    return false

  isSaving.value = true
  try {
    const response = await updateEventWebsite(props.event.id, mapWebsiteToRequest(sent))
    // New sections get their ids; edits made while saving stay unsaved
    saved.value = withSavedIds(sent, sent, response.data)
    if (website.value)
      website.value = withSavedIds(website.value, sent, response.data)
    setPublishState(response.data)
    cToast({ title: 'Website saved.', type: 'success' })
    return true
  }
  catch {
    return false
  }
  finally {
    isSaving.value = false
  }
}

// Unsaved changes are saved first, so guests get what the editor shows
async function publish() {
  if (isDirty.value && !(await save()))
    return

  isPublishing.value = true
  try {
    setPublishState((await publishEventWebsite(props.event.id)).data)
    cToast({
      title: 'Your website is live.',
      description: useSiteAddress().hostOf(props.event.subdomain),
      type: 'success',
      button: { label: 'View', onClick: () => window.open(siteUrl.value, '_blank', 'noopener') },
    })
  }
  catch {
    // The API client already showed its message
  }
  finally {
    isPublishing.value = false
  }
}

// If it fails the confirmation stays open
async function unpublish() {
  setPublishState((await unpublishEventWebsite(props.event.id)).data)
  cToast({ title: 'Your website is no longer public.', type: 'success' })
}

function discard() {
  if (saved.value)
    website.value = saved.value
}

// Back to the start choice; a saved website is deleted first (if that fails the confirmation stays open)
async function startOver() {
  if (saved.value)
    await deleteEventWebsite(props.event.id)
  saved.value = null
  website.value = null
  setPublishState(null)
  isPickingTemplate.value = false
}

/* Unsaved changes: ask before leaving the page (switching tabs keeps them) */
const isLeaveConfirmOpen = ref(false)
let resolveLeave: ((leave: boolean) => void) | null = null

function settleLeave(leave: boolean) {
  resolveLeave?.(leave)
  resolveLeave = null
}

onBeforeRouteLeave(() => {
  if (!isDirty.value || isSaving.value || isPublishing.value)
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
  <div v-if="isLoading" class="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]" aria-busy="true">
    <Skeleton class="h-14 rounded-xl xl:col-span-2" />
    <Skeleton class="h-96 rounded-xl" />
    <Skeleton class="h-96 rounded-xl" />
  </div>

  <Empty v-else-if="loadFailed" class="rounded-xl border border-dashed">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <TriangleAlert />
      </EmptyMedia>
      <EmptyTitle>Couldn't load the website</EmptyTitle>
      <EmptyDescription>
        Check your connection and try again.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button variant="outline" @click="load">
        <RotateCw />
        Try again
      </Button>
    </EmptyContent>
  </Empty>

  <WebsiteEditor
    v-else-if="website"
    v-model:website="website"
    :event="event"
    :is-saved="!!saved"
    :is-dirty="isDirty"
    :is-saving="isSaving"
    :published-at="publishedAt"
    :has-unpublished-changes="hasUnpublishedChanges"
    :is-publishing="isPublishing"
    :site-url="siteUrl"
    :on-start-over="startOver"
    :on-unpublish="unpublish"
    @save="save"
    @discard="discard"
    @publish="publish"
  />

  <Empty v-else-if="isPickingTemplate" class="rounded-xl border border-dashed">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <LayoutTemplate />
      </EmptyMedia>
      <EmptyTitle>Templates</EmptyTitle>
      <EmptyDescription>
        Pick a ready-made design for your event. Coming soon.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button variant="outline" @click="isPickingTemplate = false">
        <ArrowLeft />
        Back
      </Button>
    </EmptyContent>
  </Empty>

  <EventWebsiteStart v-else :event="event" @start="start" />

  <CConfirmationModal
    v-model:is-open="isLeaveConfirmOpen"
    title="Leave without saving?"
    confirm-button-text="Leave"
    cancel-button-text="Stay"
    variant="destructive"
    :on-confirm="() => settleLeave(true)"
  >
    Your changes to this event's website haven't been saved.
  </CConfirmationModal>
</template>
