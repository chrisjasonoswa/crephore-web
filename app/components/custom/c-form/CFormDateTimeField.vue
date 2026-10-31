<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { parseDate } from '@internationalized/date'
import { CalendarIcon } from '@lucide/vue'
import { Field as VeeField } from 'vee-validate'
import CFormFieldLabel from './CFormFieldLabel.vue'
import { ref } from 'vue'
import { cn } from '~/lib/utils'

// A vee-validate date and time field: the shadcn-vue date picker (Calendar in a Popover) plus a time input.
// The value stays a `datetime-local` string ("2027-06-12T15:00", local time), so schemas and mappers don't change.
const props = defineProps<{
  name: string
  label?: string
  class?: string
}>()

// Used when a date is picked before a time
const DEFAULT_TIME = '12:00'

const open = ref(false)

const splitValue = (value: unknown) => {
  const [date = '', time = ''] = typeof value === 'string' && value ? value.split('T') : []
  return { date, time }
}

const toCalendarDate = (date: string): DateValue | undefined => {
  try {
    return date ? parseDate(date) : undefined
  }
  catch {
    return undefined
  }
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(`${date}T00:00`))
</script>

<template>
  <VeeField v-slot="{ value, errors, handleChange, handleBlur }" :name="name">
    <Field :data-invalid="!!errors.length" :class="props.class">
      <CFormFieldLabel :for-id="name" :label="label">
        <template v-if="$slots['field-info']" #field-info>
          <slot name="field-info" />
        </template>
      </CFormFieldLabel>
      <div class="flex flex-wrap gap-2">
        <Popover v-model:open="open" @update:open="(isOpen: boolean) => !isOpen && handleBlur()">
          <PopoverTrigger as-child>
            <Button
              :id="name"
              type="button"
              variant="outline"
              :aria-invalid="!!errors.length"
              :class="cn('min-w-36 flex-1 justify-start font-normal', !splitValue(value).date && 'text-muted-foreground')"
            >
              <CalendarIcon />
              {{ splitValue(value).date ? formatDate(splitValue(value).date) : 'Pick a date' }}
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0" align="start">
            <Calendar
              :model-value="toCalendarDate(splitValue(value).date)"
              layout="month-and-year"
              initial-focus
              @update:model-value="(date?: DateValue) => {
                if (!date) return
                handleChange(`${date.toString()}T${splitValue(value).time || DEFAULT_TIME}`, true)
                open = false
              }"
            />
          </PopoverContent>
        </Popover>
        <Input
          type="time"
          :aria-label="label ? `${label} time` : 'Time'"
          :aria-invalid="!!errors.length"
          :disabled="!splitValue(value).date"
          :model-value="splitValue(value).time"
          class="w-28 flex-none"
          @update:model-value="(time: string | number) => handleChange(`${splitValue(value).date}T${time}`, !!errors.length)"
          @blur="handleBlur"
        />
      </div>
      <!-- One message at a time, like vee-validate's errorMessage -->
      <FieldError v-if="errors.length" :errors="[errors[0]]" />
    </Field>
  </VeeField>
</template>
