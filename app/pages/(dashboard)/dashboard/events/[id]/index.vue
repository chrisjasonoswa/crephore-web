<script setup lang="ts">
import type { CPillTab } from '~/components/custom/c-tabs/CPillTabs.vue'
import type { EventProgram } from '~/features/event-programs/event-program.type'
import type { EventVenue } from '~/features/event-venues/event-venue.type'
import type { Event } from '~/features/events/event.type'
import { ArrowLeft, CalendarX } from '@lucide/vue'
import CDateTime from '~/components/custom/c-date-time/CDateTime.vue'
import CPageHeader from '~/components/custom/c-header/CPageHeader.vue'
import CPillTabs from '~/components/custom/c-tabs/CPillTabs.vue'
import { sectionProgram } from '~/features/event-programs/event-program'
import { getEventProgram } from '~/features/event-programs/event-program.api'
import { getEventVenues } from '~/features/event-venues/event-venue.api'
import { getEvent } from '~/features/events/event.api'
import { browserTimeZone } from '~/lib/date'
import EventDetailsForm from './_components/EventDetailsForm.vue'
import EventGuestsTab from './_components/EventGuestsTab.vue'
import EventProgramTab from './_components/EventProgramTab.vue'
import EventVenuesTab from './_components/EventVenuesTab.vue'
import EventWebsiteTab from './_components/EventWebsiteTab.vue'

definePageMeta({ area: 'user' })

// One event: its details, venues, program, website and guests, one tab each (opened from My events)
const route = useRoute()
const router = useRouter()
const eventId = Number(route.params.id)

const event = ref<Event | null>(null)
// The saved program: edited in the Program tab, shown by the website's program sections
const program = ref<EventProgram | null>(null)
// The saved venues, in order (the first is the main venue): edited in the Venues tab, picked by program items
const venues = ref<EventVenue[] | null>(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    if (Number.isInteger(eventId) && eventId > 0) {
      const [eventResponse, programResponse, venuesResponse] = await Promise.all([getEvent(eventId), getEventProgram(eventId), getEventVenues(eventId)])
      program.value = programResponse.data
      venues.value = venuesResponse.data
      event.value = eventResponse.data
    }
  }
  catch {
    // Not found or no access; the API client already showed its message
  }
  finally {
    isLoading.value = false
  }
})

// The program as the website's sections show it, with its venues' names
const websiteProgram = computed(() => (program.value && venues.value ? sectionProgram(program.value, venues.value) : { items: [], venues: [] }))

// Saved venues (from the Venues tab or the Program tab's "Add a venue"): the main venue names the event, and a removed
// venue's items moved to the new main venue, so the program is read again
async function onVenuesSaved(saved: EventVenue[]) {
  const removed = venues.value?.some(venue => !saved.some(s => s.id === venue.id))
  venues.value = saved
  if (event.value)
    event.value = { ...event.value, venueName: saved[0]?.name ?? '' }
  if (removed) {
    try {
      program.value = (await getEventProgram(eventId)).data
    }
    catch {
      // The API client already showed its message; the Program tab keeps what it had
    }
  }
}

// "Dashboard › My events › Ana & Marco's wedding" instead of the id
useBreadcrumbTitle(() => event.value?.name)

const tabs: CPillTab[] = [
  { value: 'details', label: 'Details' },
  { value: 'venues', label: 'Venues' },
  { value: 'program', label: 'Program' },
  { value: 'website', label: 'Website' },
  { value: 'guests', label: 'Guests & RSVP' },
]

// Kept in the URL (?tab=website) so a tab can be linked and survives a reload; Details has none
const activeTab = computed({
  get: () => tabs.find(tab => tab.value === route.query.tab)?.value ?? 'details',
  set: (value: string) => router.replace({ query: { ...route.query, tab: value === 'details' ? undefined : value } }),
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <Button variant="ghost" size="sm" class="-ml-2 self-start text-muted-foreground" as-child>
      <NuxtLink to="/dashboard/events">
        <ArrowLeft />
        My events
      </NuxtLink>
    </Button>

    <div v-if="isLoading" class="flex flex-col gap-6" aria-busy="true">
      <div class="flex flex-col gap-2">
        <Skeleton class="h-9 w-72 max-w-full" />
        <Skeleton class="h-5 w-96 max-w-full" />
      </div>
      <Skeleton class="h-9 w-80 max-w-full rounded-full" />
      <Skeleton class="h-96 rounded-xl" />
    </div>

    <Empty v-else-if="!event || !program || !venues" class="rounded-xl border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CalendarX />
        </EmptyMedia>
        <EmptyTitle>Event not found</EmptyTitle>
        <EmptyDescription>
          It may have been deleted, or you don't have access to it.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button as-child>
          <NuxtLink to="/dashboard/events">Back to My events</NuxtLink>
        </Button>
      </EmptyContent>
    </Empty>

    <template v-else>
      <CPageHeader :title="event.name">
        <template #description>
          <CDateTime :value="event.startsAt" :end="event.endsAt ?? undefined" :time-zone="event.timezone" :viewer-time-zone="browserTimeZone()" />
          <span v-if="event.venueName"> · {{ event.venueName }}</span>
        </template>
      </CPageHeader>

      <Tabs v-model="activeTab" class="gap-6">
        <CPillTabs :tabs="tabs" label="Event sections" />

        <!-- Details, Venues, Program and Website stay mounted so unsaved edits survive switching tabs -->
        <TabsContent value="details" force-mount class="data-[state=inactive]:hidden">
          <EventDetailsForm :event="event" @saved="event = $event" />
        </TabsContent>
        <TabsContent value="venues" force-mount class="data-[state=inactive]:hidden">
          <EventVenuesTab :event="event" :venues="venues" :program="program" @saved="onVenuesSaved" />
        </TabsContent>
        <TabsContent value="program" force-mount class="data-[state=inactive]:hidden">
          <EventProgramTab :event="event" :program="program" :venues="venues" @saved="program = $event" @venues-saved="onVenuesSaved" />
        </TabsContent>
        <TabsContent value="website" force-mount class="data-[state=inactive]:hidden">
          <EventWebsiteTab :event="event" :program="websiteProgram" />
        </TabsContent>
        <TabsContent value="guests">
          <EventGuestsTab />
        </TabsContent>
      </Tabs>
    </template>
  </div>
</template>
