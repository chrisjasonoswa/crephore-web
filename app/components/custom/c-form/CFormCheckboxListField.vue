<script setup lang="ts">
import { Field as VeeField } from 'vee-validate'
import CFormFieldLabel from './CFormFieldLabel.vue'

export interface CFormCheckboxOption {
  value: number | string
  label: string
  // A second, muted line (e.g. a date)
  description?: string
  // A muted note after the label (e.g. "in Family")
  hint?: string
}

// A vee-validate field holding an array of the checked options' values, with an optional search.
const props = defineProps<{
  name: string
  label?: string
  options: CFormCheckboxOption[]
  searchPlaceholder?: string
  emptyText?: string
  class?: string
}>()

const search = ref('')
const filteredOptions = computed(() => {
  const key = search.value.trim().toLowerCase()
  return key ? props.options.filter(option => option.label.toLowerCase().includes(key)) : props.options
})

const toggle = (values: unknown, value: number | string, checked: boolean) => {
  const current = Array.isArray(values) ? values : []
  return checked ? [...current, value] : current.filter(item => item !== value)
}
</script>

<template>
  <VeeField v-slot="{ value, errors, handleChange }" :name="name">
    <Field :data-invalid="!!errors.length" :class="props.class">
      <CFormFieldLabel :for-id="`${name}-search`" :label="label">
        <template v-if="$slots['field-info']" #field-info>
          <slot name="field-info" />
        </template>
      </CFormFieldLabel>
      <div class="rounded-lg border">
        <div v-if="searchPlaceholder && options.length" class="border-b p-2">
          <Input :id="`${name}-search`" v-model="search" :placeholder="searchPlaceholder" class="h-8" />
        </div>
        <p v-if="!filteredOptions.length" class="px-3 py-4 text-sm text-muted-foreground">
          {{ options.length ? 'No matches.' : (emptyText ?? 'Nothing to choose from.') }}
        </p>
        <ul v-else class="max-h-64 divide-y overflow-y-auto">
          <li v-for="option in filteredOptions" :key="option.value">
            <label class="flex cursor-pointer items-start gap-3 px-3 py-2 text-sm hover:bg-accent/50">
              <Checkbox
                class="mt-0.5"
                :model-value="Array.isArray(value) && value.includes(option.value)"
                @update:model-value="(checked) => handleChange(toggle(value, option.value, checked === true))"
              />
              <span class="min-w-0 flex-1">
                <span class="block truncate">
                  {{ option.label }}
                  <span v-if="option.hint" class="text-xs text-muted-foreground">· {{ option.hint }}</span>
                </span>
                <span v-if="option.description" class="block truncate text-xs text-muted-foreground">{{ option.description }}</span>
              </span>
            </label>
          </li>
        </ul>
      </div>
      <FieldError v-if="errors.length" :errors="[errors[0]]" />
      <FieldDescription v-else-if="$slots.description">
        <slot name="description" />
      </FieldDescription>
    </Field>
  </VeeField>
</template>
