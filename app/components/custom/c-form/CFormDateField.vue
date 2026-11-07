<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { CalendarIcon, X } from '@lucide/vue'
import { Field as VeeField } from 'vee-validate'
import CFormFieldLabel from './CFormFieldLabel.vue'
import { ref } from 'vue'
import { cn } from '~/lib/utils'

// A vee-validate date field (no time): the shadcn-vue date picker (Calendar in a Popover, with month and year
// dropdowns). The value is a date string ("1948-02-14"), or empty; `clearable` adds a button that empties it.
// `min` / `max` bound the calendar (default: 1900 to today, e.g. dates of birth).
const props = withDefaults(defineProps<{
  name: string
  label?: string
  class?: string
  min?: string
  max?: string
  clearable?: boolean
}>(), {
  min: '1900-01-01',
})

const open = ref(false)

const toCalendarDate = (date: unknown): DateValue | undefined => {
  try {
    return typeof date === 'string' && date ? parseDate(date) : undefined
  }
  catch {
    return undefined
  }
}

const minValue = computed(() => toCalendarDate(props.min))
const maxValue = computed(() => toCalendarDate(props.max) ?? today(getLocalTimeZone()))

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
      <div class="flex gap-2">
        <Popover v-model:open="open" @update:open="(isOpen: boolean) => !isOpen && handleBlur()">
          <PopoverTrigger as-child>
            <Button
              :id="name"
              type="button"
              variant="outline"
              :aria-invalid="!!errors.length"
              :class="cn('min-w-36 flex-1 justify-start font-normal', !value && 'text-muted-foreground')"
            >
              <CalendarIcon />
              {{ value ? formatDate(value) : 'Pick a date' }}
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0" align="start">
            <Calendar
              :model-value="toCalendarDate(value)"
              :default-placeholder="toCalendarDate(value) ?? maxValue"
              :min-value="minValue"
              :max-value="maxValue"
              layout="month-and-year"
              initial-focus
              @update:model-value="(date?: DateValue) => {
                if (!date) return
                handleChange(date.toString(), true)
                open = false
              }"
            />
          </PopoverContent>
        </Popover>
        <Button
          v-if="clearable && value"
          type="button"
          variant="ghost"
          size="icon"
          :aria-label="label ? `Clear ${label.toLowerCase()}` : 'Clear date'"
          @click="handleChange('', !!errors.length)"
        >
          <X />
        </Button>
      </div>
      <!-- One message at a time, like vee-validate's errorMessage -->
      <FieldError v-if="errors.length" :errors="[errors[0]]" />
    </Field>
  </VeeField>
</template>
