<script setup lang="ts">
import type { EventGroupFormValues } from './event-group.form.schema'
import type { EventGroup } from '~/features/event-groups/event-group.type'
import { toTypedSchema } from '@vee-validate/zod'
import { LayoutGrid, MoreHorizontal, PanelLeftClose, Pencil, Plus, Trash2 } from '@lucide/vue'
import { useForm } from 'vee-validate'
import CDataTableFormDialog from '~/components/custom/c-data-table/CDataTableFormDialog.vue'
import { addEventGroup, deleteEventGroup, listEventGroups, updateEventGroup } from '~/features/event-groups/event-group.api'
import { eventTypeLabels } from '~/features/events/event.type'
import { cToast } from '~/lib/cToast'
import { cn } from '~/lib/utils'
import EventGroupFormFields from './EventGroupFormFields.vue'
import {
  eventGroupFormInitialValues,
  eventGroupFormSchema,
  mapEventGroupToFormValues,
  mapFormValuesToEventGroupRequest,
} from './event-group.form.schema'

// Left panel of My events: the host's groups. Picking one filters the events table; null is "All events".
defineProps<{
  totalEvents: number
}>()

const emit = defineEmits<{
  close: []
  // A group was added, renamed or deleted (the table shows group names, so it reloads)
  changed: []
}>()

const selected = defineModel<EventGroup | null>('selected', { required: true })

const groups = ref<EventGroup[]>([])
const search = ref('')

const filteredGroups = computed(() => {
  const key = search.value.trim().toLowerCase()
  return key ? groups.value.filter(group => group.name.toLowerCase().includes(key)) : groups.value
})

async function reload() {
  const response = await listEventGroups({ page: 1, pageSize: 100, sort: ['name:asc'] })
  groups.value = response.data.items
  // Keep the selection in sync (renamed), or clear it (deleted)
  if (selected.value)
    selected.value = groups.value.find(group => group.id === selected.value!.id) ?? null
}

onMounted(reload)
defineExpose({ reload })

const occasions = (count: number) => `${count} ${count === 1 ? 'occasion' : 'occasions'}`

// e.g. "Birthday · 1 occasion"; the type is shown when all its events share one
function describe(group: EventGroup) {
  if (!group.events.length)
    return 'No occasions yet'
  const types = new Set(group.events.map(event => event.type))
  const [type] = types
  return types.size === 1 && type ? `${eventTypeLabels[type]} · ${occasions(group.eventCount)}` : occasions(group.eventCount)
}

/* Add, rename and delete through the same dialog as the data tables */
const form = useForm<EventGroupFormValues>({
  validationSchema: toTypedSchema(eventGroupFormSchema),
})
const dialogMode = ref<'add' | 'update' | 'delete'>('add')
const isDialogOpen = ref(false)
const activeGroup = ref<EventGroup | null>(null)

function openDialog(mode: 'add' | 'update' | 'delete', group?: EventGroup) {
  dialogMode.value = mode
  activeGroup.value = group ?? null
  form.resetForm({ values: group ? mapEventGroupToFormValues(group) : { ...eventGroupFormInitialValues } })
  isDialogOpen.value = true
}

async function onSave(values: EventGroupFormValues) {
  const group = activeGroup.value
  if (dialogMode.value === 'add') {
    const response = await addEventGroup(mapFormValuesToEventGroupRequest(values))
    selected.value = response.data
  }
  else if (dialogMode.value === 'update' && group) {
    await updateEventGroup({ id: group.id, ...mapFormValuesToEventGroupRequest(values) })
  }
  else if (dialogMode.value === 'delete' && group) {
    // Its events are kept, just ungrouped
    await deleteEventGroup(group.id)
    if (selected.value?.id === group.id)
      selected.value = null
  }

  isDialogOpen.value = false
  const done = { add: 'added', update: 'updated', delete: 'deleted' }[dialogMode.value]
  cToast({ title: `Event group ${done}.`, type: 'success' })
  await reload()
  emit('changed')
}
</script>

<template>
  <aside class="flex flex-col rounded-xl border bg-card">
    <div class="flex items-center justify-between gap-2 px-4 pt-4">
      <h2 class="text-base font-semibold">
        Event groups
      </h2>
      <div class="flex items-center gap-1">
        <Button type="button" variant="outline" size="icon-sm" aria-label="Add event group" @click="openDialog('add')">
          <Plus />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Hide event groups" @click="emit('close')">
          <PanelLeftClose />
        </Button>
      </div>
    </div>

    <div class="px-4 pt-3">
      <Input v-model="search" placeholder="Search groups..." aria-label="Search groups" />
    </div>

    <!-- Same text size as the app sidebar -->
    <nav class="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 py-3 text-sm" aria-label="Event groups">
      <button
        type="button"
        :class="cn('flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-accent/60', !selected && 'bg-accent')"
        :aria-current="!selected ? 'true' : undefined"
        @click="selected = null"
      >
        <LayoutGrid class="size-4 text-muted-foreground" />
        <span class="flex-1 font-medium">All events</span>
        <span class="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums">{{ totalEvents }}</span>
      </button>

      <p class="px-3 pt-4 pb-1 text-xs font-semibold tracking-wider text-taupe-deep uppercase">
        Groups
      </p>

      <p v-if="!groups.length" class="px-3 text-muted-foreground">
        No groups yet.
      </p>
      <p v-else-if="!filteredGroups.length" class="px-3 text-muted-foreground">
        No groups match “{{ search }}”.
      </p>

      <div v-for="group in filteredGroups" :key="group.id" class="group/item relative">
        <button
          type="button"
          :class="cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-accent/60', selected?.id === group.id && 'bg-accent')"
          :aria-current="selected?.id === group.id ? 'true' : undefined"
          @click="selected = group"
        >
          <span
            :class="cn(
              'flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold',
              selected?.id === group.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground',
            )"
          >
            {{ group.name.charAt(0).toUpperCase() }}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate font-medium">{{ group.name }}</span>
            <span class="block truncate text-xs text-muted-foreground">{{ describe(group) }}</span>
          </span>
          <span
            :class="cn(
              'rounded-full px-2 py-0.5 text-xs tabular-nums transition-opacity group-focus-within/item:opacity-0 group-hover/item:opacity-0',
              selected?.id === group.id ? 'bg-background' : 'bg-muted',
            )"
          >
            {{ group.eventCount }}
          </span>
        </button>

        <!-- Shown on hover/focus in place of the count -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              :aria-label="`Actions for ${group.name}`"
              class="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-focus-within/item:opacity-100 group-hover/item:opacity-100 data-[state=open]:opacity-100"
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @select="openDialog('update', group)">
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" @select="openDialog('delete', group)">
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>

    <p class="border-t px-4 py-3 text-sm text-muted-foreground">
      A group keeps every occasion of the same event together, like a yearly reunion.
    </p>

    <CDataTableFormDialog
      :form="form"
      :form-field-component="EventGroupFormFields"
      :is-open="isDialogOpen"
      max-width="560px"
      resource-name="event group"
      :mode="dialogMode"
      :on-save="onSave"
      :on-open-change="(open: boolean) => (isDialogOpen = open)"
    />
  </aside>
</template>
