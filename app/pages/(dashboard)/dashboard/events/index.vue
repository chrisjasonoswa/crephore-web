<script setup lang="ts">
import type { EventGroup } from '~/features/event-groups/event-group.type'
import { PanelLeftOpen, X } from '@lucide/vue'
import { useLocalStorage } from '@vueuse/core'
import CPageHeader from '~/components/custom/c-header/CPageHeader.vue'
import { listEvents } from '~/features/events/event.api'
import EventGroupsPanel from './_components/EventGroupsPanel.vue'
import EventTable from './_components/EventTable.vue'

definePageMeta({ area: 'user' })

// Events and their groups on one page: the groups panel filters the table
const selectedGroup = ref<EventGroup | null>(null)
// Remembered per browser (a convenience; open by default)
const isGroupsPanelOpen = useLocalStorage('crephore:events:groups-panel-open', true)

const groupsPanel = useTemplateRef<InstanceType<typeof EventGroupsPanel>>('groupsPanel')

// For "All events" in the panel
const totalEvents = ref(0)
async function loadTotalEvents() {
  totalEvents.value = (await listEvents({ page: 1, pageSize: 1, sort: [] })).data.totalCount
}
onMounted(loadTotalEvents)

// Bumped to reload the table when groups change (it shows group names)
const tableVersion = ref(0)

async function onEventsChanged() {
  await Promise.all([loadTotalEvents(), groupsPanel.value?.reload()])
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <CPageHeader title="My events" description="Create and manage your events, and group the ones that belong together." />

    <div class="flex flex-col gap-4 lg:flex-row lg:items-start">
      <EventGroupsPanel
        v-if="isGroupsPanelOpen"
        ref="groupsPanel"
        v-model:selected="selectedGroup"
        :total-events="totalEvents"
        class="max-h-96 lg:sticky lg:top-4 lg:h-[calc(100svh-12rem)] lg:max-h-none lg:w-72 lg:shrink-0"
        @close="isGroupsPanelOpen = false"
        @changed="tableVersion++"
      />

      <div class="flex min-w-0 flex-1 flex-col gap-3">
        <div v-if="!isGroupsPanelOpen || selectedGroup" class="flex flex-wrap items-center gap-2">
          <Button v-if="!isGroupsPanelOpen" type="button" variant="outline" size="sm" @click="isGroupsPanelOpen = true">
            <PanelLeftOpen />
            View groups
          </Button>
          <!-- Which group the table shows, also when the panel is hidden -->
          <span v-if="selectedGroup" class="inline-flex items-center gap-1 rounded-full bg-accent py-1 pr-1 pl-3 text-sm">
            {{ selectedGroup.name }}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              class="size-6 rounded-full"
              :aria-label="`Show all events instead of ${selectedGroup.name}`"
              @click="selectedGroup = null"
            >
              <X />
            </Button>
          </span>
        </div>

        <!-- Re-created per group (and after group changes) so it starts on page 1 with that filter -->
        <EventTable
          :key="`${selectedGroup?.id ?? 'all'}-${tableVersion}`"
          :event-group-id="selectedGroup?.id ?? null"
          @changed="onEventsChanged"
        />
      </div>
    </div>
  </div>
</template>
