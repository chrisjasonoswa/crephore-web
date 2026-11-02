<script setup lang="ts">
import type { FormContext } from 'vee-validate'
import type { EventFormValues } from './event.form.schema'
import type { CFormSelectOption } from '~/components/custom/c-form/CFormSelectField.vue'
import CFormSelectField from '~/components/custom/c-form/CFormSelectField.vue'
import CFormTextareaField from '~/components/custom/c-form/CFormTextareaField.vue'
import CFormDateTimeField from '~/components/custom/c-form/CFormDateTimeField.vue'
import CFormTextField from '~/components/custom/c-form/CFormTextField.vue'
import { listEventGroups } from '~/features/event-groups/event-group.api'
import { eventTypeLabels, eventTypes } from '~/features/events/event.type'
import { timeZoneOptions } from '~/lib/date'

defineProps<{
  form?: FormContext<EventFormValues>
  viewOnly?: boolean
}>()

const typeOptions: CFormSelectOption[] = eventTypes.map(type => ({ value: type, label: eventTypeLabels[type] }))

// The host's groups to file the event under (optional).
const groupOptions = ref<CFormSelectOption[]>([])
onMounted(async () => {
  const response = await listEventGroups({ page: 1, pageSize: 100, sort: ['name:asc'] })
  groupOptions.value = response.data.items.map(group => ({ value: group.id, label: group.name }))
})

// The event's start and end are entered in this timezone
const timezoneOptions: CFormSelectOption[] = timeZoneOptions()

// Event websites are subdomains of this, e.g. jane-and-john.crephore.com
const siteDomain = useSiteAddress().domain
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid gap-4 sm:grid-cols-2">
      <CFormTextField name="name" label="Name" placeholder="e.g. Ana & Marco's wedding" />
      <CFormSelectField name="type" label="Type" :options="typeOptions" />
    </div>

    <CFormTextareaField name="description" label="Description" placeholder="Optional" :rows="3" />

    <div class="grid gap-4 sm:grid-cols-2">
      <CFormDateTimeField name="startsAt" label="Starts" />
      <CFormDateTimeField name="endsAt" label="Ends" />
      <CFormSelectField name="timezone" label="Timezone" :options="timezoneOptions" class="sm:col-span-2">
        <template #field-info>
          The timezone where the event happens. The times above are in this timezone,
          and your event website shows them with it, e.g. "3:00 PM (Manila, GMT+8)",
          so guests in other countries know it's the venue's time.
        </template>
      </CFormSelectField>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <CFormTextField name="venueName" label="Venue" placeholder="e.g. Taal Vista Hotel" />
      <CFormTextField name="venueAddress" label="Venue address" />
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <CFormTextField name="subdomain" label="Website address" placeholder="jane-and-john">
        <template #field-info>
          The link you share with guests. With <strong>jane-and-john</strong>, guests visit
          <strong>jane-and-john.{{ siteDomain }}</strong>.
          Use 3–63 lowercase letters, numbers and hyphens. Each event needs its own.
        </template>
        <template #description>
          Guests open this link to see your event.
        </template>
        <template #addon-end>
          .{{ siteDomain }}
        </template>
      </CFormTextField>
      <CFormSelectField
        name="eventGroupId"
        label="Group"
        placeholder="No group"
        :options="groupOptions"
        clearable
        clear-label="No group"
      />
    </div>
  </div>
</template>
