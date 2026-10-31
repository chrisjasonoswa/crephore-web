<script setup lang="ts">
import { Field as VeeField } from 'vee-validate'
import CFormFieldLabel from './CFormFieldLabel.vue'

export interface CFormSelectOption {
  value: string | number
  label: string
}

// A vee-validate select with label and error message.
// `clearable` adds an option for "no value" (sent as null).
const props = defineProps<{
  name: string
  label?: string
  placeholder?: string
  options: CFormSelectOption[]
  clearable?: boolean
  clearLabel?: string
  class?: string
}>()

// Select values are strings; map back to the option's own value (number or string).
const NONE = '__none__'
const toSelectValue = (value: unknown) => (value === null || value === undefined || value === '' ? (props.clearable ? NONE : undefined) : String(value))
const fromSelectValue = (value: unknown) => {
  if (value === NONE)
    return null
  return props.options.find(option => String(option.value) === value)?.value ?? null
}
</script>

<template>
  <VeeField v-slot="{ value, errors, handleChange }" :name="name">
    <Field :data-invalid="!!errors.length" :class="props.class">
      <CFormFieldLabel :for-id="name" :label="label">
        <template v-if="$slots['field-info']" #field-info>
          <slot name="field-info" />
        </template>
      </CFormFieldLabel>
      <Select :model-value="toSelectValue(value)" @update:model-value="handleChange(fromSelectValue($event))">
        <SelectTrigger :id="name" class="w-full" :aria-invalid="!!errors.length">
          <SelectValue :placeholder="placeholder" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-if="clearable" :value="NONE">
            {{ clearLabel ?? 'None' }}
          </SelectItem>
          <SelectItem v-for="option in options" :key="option.value" :value="String(option.value)">
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
      <FieldError v-if="errors.length" :errors="[errors[0]]" />
    </Field>
  </VeeField>
</template>
