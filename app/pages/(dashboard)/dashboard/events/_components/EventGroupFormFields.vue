<script setup lang="ts">
import type { FormContext } from 'vee-validate'
import type { EventGroupFormValues } from './event-group.form.schema'
import type { CFormCheckboxOption } from '~/components/custom/c-form/CFormCheckboxListField.vue'
import CFormCheckboxListField from '~/components/custom/c-form/CFormCheckboxListField.vue'
import CFormTextField from '~/components/custom/c-form/CFormTextField.vue'
import { listEvents } from '~/features/events/event.api'
import { formatDateTime } from '~/lib/date'

const props = defineProps<{
  form?: FormContext<EventGroupFormValues>
  viewOnly?: boolean
}>()

// The host's events; ticked ones belong to the group
const eventOptions = ref<CFormCheckboxOption[]>([])
onMounted(async () => {
  const groupId = props.form?.values.id
  const response = await listEvents({ page: 1, pageSize: 100, sort: ['startsAt:asc'] })
  eventOptions.value = response.data.items.map(event => ({
    value: event.id,
    label: event.name,
    description: formatDateTime(event.startsAt, event.timezone),
    // Ticking it moves it here from its current group
    hint: event.eventGroup && event.eventGroup.id !== groupId ? `in ${event.eventGroup.name}` : undefined,
  }))
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <CFormTextField name="name" label="Name" placeholder="e.g. Santos Family Reunion" />
    <CFormCheckboxListField
      name="eventIds"
      label="Events"
      :options="eventOptions"
      search-placeholder="Search events..."
      empty-text="You have no events yet."
    >
      <template #description>
        An event is in one group at a time; ticking one that's in another group moves it here.
      </template>
    </CFormCheckboxListField>
  </div>
</template>
