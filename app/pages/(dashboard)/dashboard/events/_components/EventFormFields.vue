<script setup lang="ts">
import type { FormContext } from 'vee-validate'
import type { EventFormValues } from './event.form.schema'
import type { CFormSelectOption } from '~/components/custom/c-form/CFormSelectField.vue'
import CFormSelectField from '~/components/custom/c-form/CFormSelectField.vue'
import { useFormValues } from 'vee-validate'
import CFormDateField from '~/components/custom/c-form/CFormDateField.vue'
import CFormDateTimeField from '~/components/custom/c-form/CFormDateTimeField.vue'
import CFormTextField from '~/components/custom/c-form/CFormTextField.vue'
import { eventTypeLabels, eventTypes } from '~/features/events/event.type'
import { timeZoneOptions } from '~/lib/date'

defineProps<{
  form?: FormContext<EventFormValues>
  viewOnly?: boolean
}>()

// A memorial also has the dates of birth and passing
const values = useFormValues<EventFormValues>()
const isMemorial = computed(() => values.value.type === 'Memorial')

const typeOptions: CFormSelectOption[] = eventTypes.map(type => ({ value: type, label: eventTypeLabels[type] }))

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

    <div v-if="isMemorial" class="grid gap-4 sm:grid-cols-2" data-memorial-fields>
      <CFormDateField name="bornOn" label="Date of birth" clearable>
        <template #field-info>
          Optional. With both dates, your website can show them under the name, e.g. "1938 – 2026", and the memorial
          intros show the years.
        </template>
      </CFormDateField>
      <CFormDateField name="diedOn" label="Date of passing" clearable />
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <CFormDateTimeField name="startsAt" label="Event starts" />
      <CFormDateTimeField name="endsAt" label="Event ends" clearable>
        <template #field-info>
          Optional. Leave it empty when the event has no set end.
        </template>
      </CFormDateTimeField>
      <CFormSelectField name="timezone" label="Timezone" :options="timezoneOptions" class="sm:col-span-2">
        <template #field-info>
          The timezone where the event happens. The times above are in this timezone,
          and your event website shows them with it, e.g. "3:00 PM (Manila, GMT+8)",
          so guests in other countries know it's the venue's time.
        </template>
      </CFormSelectField>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <CFormTextField name="subdomain" label="Website address" placeholder="jane-and-john" class="sm:col-span-2">
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
    </div>
  </div>
</template>
