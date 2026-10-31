<script setup lang="ts">
import { Field as VeeField } from 'vee-validate'
import CFormFieldLabel from './CFormFieldLabel.vue'

// A vee-validate multi-line text field with label and error message.
const props = defineProps<{
  name: string
  label?: string
  placeholder?: string
  rows?: number
  class?: string
}>()
</script>

<template>
  <!-- Validates on blur, then on every change once the field shows an error -->
  <VeeField v-slot="{ value, errors, handleChange, handleBlur }" :name="name">
    <Field :data-invalid="!!errors.length" :class="props.class">
      <CFormFieldLabel :for-id="name" :label="label">
        <template v-if="$slots['field-info']" #field-info>
          <slot name="field-info" />
        </template>
      </CFormFieldLabel>
      <Textarea
        :id="name"
        :model-value="value ?? ''"
        :placeholder="placeholder"
        :rows="rows"
        :aria-invalid="!!errors.length"
        @update:model-value="handleChange($event, !!errors.length)"
        @blur="handleBlur"
      />
      <!-- One message at a time, like vee-validate's errorMessage -->
      <FieldError v-if="errors.length" :errors="[errors[0]]" />
    </Field>
  </VeeField>
</template>
