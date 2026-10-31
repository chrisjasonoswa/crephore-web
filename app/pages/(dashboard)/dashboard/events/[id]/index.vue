<script setup lang="ts">
import type { CPillTab } from '~/components/custom/c-tabs/CPillTabs.vue'
import type { Event } from '~/features/events/event.type'
import { ArrowLeft, CalendarX } from '@lucide/vue'
import CDateTime from '~/components/custom/c-date-time/CDateTime.vue'
import CPageHeader from '~/components/custom/c-header/CPageHeader.vue'
import CPillTabs from '~/components/custom/c-tabs/CPillTabs.vue'
import { getEvent } from '~/features/events/event.api'
import { browserTimeZone } from '~/lib/date'
import EventDetailsForm from './_components/EventDetailsForm.vue'
import EventGuestsTab from './_components/EventGuestsTab.vue'
import EventWebsiteTab from './_components/EventWebsiteTab.vue'

definePageMeta({ area: 'user' })

// One event: its details, website and guests, one tab each (opened from My events)
const route = useRoute()
const router = useRouter()
const eventId = Number(route.params.id)

const event = ref<Event | null>(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    if (Number.isInteger(eventId) && eventId > 0)
      event.value = (await getEvent(eventId)).data
  }
  catch {
    // Not found or no access; the API client already showed its message
  }
  finally {
    isLoading.value = false
  }
})

// "Dashboard › My events › Ana & Marco's wedding" instead of the id
useBreadcrumbTitle(() => event.value?.name)

const tabs: CPillTab[] = [
  { value: 'details', label: 'Details' },
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

    <Empty v-else-if="!event" class="rounded-xl border border-dashed">
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
          <CDateTime :value="event.startsAt" :end="event.endsAt" :time-zone="event.timezone" :viewer-time-zone="browserTimeZone()" />
          <span v-if="event.venueName"> · {{ event.venueName }}</span>
        </template>
      </CPageHeader>

      <Tabs v-model="activeTab" class="gap-6">
        <CPillTabs :tabs="tabs" label="Event sections" />

        <!-- Details and Website stay mounted so unsaved edits survive switching tabs -->
        <TabsContent value="details" force-mount class="data-[state=inactive]:hidden">
          <EventDetailsForm :event="event" @saved="event = $event" />
        </TabsContent>
        <TabsContent value="website" force-mount class="data-[state=inactive]:hidden">
          <EventWebsiteTab :event="event" />
        </TabsContent>
        <TabsContent value="guests">
          <EventGuestsTab />
        </TabsContent>
      </Tabs>
    </template>
  </div>
</template>
