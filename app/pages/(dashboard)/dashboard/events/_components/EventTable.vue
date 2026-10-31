<script setup lang="ts">
import type { EventFormValues } from './event.form.schema'
import type { Event, ListEventsRequest } from '~/features/events/event.type'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import CDataTable from '~/components/custom/c-data-table/CDataTable.vue'
import CDataTableCard from '~/components/custom/c-data-table/CDataTableCard.vue'
import { addEvent, deleteEvent, listEvents } from '~/features/events/event.api'
import EventFormFields from './EventFormFields.vue'
import { eventFormInitialValues, eventFormSchema, mapEventToFormValues, mapFormValuesToEventRequest } from './event.form.schema'
import { eventPagePath, getEventTableColumns } from './event.table.columns'

// The group picked in the groups panel (null: all events). New events go into it by default.
const props = defineProps<{
  eventGroupId: number | null
}>()

const emit = defineEmits<{
  // An event was added, edited or deleted (group counts change)
  changed: []
}>()

const site = useSiteAddress()
const columns = computed(() => getEventTableColumns(site))

const form = useForm<EventFormValues>({
  validationSchema: toTypedSchema(eventFormSchema),
})

const loadEvents = (params: ListEventsRequest) =>
  listEvents({ ...params, eventGroupId: props.eventGroupId ?? undefined })

const addEventPayload = async (payload: EventFormValues) => {
  await addEvent(mapFormValuesToEventRequest(payload))
  emit('changed')
}

const deleteEventPayload = async (id: number) => {
  await deleteEvent(id)
  emit('changed')
}

// Adding is a quick dialog; editing opens the event's page, which also holds its website and guests.
const tableProps = computed(() => ({
  resourceName: 'event',
  dialogMaxWidth: '760px',
  form,
  formInitialValues: { ...eventFormInitialValues, eventGroupId: props.eventGroupId },
  formFieldComponent: EventFormFields,
  columns: columns.value,
  loadItems: loadEvents,
  addItem: addEventPayload,
  onUpdateItemClicked: (event: Event) => navigateTo(eventPagePath(event.id)),
  deleteItem: deleteEventPayload,
  // The delete dialog submits the form, so it needs valid form values
  mapItemToFormValues: mapEventToFormValues,
  defaultPageSize: 20,
}))
</script>

<template>
  <CDataTableCard>
    <CDataTable v-bind="tableProps" />
  </CDataTableCard>
</template>
